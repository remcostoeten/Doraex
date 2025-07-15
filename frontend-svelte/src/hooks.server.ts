import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const url = event.url;
  
  // Handle common typos in routes
  if (url.pathname === '/regiter') {
    throw redirect(301, '/register');
  }
  
  if (url.pathname === '/login' || url.pathname === '/signin') {
    // Allow these routes to pass through
  }
  
  return resolve(event);
};
