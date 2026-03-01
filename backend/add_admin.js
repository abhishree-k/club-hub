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

// Basic input validation
if (!email || !email.includes('@')) {
    console.error('❌ Invalid email format.');
    process.exit(1);
}

if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters long.');
    process.exit(1);
}

async function createAdmin() {
    try {
        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.error(`Error: User with email '${email}' already exists.`);
            process.exit(1);
        }

        const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${email}`);
        console.log(`   Name:  ${firstName} ${lastName}`);
        console.log(`   Role:  ${user.role}`);

    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    } finally {
        // Close connection/exit
        // Note: Sequelize connection might keep process alive, so we force exit after a short delay or if we knew how to close it properly here (sequelize.close())
        // But for a script, process.exit is fine.
        await sequelize.close();
        process.exit(0);
    }
}

createAdmin();
