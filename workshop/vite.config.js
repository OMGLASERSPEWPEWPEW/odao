import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 5180,
    open: '/pres/',
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pres: resolve(__dirname, 'pres/index.html'),
        chainInscript: resolve(__dirname, 'pres/chain-inscript/index.html'),
        codingWithAi: resolve(__dirname, 'pres/coding-with-ai/index.html'),
        p2pSettlement: resolve(__dirname, 'pres/p2p-settlement/index.html'),
      },
    },
  },
})
