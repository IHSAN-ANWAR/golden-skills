import express from 'express';
import { 
  getAllTasks, 
  getTasksForUser, 
  createTask, 
  updateTask, 
  deleteTask,
  getTaskStats 
} from '../controllers/taskController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes (require admin authentication)
router.get('/admin/all', authenticateAdmin, getAllTasks);
router.get('/admin/stats', authenticateAdmin, getTaskStats);
router.post('/admin/create', authenticateAdmin, createTask);
router.put('/admin/update/:id', authenticateAdmin, updateTask);
router.delete('/admin/delete/:id', authenticateAdmin, deleteTask);

// User routes (for mobile app - would need user authentication middleware)
router.get('/user/my-tasks', getTasksForUser); // Add user auth middleware when ready

export default router;
