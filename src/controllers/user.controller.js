import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/user.service.js';
import { formatValidationError } from '#utils/format.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/user.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Get all users ...');
    const allUsers = await getAllUsers();
    res.json({
      message: 'Get all users successfully',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error(`Failed to get all users: ${error}`);
    next(error);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const paramValidation = userIdSchema.safeParse(req.params);

    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: formatValidationError(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;

    // Authorization logic: users can only view their own profile
    // Admins can view any user profile
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own profile',
      });
    }

    logger.info(`Get user by ID: ${id}`);

    const user = await getUserById(id);
    res.json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    logger.error(`Failed to get user by ID: ${error}`);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const paramValidation = userIdSchema.safeParse(req.params);
    const bodyValidation = updateUserSchema.safeParse(req.body);

    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: formatValidationError(paramValidation.error),
      });
    }

    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = paramValidation.data;
    const updates = bodyValidation.data;

    // Authorization logic: users can only update their own profile
    // Admins can update any user
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own profile',
      });
    }

    // Only admins can change user roles
    if (updates.role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can change user roles',
      });
    }

    logger.info(`Updating user ID: ${id}`);

    const updatedUser = await updateUser(id, updates);
    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error(`Failed to update user: ${error}`);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (error.message === 'User with this email already exist') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const paramValidation = userIdSchema.safeParse(req.params);

    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: formatValidationError(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;

    // Authorization logic: users can delete their own account
    // Admins can delete any user account
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    // Prevent admins from deleting their own account (optional security measure)
    if (req.user.role === 'admin' && req.user.id === id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Administrators cannot delete their own account',
      });
    }

    logger.info(`Deleting user ID: ${id}`);

    const deletedUser = await deleteUser(id);
    res.json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    logger.error(`Failed to delete user: ${error}`);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(error);
  }
};
