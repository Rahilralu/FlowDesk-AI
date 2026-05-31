import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();
const prisma = new PrismaClient();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  const name = await ask('Name: ');
  const email = await ask('Email: ');
  const password = await ask('Password: ');
  const role = await ask('Role (ADMIN/AGENT): ');

  if (!['ADMIN', 'AGENT'].includes(role.toUpperCase())) {
    console.error('Invalid role. Must be ADMIN or AGENT.');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('⚠️  User with this email already exists.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role.toUpperCase() },
  });

  console.log(`✅ Created ${user.role}: ${user.email} (id: ${user.id})`);
  rl.close();
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());