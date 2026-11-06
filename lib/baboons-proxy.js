const API_BASE_URL = process.env.BABOONS_API_URL || 'https://baboons-erp-concesionarios.fly.dev';

async function proxyToBaboons(req, res, endpoint) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Método no permitido.' });
    return;
  }

  const token = process.env.SANCHEZGIL_SITE_TOKEN;
  if (!token) {
    res.status(503).json({ error: 'Servicio no configurado.' });
    return;
  }

  const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SanchezGil-Site-Token': token,
        ...(forwardedFor ? { 'X-SG-Client-IP': forwardedFor } : {}),
      },
      body: JSON.stringify(req.body || {}),
      signal: AbortSignal.timeout(55000),
    });
    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (error) {
    res.status(502).json({ error: 'El servicio de atención no respondió.' });
  }
}

module.exports = { proxyToBaboons };
