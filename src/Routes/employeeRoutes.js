import express from 'express';
import { allEmployees, createEmployee, deleteEmployee, getEmployees, updateEmployee } from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', getEmployees);
router.get("/allColors", allEmployees);
router.post('/', createEmployee);
router.put('/:employeeId', updateEmployee);
router.delete('/:employeeId', deleteEmployee);

export default router;