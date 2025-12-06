import express from 'express';
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', getEmployees);
router.post('/', createEmployee);
router.put('/:employeeId', updateEmployee);
router.delete('/:employeeId', deleteEmployee);

export default router;