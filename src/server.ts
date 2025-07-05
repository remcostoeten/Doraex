import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { createApi } from './api'
import { setupDefaultConnection } from './setup'

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
async function setupApplication() {
  const app = createApp()
  const api = createApi()

  // Initialize default database connection
  await setupDefaultConnection()

  // Mount API routes
  app.route('/api', api)

  // Fallback to serve index.html for SPA routing
  app.get('*', serveStatic({ path: './frontend/dist/index.html' }))

  return app
}

const app = await setupApplication()

export default {
  port: 3002,
  fetch: app.fetch,
}
