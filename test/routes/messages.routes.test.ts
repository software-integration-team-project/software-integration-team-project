import request from 'supertest';
import express from 'express';
import messageRouter from '../../src/routes/messages.routes'; // adjust to your file structure

const app = express();
app.use(express.json()); // For parsing application/json
app.use(messageRouter);

describe('Messages API Routes', () => {
  it('should create a new message with POST /add/message', async () => {
    const newMessage = {
      content: 'This is a new test message',
      author: 'Test Author',
    };

    const response = await request(app).post('/add/message').send(newMessage);

    expect(response.status).toBe(201); // Check if the status is 201 (Created)
    expect(response.body).toHaveProperty('content', newMessage.content);
    expect(response.body).toHaveProperty('author', newMessage.author);
  });

  it('should get all messages with GET /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200); // Check if the status is 200 (OK)
    expect(Array.isArray(response.body)).toBe(true); // Check if the response is an array
  });

  it('should edit a message with PUT /edit/:messageId', async () => {
    // First, create a message to update
    const newMessage = {
      content: 'Message to be edited',
      author: 'Author',
    };

    const createResponse = await request(app)
      .post('/add/message')
      .send(newMessage);

    const messageId = createResponse.body._id; // Assuming the response has an _id property

    const updatedMessage = {
      content: 'Updated message content',
      author: 'Updated author',
    };

    const response = await request(app)
      .put(`/edit/${messageId}`)
      .send(updatedMessage);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('content', updatedMessage.content);
    expect(response.body).toHaveProperty('author', updatedMessage.author);
  });

  it('should delete a message with DELETE /delete/:messageId', async () => {
    // First, create a message to delete
    const newMessage = {
      content: 'Message to be deleted',
      author: 'Author',
    };

    const createResponse = await request(app)
      .post('/add/message')
      .send(newMessage);

    const messageId = createResponse.body._id; // Assuming the response has an _id property

    const deleteResponse = await request(app).delete(`/delete/${messageId}`);

    expect(deleteResponse.status).toBe(200); // Check if the deletion was successful
    expect(deleteResponse.body).toHaveProperty('message', 'Message deleted successfully');
  });

  it('should get a message by ID with GET /:messageId', async () => {
    // First, create a message to get by ID
    const newMessage = {
      content: 'Message to get by ID',
      author: 'Author',
    };

    const createResponse = await request(app)
      .post('/add/message')
      .send(newMessage);

    const messageId = createResponse.body._id; // Assuming the response has an _id property

    const response = await request(app).get(`/${messageId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('content', newMessage.content);
    expect(response.body).toHaveProperty('author', newMessage.author);
  });
});
