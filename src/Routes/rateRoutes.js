import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { createRate, deleteItem, deleteRate, getRate, updateRate } from '../controllers/rateController.js';

const router = express.Router();

router.use(protectRoute);

router.get('/', getRate);
router.post('/', createRate);
router.put('/:rateId', updateRate);
router.delete('/:rateId', deleteRate);
router.put('/deleteItem/:rateId', deleteItem);

export default router;