import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${process.env.PORT ?? 3000}`,
        },
      },
    },
  },
});
