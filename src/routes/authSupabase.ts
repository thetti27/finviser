import { Router, Request, Response } from 'express';

const router = Router();

// Example: Supabase OAuth callback
router.get('/callback', async (req: Request, res: Response): Promise<Response> => {
  // TODO: Implement Supabase OAuth callback logic
  return res.status(501).json({ message: 'Not implemented' });
});

export default router; 