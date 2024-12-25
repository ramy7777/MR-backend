import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get all rentals
router.get('/', authenticate, async (req, res) => {
  // TODO: Implement get all rentals
  res.json([]);
});

// Get rental by id
router.get('/:id', authenticate, async (req, res) => {
  // TODO: Implement get rental by id
  res.json({});
});

// Create rental
router.post('/', authenticate, async (req, res) => {
  // TODO: Implement create rental
  res.status(201).json({});
});

// Update rental
router.put('/:id', authenticate, async (req, res) => {
  // TODO: Implement update rental
  res.json({});
});

// Delete rental
router.delete('/:id', authenticate, async (req, res) => {
  // TODO: Implement delete rental
  res.status(204).send();
});

export default router;
