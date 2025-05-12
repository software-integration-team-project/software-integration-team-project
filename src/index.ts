import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
dotenv.config({ path: '.env.release' });

import { startApp } from './boot/setup';

const main = async (): Promise<void> => {
    try {
        startApp();
    } catch (error) {
        throw new Error(`Error starting the application: ${error}`);
    }
};

main();
