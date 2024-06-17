import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const config = {
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
        },
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

  if (mode === 'development') {
    config.build.rollupOptions.input.designsystem = 'design-system/index.html';
  }

  return config;
});
