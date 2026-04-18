import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const autoSavePlugin = () => {
  return {
    name: 'auto-save-data',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/save-data') {
          let body = ''
          req.on('data', chunk => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const filePath = path.resolve(__dirname, 'src/content/siteData.js')
              const content = `export const siteData = ${JSON.stringify(data, null, 2)};\n`
              fs.writeFileSync(filePath, content, 'utf-8')
              res.statusCode = 200
              res.end(JSON.stringify({ success: true }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), autoSavePlugin()],
})
