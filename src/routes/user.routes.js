import express from 'express';
import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from '#controllers/user.controller.js';
import { requireAuth, requireRole } from '#middleware/auth.middleware.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', requireAuth, requireRole(['admin']), fetchAllUsers);

// Get user by ID (authenticated users can view their own profile, admins can view any)
router.get('/:id', requireAuth, fetchUserById);

// Update user by ID (users can update their own profile, admins can update any)
router.put('/:id', requireAuth, updateUserById);

// Delete user by ID (users can delete their own account, admins can delete any except their own)
router.delete('/:id', requireAuth, requireRole(['admin']), deleteUserById);

export default router;
