import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    minify: 'esbuild',
    lib: {
      entry: 'src/main.jsx',
      name: 'EsamcoChatWidget',
      formats: ['iife'],
      fileName: () => 'esamco-chat-widget.js',
    },
    rollupOptions: {
      output: {
        // Single self-contained file - no separate CSS asset, and React
        // bundled in (the widget can't assume the host page has it).
        inlineDynamicImports: true,
      },
    },
  },
})
