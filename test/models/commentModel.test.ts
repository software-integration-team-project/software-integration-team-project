import 'dotenv/config';
import mongoose from 'mongoose';
import Comment from '../../src/models/commentModel';

describe('Comment Model', () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/test',
      { useNewUrlParser: true, useUnifiedTopology: true } as any
    );
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('should create & save a comment successfully', async () => {
    const comment = new Comment({
      movie_id: 123,
      username: 'testuser',
      comment: 'This is a great movie!',
      title: 'Amazing',
      rating: 5,
    });

    const savedComment = await comment.save();

    expect(savedComment._id).toBeDefined();
    expect(savedComment.comment).toBe('This is a great movie!');
    expect(savedComment.rating).toBe(5);
    expect(savedComment.upvotes).toBe(0); // default
    expect(savedComment.downvotes).toBe(0); // default
  });

  it('should not save comment without required fields', async () => {
    const comment = new Comment({
      movie_id: 456,
      username: 'testuser2',
    });

    let err;
    try {
      await comment.save();
    } catch (error: any) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.comment).toBeDefined();
    expect(err.errors.title).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });

  it('should not save a comment with invalid rating (> 5)', async () => {
    const comment = new Comment({
      movie_id: 789,
      username: 'testuser3',
      comment: 'Too good',
      title: 'Legendary',
      rating: 7, // Invalid
    });

    let err;
    try {
      await comment.save();
    } catch (error: any) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });
});
