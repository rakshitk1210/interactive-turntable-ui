import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      // Stub out the "framer" package for local dev/build.
      // TurntableFramer.tsx imports from "framer" for property controls;
      // this stub provides no-op implementations so the build doesn't fail.
      // When the component file is used inside Framer itself, Framer's own
      // bundler supplies the real "framer" module and ignores this alias.
      'framer': path.resolve(__dirname, './src/framer-stub.ts'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
