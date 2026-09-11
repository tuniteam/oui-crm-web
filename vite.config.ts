import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  /*
   * L'instant de la construction, grave dans le code.
   *
   * En production, une image relancee sans etre reconstruite sert l'ancien
   * code sans que rien ne le signale : c'est arrive le 11/09, un conteneur
   * recree a 19:28 servait une image de 12:24. Cette date, affichee sur la
   * page de connexion, dit d'un coup d'oeil si un deploiement a pris.
   *
   * Calculee ici, a la construction : elle ne demande rien a la chaine de
   * deploiement, contrairement a un numero de commit, que le contexte Docker
   * ne voit pas (`.git` est exclu par `.dockerignore`).
   */
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  base: process.env.VITE_BASE_URL || '/',
  // 5174 et non le 5173 par défaut : soft-m occupe déjà 5173 en local, et
  // l'API n'autorise que cette origine (CORS_ORIGINS / FRONT_URL).
  server: {
    port: 5174,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
});
