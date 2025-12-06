import express from 'express';
import { allClarity, createClarity, deleteClarity, getClarity, updateClarity } from '../controllers/clarityController.js';

const router = express.Router();

router.get('/', getClarity);
router.get('/allClarity', allClarity);
router.post('/', createClarity);
router.put('/:clarityId', updateClarity);
router.delete('/:clarityId', deleteClarity);

export default router;