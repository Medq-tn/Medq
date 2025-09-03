const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function manageUsers() {
  try {
    console.log('👥 Checking users in database...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        profileCompleted: true,
        hasActiveSubscription: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in the database.');
      console.log('💡 Create a user account first by registering in the app.');
      return;
    }

    console.log(`📊 Found ${users.length} user(s):\n`);

    // Display all users
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.name || 'Not set'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Profile Complete: ${user.profileCompleted}`);
      console.log(`   Subscription: ${user.hasActiveSubscription ? 'Active' : 'Inactive'}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log(`   ID: ${user.id}\n`);
    });

    // Check if there's already an admin
    const adminUsers = users.filter(user => user.role === 'admin');
    if (adminUsers.length > 0) {
      console.log(`👑 Admin user(s) found: ${adminUsers.map(u => u.email).join(', ')}\n`);
    } else {
      console.log('❗ No admin users found.\n');
    }

    // Interactive part - ask which user to make admin
    if (users.length > 0) {
      console.log('🔧 To make a user admin, uncomment and modify the code below:');
      console.log('');
      console.log('// Uncomment the following lines and replace EMAIL with the actual email:');
      console.log('/*');
      console.log('const emailToMakeAdmin = "user@example.com"; // Replace with actual email');
      console.log('const userToUpdate = await prisma.user.findUnique({');
      console.log('  where: { email: emailToMakeAdmin }');
      console.log('});');
      console.log('');
      console.log('if (userToUpdate) {');
      console.log('  const updatedUser = await prisma.user.update({');
      console.log('    where: { id: userToUpdate.id },');
      console.log('    data: { role: "admin" }');
      console.log('  });');
      console.log('  console.log(`✅ ${updatedUser.email} is now an admin!`);');
      console.log('} else {');
      console.log('  console.log("❌ User not found with that email.");');
      console.log('}');
      console.log('*/');
      console.log('');
      console.log('💡 Or run this script with an email parameter:');
      console.log('   node check-users.js user@example.com');
    }

    // Check if email was passed as argument
    const emailArg = process.argv[2];
    if (emailArg) {
      console.log(`\n🔄 Attempting to make ${emailArg} an admin...`);
      
      const userToUpdate = await prisma.user.findUnique({
        where: { email: emailArg }
      });

      if (userToUpdate) {
        if (userToUpdate.role === 'admin') {
          console.log(`✅ ${emailArg} is already an admin!`);
        } else {
          const updatedUser = await prisma.user.update({
            where: { id: userToUpdate.id },
            data: { role: 'admin' }
          });
          console.log(`✅ ${updatedUser.email} is now an admin!`);
        }
      } else {
        console.log(`❌ User not found with email: ${emailArg}`);
      }
    }

  } catch (error) {
    console.error('❌ Error managing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manageUsers();
