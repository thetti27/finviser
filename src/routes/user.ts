import { Router, Request, Response } from 'express';

const router = Router();

// Example: Get user info
router.get('/', async (req: Request, res: Response): Promise<Response> => {
  // TODO: Implement get user info logic
  return res.status(501).json({ message: 'Not implemented' });
});

export default router; 