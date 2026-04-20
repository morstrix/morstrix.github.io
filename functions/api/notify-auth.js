export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const res = await fetch('https://morstrixbot.morstrix.workers.dev/api/notify-auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Site-Token': env.SITE_API_KEY
    },
    body: JSON.stringify(body)
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') || 'text/plain; charset=utf-8' }
  });
}
