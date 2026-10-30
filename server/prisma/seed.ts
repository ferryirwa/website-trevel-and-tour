import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@aikbukak.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@aikbukak.com',
      passwordHash,
      role: 'SUPER',
    },
  });
  console.log('✅ Admin: admin@aikbukak.com / admin123');

  // Tour types
  const types = [
    { nameEn: 'Adventure', nameId: 'Petualangan', slug: 'adventure' },
    { nameEn: 'Cultural', nameId: 'Budaya', slug: 'cultural' },
    { nameEn: 'Nature', nameId: 'Alam', slug: 'nature' },
    { nameEn: 'Family', nameId: 'Keluarga', slug: 'family' },
    { nameEn: 'Hiking', nameId: 'Hiking', slug: 'hiking' },
  ];
  for (const t of types) {
    await prisma.tourType.upsert({ where: { slug: t.slug }, update: {}, create: t });
  }
  console.log('✅ Tour types:', types.length);

  // Locations
  const locations = [
    { name: 'Aik Bukak Area', slug: 'aik-bukak-area', description: 'Main waterfall area' },
    { name: 'North Lombok', slug: 'north-lombok', description: 'North region' },
    { name: 'Waterfall Trail', slug: 'waterfall-trail', description: 'Trekking trail' },
  ];
  for (const l of locations) {
    await prisma.location.upsert({ where: { slug: l.slug }, update: {}, create: l });
  }
  console.log('✅ Locations:', locations.length);

  console.log('🎉 Seeding selesai!');
  await seedPackages();
  await seedPublicContent();
}

async function seedPackages() {
  const [adventure, cultural, nature, aikBukak, trail] = await Promise.all([
    prisma.tourType.findUniqueOrThrow({ where: { slug: 'adventure' } }),
    prisma.tourType.findUniqueOrThrow({ where: { slug: 'cultural' } }),
    prisma.tourType.findUniqueOrThrow({ where: { slug: 'nature' } }),
    prisma.location.findUniqueOrThrow({ where: { slug: 'aik-bukak-area' } }),
    prisma.location.findUniqueOrThrow({ where: { slug: 'waterfall-trail' } }),
  ]);
  const tours = [
    { slug: 'waterfall-adventure', nameEn: 'Waterfall Adventure', nameId: 'Waterfall Adventure', descriptionEn: 'A guided forest trek to Aik Bukak’s refreshing natural spring.', descriptionId: 'A guided forest trek to Aik Bukak’s refreshing natural spring.', durationHours: 3, price: 45, maxGuests: 12, typeId: adventure.id, locationId: trail.id },
    { slug: 'lombok-culture-walk', nameEn: 'Lombok Culture Walk', nameId: 'Lombok Culture Walk', descriptionEn: 'Meet local communities and discover the stories of Aik Bukak.', descriptionId: 'Meet local communities and discover the stories of Aik Bukak.', durationHours: 2, price: 35, maxGuests: 10, typeId: cultural.id, locationId: aikBukak.id },
    { slug: 'family-nature-escape', nameEn: 'Family Nature Escape', nameId: 'Family Nature Escape', descriptionEn: 'A relaxed outdoor experience designed for families.', descriptionId: 'A relaxed outdoor experience designed for families.', durationHours: 2, price: 25, maxGuests: 16, typeId: nature.id, locationId: aikBukak.id },
  ];
  for (const tour of tours) {
    await prisma.package.upsert({ where: { slug: tour.slug }, update: { ...tour, status: 'ACTIVE' }, create: { ...tour, status: 'ACTIVE', media: { create: { url: 'https://images.unsplash.com/photo-1541868615250-7e00328bd3b3?w=1200&q=80', type: 'IMAGE' } } } });
  }
}

async function seedPublicContent() {
  const [galleryCount, ratingsCount] = await Promise.all([
    prisma.gallery.count(),
    prisma.ratingSnapshot.count(),
  ]);

  if (galleryCount === 0) {
    await prisma.gallery.createMany({
      data: [
        { url: 'https://images.unsplash.com/photo-1541868615250-7e00328bd3b3?w=1200&q=85', category: 'NATURE', caption: 'A refreshing natural escape in Aik Bukak.' },
        { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85', category: 'ACTIVITY', caption: 'Explore Lombok with a local guide.' },
        { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85', category: 'NATURE', caption: 'Forest trails and mountain views.' },
        { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=85', category: 'FACILITY', caption: 'A peaceful setting surrounded by forest.' },
      ],
    });
  }

  if (ratingsCount === 0) {
    await prisma.ratingSnapshot.createMany({
      data: [
        { source: 'GOOGLE', score: 4.8, totalReviews: 1800 },
        { source: 'TRIPADVISOR', score: 4.7, totalReviews: 700 },
      ],
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
