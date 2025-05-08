import 'dotenv/config';

import { startApp } from './boot/setup';

const main = async (): Promise<void> => {
    try {
        startApp();
    } catch (error) {
        throw new Error(`Error starting the application: ${error}`);
    }
}

main()