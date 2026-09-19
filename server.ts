import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './server/app';

const PORT = 3000;

async function startServer() {
  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Paytm CashFlow AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
