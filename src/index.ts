import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

envCheck();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start Google OAuth
app.get('/auth/google', async (_req: Request, res: Response) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: process.env.GOOGLE_REDIRECT_URI,
    },
  });
  if (error) return res.status(500).json({ error: error.message });
  res.redirect(data.url);
});

// OAuth callback
app.get('/auth/callback', async (req: Request, res: Response) => {
  // In a real app, you'd handle the session/token here
  res.json({ message: 'Google OAuth callback received', query: req.query });
});

const port = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

function envCheck() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'GOOGLE_REDIRECT_URI'];
  for (const v of required) {
    if (!process.env[v]) {
      throw new Error(`Missing env var: ${v}`);
    }
  }
}

export default app; 