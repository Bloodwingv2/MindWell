import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',                             // Changed Base Directory to mirror relative position
  build:{                                 // Added different directory for react build directory
    outDir: 'dist-react',
  },
  assetsInclude: ['**/*.ttf'], // Moved to root level
  server: {
    port: 5123,                          // Changed Port to 5123
    strictPort: true,                    // Added strict port
},
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@fonts': path.resolve(__dirname, 'assets/fonts'),
    }
  }
});
