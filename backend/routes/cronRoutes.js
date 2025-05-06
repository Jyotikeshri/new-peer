import express from 'express';
import { assignBadgesBatch } from '../controllers/batchController.js';
import { protect } from '../middleware/authMiddleware.js'; // Protect routes

const router = express.Router();

// Route to manually trigger badge assignment batch
router.get('/run-batch', protect ,  async (req, res) => {
  try {
    const result = await assignBadgesBatch();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send('Error running batch job');
  }
});

export default router;
