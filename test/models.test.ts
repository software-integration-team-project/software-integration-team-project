import 'dotenv/config';

import mongoose from 'mongoose';

import Comment from '../src/models/commentModel';
import Message from '../src/models/messageModel';
import Rating from '../src/models/ratingModel';
import User from '../src/models/userModel';

describe('Mongoose Models', () => {
    beforeAll(async () => {
        await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://localhost:27017/test',
        );
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
    });

    describe('User Model', () => {
        it('should create & save a user successfully', async () => {
            const user = new User({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            });
            const savedUser = await user.save();
            expect(savedUser._id).toBeDefined();
            expect(savedUser.email).toBe('test@example.com');
        });

        it('should not save user without required fields', async () => {
            const user = new User({ username: 'noemail' });
            let err;
            try {
                await user.save();
            } catch (error) {
                err = error;
            }
            expect(err).toBeDefined();
        });
    });

    describe('Rating Model', () => {
        it('should create & save a rating successfully', async () => {
            const rating = new Rating({
                movie_id: 1,
                email: 'test@example.com',
                rating: 4,
            });
            const savedRating = await rating.save();
            expect(savedRating._id).toBeDefined();
            expect(savedRating.rating).toBe(4);
        });

        it('should not save rating with invalid value', async () => {
            const rating = new Rating({
                movie_id: 1,
                email: 'test@example.com',
                rating: 10,
            });
            let err;
            try {
                await rating.save();
            } catch (error) {
                err = error;
            }
            expect(err).toBeDefined();
        });
    });

    describe('Message Model', () => {
        it('should create & save a message successfully', async () => {
            const user = new User({
                username: 'msguser',
                email: 'msg@example.com',
                password: 'password',
            });
            const savedUser = await user.save();
            const message = new Message({
                name: 'Hello',
                user: savedUser._id,
            });
            const savedMessage = await message.save();
            expect(savedMessage._id).toBeDefined();
            expect(savedMessage.name).toBe('Hello');
        });
    });

    describe('Comment Model', () => {
        it('should create & save a comment successfully', async () => {
            const comment = new Comment({
                movie_id: 1,
                username: 'commenter',
                comment: 'Great movie!',
                title: 'Awesome',
                rating: 5,
            });
            const savedComment = await comment.save();
            expect(savedComment._id).toBeDefined();
            expect(savedComment.comment).toBe('Great movie!');
        });

        it('should not save comment without required fields', async () => {
            const comment = new Comment({
                movie_id: 1,
                username: 'commenter',
            });
            let err;
            try {
                await comment.save();
            } catch (error) {
                err = error;
            }
            expect(err).toBeDefined();
        });
    });
});
