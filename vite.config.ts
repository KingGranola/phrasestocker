import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isMobileBuild = process.env.MOBILE_BUILD === 'true';
  const isVercel = process.env.VERCEL === '1';
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';

  return {
    // Vercel and local builds should use root path. GitHub Pages build can opt-in via env.
    base: isMobileBuild || isVercel || !isGitHubPages ? '/' : '/phrasestocker/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
