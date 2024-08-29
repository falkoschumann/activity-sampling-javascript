import { defineConfig } from 'vite';

export default defineConfig(() => {
  const config = {
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
        },
        external: ['node:fs/promises'],
      },
    },
    server: {
      port: process.env.DEV_PORT ?? 8080,
      proxy: {
        '/api': {
          target: `http://localhost:${process.env.PORT ?? 3000}`,
        },
      },
    },
  };

  return config;
});
