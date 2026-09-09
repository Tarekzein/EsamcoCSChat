import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    minify: 'esbuild',
    // Base64-inline the logo (~13KB) into the bundled JS instead of emitting
    // it as a separate file - keeps the "single self-contained script tag"
    // contract intact for the host page.
    assetsInlineLimit: 100_000,
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
