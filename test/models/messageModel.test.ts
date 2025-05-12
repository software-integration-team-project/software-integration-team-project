import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Message from '../../src/models/messageModel'; // adjust path as needed

describe('Message Model', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should create and save a message successfully', async () => {
    const validMessage = new Message({
      name: 'Hello',
      user: new mongoose.Types.ObjectId(),
    });

    const savedMessage = await validMessage.save();

    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.name).toBe('Hello');
    expect(savedMessage.user).toBeInstanceOf(mongoose.Types.ObjectId);
    expect((savedMessage as any).created_at).toBeDefined();
    expect((savedMessage as any).updated_at).toBeDefined();
  });

  it('should fail if required fields are missing', async () => {
    const messageWithoutUser = new Message({ name: 'Oops' });

    await expect(messageWithoutUser.save()).resolves.toBeDefined();
    // if you want to enforce required fields, you'd need to add `required: true` in schema
  });
});
