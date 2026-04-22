import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin EduStore',
      email: 'admin@edustore.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create User
  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@gmail.com',
      password: userPassword,
      role: 'USER',
    },
  });

  // Categories
  const catBuku = await prisma.category.create({ data: { name: 'Buku & Kertas' } });
  const catTulis = await prisma.category.create({ data: { name: 'Alat Tulis' } });
  const catTas = await prisma.category.create({ data: { name: 'Tas & Aksesoris' } });

  // Products
  const products = [
    {
      name: 'Buku Tulis Sidu 38 Lembar (10 Buku)',
      price: 45000,
      stock: 50,
      categoryId: catBuku.id,
      image: 'https://picsum.photos/seed/books1/400/400',
    },
    {
      name: 'Pensil 2B Faber-Castell',
      price: 5000,
      stock: 100,
      categoryId: catTulis.id,
      image: 'https://picsum.photos/seed/pencil1/400/400',
    },
    {
      name: 'Pulpen Gel Zebra Sarasa Black 0.5',
      price: 15000,
      stock: 80,
      categoryId: catTulis.id,
      image: 'https://picsum.photos/seed/pen1/400/400',
    },
    {
      name: 'Tas Ransel Sekolah Waterproof Blue',
      price: 185000,
      stock: 20,
      categoryId: catTas.id,
      image: 'https://picsum.photos/seed/bag1/400/400',
    },
    {
      name: 'Kotak Pensil Karakter Avengers',
      price: 35000,
      stock: 40,
      categoryId: catTas.id,
      image: 'https://picsum.photos/seed/pencilcase/400/400',
    },
    {
      name: 'Penggaris Besi 30cm',
      price: 8000,
      stock: 60,
      categoryId: catTulis.id,
      image: 'https://picsum.photos/seed/ruler/400/400',
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
