const ALLOWED_ORIGINS = new Set([
  'https://morstrix.zone',
  'https://morstrix.github.io',
  'https://morstrix.github.io/'
]);

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'https://morstrix.zone';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin)
    }
  });
}

function text(data, status = 200, origin = '') {
  return new Response(data, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...corsHeaders(origin)
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    console.log(`🔥 PROXY: ${request.method} ${url.pathname}`);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
      });
    }

    try {
      // Health check
      if (request.method === 'GET' && url.pathname === '/') {
        return text('api-proxy-morstrix: OK', 200, origin);
      }

      // -------- notify-auth --------
      if (request.method === 'POST' && url.pathname.includes('/api/notify-auth')) {
        console.log('✅ NOTIFY-AUTH HANDLER TRIGGERED');
        const modifiedRequest = new Request(request);
        modifiedRequest.headers.set('X-Site-Token', env.SITE_API_KEY);
        return env.MORSTRIXBOT_SERVICE.fetch(modifiedRequest);
      }

      // -------- send-art (upload to ImageKit) --------
      if (request.method === 'POST' && url.pathname.includes('/api/send-art')) {
        console.log('✅ SEND-ART HANDLER TRIGGERED');

        const incoming = await request.formData();
        const photo = incoming.get('photo');
        const userName = incoming.get('user_name') || 'ANON';

        if (!photo || typeof photo === 'string') {
          return json({ error: 'photo file is required' }, 400, origin);
        }

        // Upload to ImageKit via REST API
        const ikForm = new FormData();
        ikForm.append('file', photo);
        ikForm.append('fileName', `morstrix-art-${Date.now()}.png`);
        ikForm.append('folder', '/morstrix-arts');
        ikForm.append('useUniqueFileName', 'true');

        const auth = 'Basic ' + btoa(`${env.IMAGEKIT_PRIVATE_KEY}:`);

        const ikRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          headers: { Authorization: auth },
          body: ikForm
        });

        const ikRaw = await ikRes.text();
        if (!ikRes.ok) {
          console.error('ImageKit upload failed:', ikRaw);
          return json(
            { error: 'ImageKit upload failed', details: ikRaw },
            502,
            origin
          );
        }

        let ikData;
        try {
          ikData = JSON.parse(ikRaw);
        } catch {
          return json({ error: 'Invalid ImageKit response', details: ikRaw }, 502, origin);
        }

        console.log('✅ ImageKit upload success, URL:', ikData.url);

        // Notify bot via Service Binding (non-blocking)
        try {
          const botForm = new FormData();
          botForm.append('photo', photo);
          botForm.append('user_name', userName);

          const botRequest = new Request('https://morstrixbot.morstrix.workers.dev/api/send-art', {
            method: 'POST',
            headers: { 'X-Site-Token': env.SITE_API_KEY },
            body: botForm
          });

          await env.MORSTRIXBOT_SERVICE.fetch(botRequest);
          console.log('✅ Bot notified');
        } catch (e) {
          console.warn('⚠️ Bot notify failed:', e);
        }

        return json({ url: ikData.url, fileId: ikData.fileId }, 200, origin);
      }

      console.warn(`⚠️ No handler matched: ${request.method} ${url.pathname}`);
      return text('Not found', 404, origin);
    } catch (e) {
      console.error('❌ Internal error:', e.message, e);
      return json({ error: 'Internal error', details: String(e?.message || e) }, 500, origin);
    }
  }
};
