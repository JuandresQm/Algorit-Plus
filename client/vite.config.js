import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // 1. Importa el plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['Alg-192.png', 'Alg-512.png'], // Asegúrate de que los nombres coincidan con los de tu carpeta public
      manifest: {
        name: 'Algorit+',
        short_name: 'Alg+',
        description: 'Plataforma educativa para el aprendizaje de pseudocódigo.',
        theme_color: '#000000',
        icons: [
          {
            src: '/Alg-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Alg-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true 
  }
})