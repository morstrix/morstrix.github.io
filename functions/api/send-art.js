export async function onRequestPost({ request, env }) {
  const incoming = await request.formData();
  const formData = new FormData();

  for (const [key, value] of incoming.entries()) {
    formData.append(key, value);
  }

  const res = await fetch('https://morstrixbot.morstrix.workers.dev/api/send-art', {
    method: 'POST',
    headers: {
      'X-Site-Token': env.SITE_API_KEY
    },
    body: formData
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') || 'text/plain; charset=utf-8' }
  });
}
