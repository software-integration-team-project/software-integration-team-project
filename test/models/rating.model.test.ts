/* eslint-disable */
import 'dotenv/config';
import mongoose from 'mongoose';
import Rating from '../../src/models/ratingModel';

describe('Rating Model', () => {
    beforeAll(async () => {
        await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://localhost:27017/test',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            } as any,
        );
    });

    afterAll(async () => {
        //await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
    });

    it('should create & save a rating successfully', async () => {
        const rating = new Rating({
            movie_id: 101,
            email: 'user@example.com',
            rating: 4,
        });

        const savedRating = await rating.save();

        expect(savedRating._id).toBeDefined();
        expect(savedRating.email).toBe('user@example.com');
        expect(savedRating.rating).toBe(4);
    });

    it('should not save a rating without required fields', async () => {
        const rating = new Rating({});

        let err;
        try {
            await rating.save();
        } catch (error: any) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.errors.movie_id).toBeDefined();
        expect(err.errors.email).toBeDefined();
        expect(err.errors.rating).toBeDefined();
    });

    it('should not save a rating with invalid value (> 5)', async () => {
        const rating = new Rating({
            movie_id: 102,
            email: 'user@example.com',
            rating: 7,
        });

        let err;
        try {
            await rating.save();
        } catch (error: any) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.errors.rating).toBeDefined();
    });
});
