// Helper compartilhado para inicializar o Express app
// Usa serverless-http para adaptar Express para ambiente serverless

const serverless = require('serverless-http');

let handler = null;
let initPromise = null;

async function getHandler() {
  if (handler) {
    return handler;
  }
  
  if (!initPromise) {
    initPromise = (async () => {
      try {
        console.log('[App Helper] Starting app initialization...');
        console.log('[App Helper] NODE_ENV:', process.env.NODE_ENV);
        console.log('[App Helper] DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log('[App Helper] SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
        
        // Importa o servidor compilado
        const server = require('../../dist/index.cjs');
        
        let expressApp;
        // Se o servidor exporta uma função de inicialização, chama ela
        if (server.initializeApp) {
          console.log('[App Helper] Calling initializeApp...');
          expressApp = await server.initializeApp();
          console.log('[App Helper] App initialized successfully');
        } else {
          console.log('[App Helper] No initializeApp found, using default export');
          expressApp = server.default || server;
        }
        
        // Usa serverless-http para adaptar o Express app para serverless
        handler = serverless(expressApp, {
          binary: ['image/*', 'application/pdf']
        });
        
        console.log('[App Helper] Serverless handler created');
        return handler;
      } catch (error) {
        console.error('[App Helper] Error initializing app:', error);
        console.error('[App Helper] Error message:', error.message);
        console.error('[App Helper] Error stack:', error.stack);
        throw error;
      }
    })();
  }
  
  return await initPromise;
}

module.exports = { getHandler };

