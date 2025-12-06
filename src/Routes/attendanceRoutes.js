import express from 'express';
import { deleteAttendanceDate, getAllAttendance, getAttendanceByEmployee, markAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/', getAllAttendance);
router.post('/', markAttendance);
router.get('/:employeeId', getAttendanceByEmployee);
router.delete('/', deleteAttendanceDate);

export default router;