export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const apiKey = process.env.BEEHIIV_API_KEY;
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

    if (!apiKey || !publicationId) {
      return res.status(500).json({ error: 'Beehiiv configuration missing' });
    }

    const endpoint = `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`;

    const payload = {
      email,
      reactivate_existing: true,
      send_welcome_email: true,
      utm_source: 'website',
      user_agent: req.headers['user-agent'] || undefined
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Beehiiv typically uses Bearer token auth; include X-Api-Key for broader compatibility
        'Authorization': `Bearer ${apiKey}`,
        'X-Api-Key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.message || 'Subscription failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('subscribe error', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}



