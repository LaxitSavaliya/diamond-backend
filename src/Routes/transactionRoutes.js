import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from '../controllers/transactionController.js';

const router = express.Router();

router.use(protectRoute);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:transactionId', updateTransaction);
router.delete('/:transactionId', deleteTransaction);

export default router;