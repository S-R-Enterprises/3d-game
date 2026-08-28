import path from 'node:path'

import { partytownVite } from '@builder.io/partytown/utils'
import legacy from '@vitejs/plugin-legacy'
import glsl from 'vite-plugin-glsl'

import _config from './_config'

const HOST = _config.server.host
const PORT = _config.server.port

export default {
  server: {
    host: HOST,
    port: PORT,
  },
  plugins: [
    legacy(),
    glsl(),
    partytownVite({
      dest: path.join(__dirname, 'dist', '~partytown'),
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        ship: path.resolve(__dirname, 'ship.html'),
      },
    },
  },
}

// Trigger dev server restart

// Updated on 2026-08-28
 
