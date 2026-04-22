import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

app.use(express.json());

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Create uploads directory if not exists
import fs from 'fs';
if (!fs.existsSync('public/uploads')) {
  fs.mkdirSync('public/uploads', { recursive: true });
}

// Middleware to verify JWT
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminMiddleware = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admin only' });
  }
  next();
};

// --- API ROUTES ---

// AUTH
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'USER' },
    });
    // Create cart for user
    await prisma.cart.create({ data: { userId: user.id } });
    res.json({ message: 'Registration successful' });
  } catch (err) {
    res.status(400).json({ message: 'Email already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// PRODUCTS
app.get('/api/products', async (req, res) => {
  const { categoryId, search } = req.query;
  const products = await prisma.product.findMany({
    where: {
      AND: [
        categoryId ? { categoryId: String(categoryId) } : {},
        search ? { name: { contains: String(search) } } : {},
      ],
    },
    include: { category: true },
  });
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// CATEGORIES
app.get('/api/categories', async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

// ADMIN PRODUCT CRUD
app.post('/api/admin/products', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  const { name, price, stock, categoryId } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const parsedStock = parseInt(stock);
  const product = await prisma.product.create({
    data: {
      name,
      price: parseFloat(price),
      stock: parsedStock,
      categoryId,
      image,
      stockHistories: {
        create: {
          change: parsedStock,
          type: 'INITIAL',
          note: 'Initial stock on creation',
        }
      }
    },
  });
  res.json(product);
});

app.put('/api/admin/products/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  const { name, price, stock, categoryId } = req.body;
  const productId = req.params.id;
  const parsedStock = parseInt(stock);
  
  const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
  if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

  const data: any = {
    name,
    price: parseFloat(price),
    stock: parsedStock,
    categoryId,
  };
  if (req.file) {
    data.image = `/uploads/${req.file.filename}`;
  }

  const stockChange = parsedStock - existingProduct.stock;
  
  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...data,
      ...(stockChange !== 0 ? {
        stockHistories: {
          create: {
            change: stockChange,
            type: 'ADJUSTMENT',
            note: 'Manual stock adjustment via edit',
          }
        }
      } : {})
    },
  });
  res.json(product);
});

app.post('/api/admin/products/:id/restock', authMiddleware, adminMiddleware, async (req, res) => {
  const { amount, note } = req.body;
  const productId = req.params.id;
  const changeAmount = parseInt(amount);

  if (isNaN(changeAmount)) return res.status(400).json({ message: 'Invalid amount' });

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: { increment: changeAmount },
        stockHistories: {
          create: {
            change: changeAmount,
            type: 'RESTOCK',
            note: note || 'Restock via incremental update',
          }
        }
      }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update stock' });
  }
});

app.get('/api/admin/products/:id/stock-history', authMiddleware, adminMiddleware, async (req, res) => {
  const history = await prisma.stockHistory.findMany({
    where: { productId: req.params.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(history);
});

app.delete('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: 'Product deleted' });
});

// CART
app.get('/api/cart', authMiddleware, async (req: any, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
  });
  res.json(cart);
});

app.post('/api/cart/add', authMiddleware, async (req: any, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: quantity || 1 },
      });
    }
    res.json({ message: 'Added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/cart/remove/:id', authMiddleware, async (req, res) => {
  await prisma.cartItem.delete({ where: { id: req.params.id } });
  res.json({ message: 'Item removed' });
});

app.put('/api/cart/update/:id', authMiddleware, async (req, res) => {
  const { quantity } = req.body;
  if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });
  
  try {
    await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity: parseInt(quantity) },
    });
    res.json({ message: 'Quantity updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update quantity' });
  }
});

// ORDERS
app.post('/api/orders/checkout', authMiddleware, async (req: any, res) => {
  const { customer_name, address, phone } = req.body;
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      total,
      status: 'PENDING',
      customer_name,
      address,
      phone,
      items: {
        create: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
  });

  // Reduce stock and log history
  for (const item of cart.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity },
        stockHistories: {
          create: {
            change: -item.quantity,
            type: 'SALE',
            note: `Order #${order.id}`,
          }
        }
      }
    });
  }

  // Clear cart
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  res.json(order);
});

app.patch('/api/orders/:id/pay', authMiddleware, async (req, res) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status: 'PAID',
      paid_at: new Date(),
    },
  });
  res.json(order);
});

app.get('/api/orders/history', authMiddleware, async (req: any, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } }, user: true },
  });
  res.json(order);
});

// ADMIN ORDERS
app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

// ADMIN CATEGORIES
app.post('/api/admin/categories', authMiddleware, adminMiddleware, async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.create({ data: { name } });
  res.json(category);
});

app.put('/api/admin/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { name },
  });
  res.json(category);
});

app.delete('/api/admin/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ message: 'Category deleted' });
});

// ADMIN USERS
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });
  res.json(users);
});

app.post('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });
  await prisma.cart.create({ data: { userId: user.id } });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.put('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, role, password } = req.body;
  const data: any = { name, email, role };
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
  });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
});

// --- VITE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
