import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react(), {
  name: 'mindar-resize-cleanup',
  transform(code, id) {
    if (!id.replaceAll('\\', '/').endsWith('mind-ar/dist/mindar-image-three.prod.js')) return;
    const original = 'window.addEventListener("resize", this.resize.bind(this))';
    if (!code.includes(original)) throw Error('MindAR changed; review the resize lifecycle adapter.');
    return code.replace(original, 'this.resizeHandler = this.resize.bind(this), window.addEventListener("resize", this.resizeHandler)');
  }
}], resolve: { dedupe: ['react', 'react-dom', 'remotion'] }, optimizeDeps: { exclude: ['mind-ar'] }, server: { port: 5173 }, build: { target: 'es2022' } });
