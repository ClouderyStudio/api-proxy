const apiMapping = {
  '/discord': 'https://discord.com/api',
  '/telegram': 'https://api.telegram.org',
  '/openai': 'https://api.openai.com',
  '/claude': 'https://api.anthropic.com',
  '/gemini': 'https://generativelanguage.googleapis.com',
  '/meta': 'https://www.meta.ai/api',
  '/groq': 'https://api.groq.com/openai',
  '/xai': 'https://api.x.ai',
  '/cohere': 'https://api.cohere.ai',
  '/huggingface': 'https://api-inference.huggingface.co',
  '/together': 'https://api.together.xyz',
  '/novita': 'https://api.novita.ai',
  '/portkey': 'https://api.portkey.ai',
  '/fireworks': 'https://api.fireworks.ai',
  '/openrouter': 'https://openrouter.ai/api'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === '/' || pathname === '/index.html') {
      return new Response('Service is running!', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    if (pathname === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const [prefix, rest] = extractPrefixAndRest(pathname, Object.keys(apiMapping));
    if (!prefix) {
      return new Response('Not Found', { status: 404 });
    }

    const targetUrl = `${apiMapping[prefix]}${rest}${url.search}`;

    try {
      const headers = new Headers();
      const allowedHeaders = ['accept', 'content-type', 'authorization'];
      for (const [key, value] of request.headers.entries()) {
        if (allowedHeaders.includes(key.toLowerCase())) {
          headers.set(key, value);
        }
      }

      // 移除 Host 头，避免冲突
      headers.delete('host');

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.body
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('X-Frame-Options', 'DENY');
      responseHeaders.set('Referrer-Policy', 'no-referrer');
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders
      });

    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

function extractPrefixAndRest(pathname, prefixes) {
  for (const prefix of prefixes) {
    if (pathname.startsWith(prefix)) {
      return [prefix, pathname.slice(prefix.length)];
    }
  }
  return [null, null];
}
