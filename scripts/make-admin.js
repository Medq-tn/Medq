// Interactive admin picker: lists users and lets you promote one to admin by email
// Usage:
//   node scripts/make-admin.js            # interactive
//   node scripts/make-admin.js --list     # list only
//   node scripts/make-admin.js --email user@example.com  # non-interactive promote by email

const readline = require('readline');
const path = require('path');
// Load env from .env.local first, then .env
try { require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') }); } catch {}
try { require('dotenv').config(); } catch {}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      status: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!users.length) {
    console.log('❌ Aucun utilisateur trouvé.');
    return [];
  }
  console.log(`\n📊 ${users.length} utilisateur(s):\n`);
  users.forEach((u, i) => {
    const created = u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt);
    console.log(`${i + 1}. ${u.email}  [${u.role}]  (${created})${u.status ? `  status:${u.status}` : ''}`);
  });
  return users;
}

async function promoteByEmail(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
    return false;
  }
  if (user.role === 'admin') {
    console.log(`✅ ${email} est déjà admin.`);
    return true;
  }
  const updated = await prisma.user.update({ where: { id: user.id }, data: { role: 'admin' } });
  console.log(`✅ ${updated.email} est maintenant admin !`);
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const listOnly = args.includes('--list');
  const emailArgIndex = args.indexOf('--email');
  const emailArg = emailArgIndex >= 0 ? args[emailArgIndex + 1] : null;

  try {
    if (emailArg) {
      await promoteByEmail(emailArg);
      return;
    }

    const users = await listUsers();
    if (!users.length || listOnly) return;

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (q) => new Promise((res) => rl.question(q, res));

    let email = (await question('\nEntrez l\'email à promouvoir (copier/coller depuis la liste) : ')).trim();
    if (!email) {
      console.log('⏭️  Aucun email fourni, abandon.');
      rl.close();
      return;
    }

    // Confirm
    const confirm = (await question(`\nConfirmer la promotion de ${email} en admin ? (o/N) `)).trim().toLowerCase();
    if (confirm !== 'o' && confirm !== 'oui' && confirm !== 'y' && confirm !== 'yes') {
      console.log('🚫 Opération annulée.');
      rl.close();
      return;
    }

    rl.close();
    await promoteByEmail(email);
  } catch (err) {
    console.error('❌ Erreur:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
