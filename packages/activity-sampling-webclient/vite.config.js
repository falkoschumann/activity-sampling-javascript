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
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
        },
      },
    },
  };

  if (mode === 'development') {
    config.build.rollupOptions.input.designsystem = 'design-system/index.html';
  }

  return config;
});
