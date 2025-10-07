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

    const apiKey = process.env.BUTTONDOWN_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Buttondown configuration missing' });
    }

    const baseUrl = process.env.BUTTONDOWN_BASE_URL?.replace(/\/$/, '') || 'https://api.buttondown.com/v1';
    const endpoint = `${baseUrl}/subscribers`;

    const payload = {
      email_address: email,
      type: 'regular',
      utm_source: 'website',
      ip_address: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || undefined
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error || data?.detail || 'Subscription failed';
      return res.status(response.status).json({ error: errorMessage });
    }

    return res.status(200).json({ ok: true, subscriber: data });
  } catch (error) {
    console.error('subscribe error', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}



