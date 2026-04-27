import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const { devisId } = req.body

  if (!devisId) {
    return res.status(400).json({ error: 'ID du devis requis' })
  }

  try {
    // Récupérer le devis
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select('*')
      .eq('id', devisId)
      .single()

    if (devisError || !devis) {
      return res.status(404).json({ error: 'Devis non trouvé' })
    }

    // Récupérer l'email de l'utilisateur pour l'envoyer depuis
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!devis.client_email) {
      return res.status(400).json({ error: 'Email client non défini' })
    }

    // Construire le HTML du devis
    const lignesHTML = (devis.lignes || [])
      .map(l => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${l.nom}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${l.prix} €</td>
        </tr>
      `).join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Devis ${devis.numero}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">DEVIS</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0;">N° ${devis.numero}</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;">Date</p>
              <p style="margin: 0; font-weight: 500;">${new Date(devis.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;">Validité</p>
              <p style="margin: 0; font-weight: 500;">30 jours</p>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">CLIENT</p>
            <p style="margin: 0 0 4px 0; font-weight: 500;">${devis.client_nom}</p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${devis.client_adresse || ''}</p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${devis.client_email}</p>
          </div>

          ${devis.description ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">DESCRIPTION</p>
            <p style="margin: 0; color: #374151;">${devis.description}</p>
          </div>
          ` : ''}

          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 500;">PRESTATION</th>
                <th style="padding: 12px; text-align: right; font-size: 12px; color: #6b7280; font-weight: 500;">PRIX HT</th>
              </tr>
            </thead>
            <tbody>
              ${lignesHTML}
            </tbody>
          </table>

          <div style="background: white; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Total HT</span>
              <span style="font-weight: 500;">${devis.total_ht} €</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">TVA (10%)</span>
              <span style="font-weight: 500;">${devis.total_tva} €</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #2563eb;">
              <span style="font-weight: 600; font-size: 18px;">Total TTC</span>
              <span style="font-weight: 700; font-size: 24px; color: #2563eb;">${devis.total_ttc} €</span>
            </div>
          </div>

          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px;">
            Devis généré par DevisPlomb · www.devisplomb.fr
          </p>
        </div>
      </body>
      </html>
    `

    // Envoyer l'email via Resend
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      return res.status(500).json({ error: 'Clé API Resend non configurée' })
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'DevisPlomb <onboarding@resend.dev>',
        to: [devis.client_email],
        subject: `Devis ${devis.numero} - ${devis.client_nom}`,
        html: htmlContent
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Erreur Resend:', result)
      return res.status(500).json({ error: result.message || 'Erreur lors de l\'envoi' })
    }

    // Mettre à jour le statut du devis
    await supabase.from('devis').update({ statut: 'envoyé' }).eq('id', devisId)

    return res.status(200).json({ success: true, message: 'Devis envoyé par email' })
  } catch (error) {
    console.error('Erreur:', error)
    return res.status(500).json({ error: error.message })
  }
}