import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Emit SPA-fallback files into dist/ after every build so that deep links
 * (e.g. /courses/jee-main, /booking) resolve on ANY static host:
 *   - 404.html   → GitHub Pages-style fallback (a copy of index.html)
 *   - _redirects → Netlify / Cloudflare Pages catch-all rewrite
 * Vercel uses the catch-all rewrite already present in vercel.json,
 * and `vite preview` / `vite dev` handle SPA fallback automatically.
 */
function spaFallbacks(): Plugin {
  return {
    name: 'spa-fallbacks',
    apply: 'build',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      const indexPath = resolve(outDir, 'index.html')
      if (existsSync(indexPath)) {
        copyFileSync(indexPath, resolve(outDir, '404.html'))
        writeFileSync(resolve(outDir, '_redirects'), '/*    /index.html   200\n')
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbacks()],
  // Manual chunking keeps the initial bundle small: GSAP, Supabase,
  // Lucide and React Router are split out so the hero loads first.
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
            return 'vendor-react'
          }
          if (id.includes('gsap')) return 'vendor-gsap'
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('lucide-react')) return 'vendor-icons'
          return undefined
        },
      },
    },
  },
})
