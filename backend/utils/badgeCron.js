import cron from 'node-cron';
import { assignBadgesBatch } from './controllers/batchController.js';

// Run the badge assignment function every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running badge assignment batch job...');
  await assignBadgesBatch();
});
