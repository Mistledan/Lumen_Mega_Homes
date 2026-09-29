import {prisma} from '../src/db';
import {hashPassword} from '../src/security';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'obmilnetworks@hotmail.com';
  const password = process.env.ADMIN_PASSWORD || 'Kingolaolu';
  const hash = hashPassword(password);
  await prisma.adminUser.upsert({where: {email}, update: {passwordHash: hash, name: 'Site Administrator'}, create: {email, passwordHash: hash, name: 'Site Administrator'}});
  const others = await prisma.adminUser.deleteMany({where: {email: {not: email}}});
  console.log(`admin set to ${email}; legacy admin rows removed: ${others.count}`);
}

main().finally(() => prisma.$disconnect());