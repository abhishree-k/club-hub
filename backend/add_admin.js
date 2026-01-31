const { User, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

// Get arguments from command line
const args = process.argv.slice(2);

if (args.length < 2) {
    console.log('Usage: node add_admin.js <email> <password> [firstName] [lastName]');
    console.log('Example: node add_admin.js newadmin@dsce.edu mysecurepass "New" "Admin"');
    process.exit(1);
}

const email = args[0];
const password = args[1];
const firstName = args[2] || 'Admin';
const lastName = args[3] || 'User';

async function createAdmin() {
    try {
        await sequelize.sync();

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.error(`Error: User with email '${email}' already exists.`);
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'admin',
            studentId: `ADMIN-${Math.floor(Math.random() * 10000)}`
        });

        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${email}`);
        console.log(`   Name:  ${firstName} ${lastName}`);
        console.log(`   Role:  ${user.role}`);

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    } finally {
        // Close connection/exit
        // Note: Sequelize connection might keep process alive, so we force exit after a short delay or if we knew how to close it properly here (sequelize.close())
        // But for a script, process.exit is fine.
        setTimeout(() => process.exit(0), 1000);
    }
}

createAdmin();
