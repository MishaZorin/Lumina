// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Явно указываем использовать новый JSX трансформ
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
    })
  ],
  resolve: {
    // Предотвращаем дублирование React
    dedupe: ['react', 'react-dom']
  }
});