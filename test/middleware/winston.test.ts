import logger from '../../src/middleware/winston';
import winston from 'winston';

describe('Logger Utility', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should include file and console transports', () => {
    const transports = logger.transports;
    const hasFile = transports.some(t => t instanceof winston.transports.File);
    const hasConsole = transports.some(t => t instanceof winston.transports.Console);

    expect(hasFile).toBe(true);
    expect(hasConsole).toBe(true);
  });

  it('should log info messages', () => {
    expect(() => logger.info('Test info')).not.toThrow();
  });

  it('should log error messages', () => {
    expect(() => logger.error('Test error')).not.toThrow();
  });

  it('should support stream.write manually', () => {
    const testMessage = 'Streamed message';
    const fakeStream = {
      write: (msg: string) => {
        logger.info(msg.trim());
      },
    };

    expect(() => fakeStream.write(testMessage)).not.toThrow();
  });

  afterAll(async () => {
    // Properly close all transports to avoid open handles
    for (const transport of logger.transports) {
      if (typeof transport.close === 'function') {
        transport.close();
      }
    }

    // Ensure there are no lingering asynchronous operations
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async tasks to complete
  });
});
