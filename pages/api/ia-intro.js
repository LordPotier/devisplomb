export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { client, desc, prestations } = req.body
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Rédige une courte introduction professionnelle (3 phrases max) pour un devis de plomberie destiné à ${client}. Chantier : ${desc || 'travaux de plomberie'}. Prestations : ${prestations}. Commence par "Suite à notre échange,". Ton professionnel et chaleureux.`
        }]
      })
    })
    const data = await response.json()
    const text = data.content?.map(c => c.text || '').join('') || ''
    res.json({ text })
  } catch (e) {
    res.json({ text: 'Suite à notre échange, nous vous adressons ce devis pour les travaux convenus. Nous nous engageons à intervenir dans les délais indiqués avec le plus grand soin.' })
  }
}
