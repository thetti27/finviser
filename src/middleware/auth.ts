import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  // TODO: Implement authentication logic
  return res.status(401).json({ message: 'Not implemented' });
}; 