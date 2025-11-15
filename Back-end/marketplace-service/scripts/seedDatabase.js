const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../backend/models/userModel');

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing users (optional - be careful in production!)
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create test users
        const testUsers = [
            {
                email: 'student1@campus.edu',
                password: 'password123', // In production, hash this!
                name: 'John Doe',
                role: 'student'
            },
            {
                email: 'student2@campus.edu',
                password: 'password123',
                name: 'Jane Smith',
                role: 'student'
            },
            {
                email: 'admin@campus.edu',
                password: 'admin123',
                name: 'Admin User',
                role: 'admin'
            }
        ];

        const createdUsers = await User.insertMany(testUsers);
        console.log('Created test users:', createdUsers.length);

        // Generate JWT tokens for each user
        console.log('\n=== JWT TOKENS FOR TESTING ===\n');
        
        createdUsers.forEach(user => {
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );
            console.log(`User: ${user.email}`);
            console.log(`ID: ${user._id}`);
            console.log(`Token: ${token}`);
            console.log('---');
        });

        console.log('\n=== Copy one of the tokens above to use in your frontend .env file ===\n');

        mongoose.connection.close();
        console.log('Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();