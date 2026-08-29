import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Custom Vite plugin to handle backend AI Vision API requests in local dev only
function civicPulseApiPlugin() {
  return {
    name: 'civicpulse-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/')) {
          try {
            const { handleApiRequest } = await import('./server/server.js');
            await handleApiRequest(req, res);
          } catch (err) {
            console.error('[API Middleware Error]', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  const plugins = [
    react(),
    tailwindcss()
  ];

  if (command === 'serve') {
    plugins.push(civicPulseApiPlugin());
  }

  return {
    plugins,
    server: {
      port: 5173,
      host: '127.0.0.1'
    }
  };
});
