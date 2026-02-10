// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import svgr from 'vite-plugin-svgr'

// export default defineConfig({
//   define: {
//     'process.env': process.env
//   },
//   plugins: [
//     react(),
//     svgr()
//   ],
//   resolve: {
//     alias: [
//       { find: '~', replacement: '/src' }
//     ]
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [
    react(),
    svgr()
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  }
})
