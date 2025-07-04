import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { createApi } from './api'

// Create the application
function createApp() {
  const app = new Hono()

  // Enable CORS for development
  app.use('*', cors())

  // Serve static files from frontend build directory
  app.use('/*', serveStatic({ root: './frontend/dist' }));

  return app
}

// Setup application
function setupApplication() {
  const app = createApp()
  const api = createApi()

  // Mount API routes
  app.route('/api', api)

  // Fallback to serve index.html for SPA routing
  app.get('*', serveStatic({ path: './frontend/dist/index.html' }))

  return app
}

const app = setupApplication()

export default {
  port: 3002,
  fetch: app.fetch,
}
