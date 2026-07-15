// ================================================================================================
// vite.config.ts — configuración de build del panel de administración (AdminPanel/).
// ------------------------------------------------------------------------------------------------
// El panel se compila a Frontend/admin/ para que Apache lo sirva desde el MISMO ORIGEN que la API
// PHP (admin.php no envía cabeceras CORS y la sesión va en cookie SameSite: exige mismo origen).
//  - `base: './'`  → rutas relativas en el HTML compilado, funciona bajo /Frontend/admin/.
//  - En desarrollo (`npm run dev`), el proxy reenvía /Backend y /Frontend al contenedor Docker
//    (http://localhost:8080), así la cookie de sesión también queda en el origen del dev server.
// ================================================================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../Frontend/admin',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/Backend': 'http://localhost:8080',
      '/Frontend': 'http://localhost:8080'
    }
  }
});
