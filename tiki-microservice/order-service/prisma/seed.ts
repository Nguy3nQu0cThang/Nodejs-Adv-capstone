import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Order database...');

  // Create sample address for user_id = 1
  await prisma.address.upsert({
    where: { address_id: 1 },
    update: {},
    create: {
      user_id: 1,
      full_name: 'Nguyễn Văn A',
      phone: '0901234567',
      province: 'Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      street: '123 Đường Lê Lợi',
      is_default: true,
    },
  });

  console.log('✅ Address created');
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });