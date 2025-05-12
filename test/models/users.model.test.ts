import mongoose from 'mongoose';
import User from '../../src/models/userModel'; // Adjust the path

beforeAll(async () => {
    await mongoose.connect(
        process.env.MONGO_URI || 'mongodb://localhost:27017/test',
        {
            //useNewUrlParser: true,
            //useUnifiedTopology: true,
        },
    );
});

beforeEach(async () => {
    await User.deleteMany(); // Clean the database before each test
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe('User Model', () => {
    it('should create and save a user successfully', async () => {
        const user = new User({
            email: 'user@example.com',
            username: 'testuser',
            password: 'password123',
        });
        const savedUser = await user.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.email).toBe('user@example.com');
        expect(savedUser.username).toBe('testuser');
        expect(savedUser.password).toBe('password123');
    });

    it('should fail if required fields are missing', async () => {
        let err;
        try {
            const user = new User({
                email: 'invalid@example.com',
                // Missing username and password
            });
            await user.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.errors.username).toBeDefined();
        expect(err.errors.password).toBeDefined();
    });

    it('should fail if email is not unique', async () => {
        const user1 = new User({
            email: 'duplicate@example.com',
            username: 'user1',
            password: 'password123',
        });
        await user1.save();

        let err;
        try {
            const user2 = new User({
                email: 'duplicate@example.com',
                username: 'user2',
                password: 'password123',
            });
            await user2.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.code).toBe(11000); // MongoDB duplicate key error code
    });
});
