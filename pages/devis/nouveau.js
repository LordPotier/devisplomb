import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'

const PRESTATIONS = [
  { nom: 'Débouchage canalisation', prix: 90 },
  { nom: 'Remplacement robinet', prix: 120 },
  { nom: 'Remplacement chauffe-eau', prix: 350 },
  { nom: 'Détection de fuite', prix: 150 },
  { nom: 'Pose WC suspendu', prix: 280 },
  { nom: 'Remplacement joints', prix: 60 },
  { nom: 'Installation VMC', prix: 320 },
  { nom: 'Pose mitigeur thermostatique', prix: 180 },
]

export default function NouveauDevis() {
  const router = useRouter()
  const [form, setForm] = useState({ client_nom: '', client_adresse: '', client_email: '', client_tel: '', description: '', urgence: 'normal', majoration: 0 })
  const [selected, setSelected] = useState([])
  const [customNom, setCustomNom] = useState('')
  const [customPrix, setCustomPrix] = useState('')
  const [customLines, setCustomLines] = useState([])
  const [loading, setLoading] = useState(false)
  const [iaText, setIaText] = useState('')
  const [iaLoading, setIaLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (!data.session) router.push('/') })
  }, [])

  function togglePresta(p) {
    setSelected(prev => prev.find(x => x.nom === p.nom) ? prev.filter(x => x.nom !== p.nom) : [...prev, p])
  }

  function addCustom() {
    if (!customNom) return
    setCustomLines(prev => [...prev, { nom: customNom, prix: parseFloat(customPrix) || 0 }])
    setCustomNom(''); setCustomPrix('')
  }

  const allLines = [...selected, ...customLines]
  const htBase = allLines.reduce((a, l) => a + l.prix, 0)
  const ht = Math.round(htBase * (1 + form.majoration / 100))
  const tva = Math.round(ht * 0.1)
  const ttc = ht + tva

  async function genIA() {
    setIaLoading(true)
    const prStr = allLines.map(l => l.nom).join(', ') || 'travaux de plomberie'
    const res = await fetch('/api/ia-intro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: form.client_nom || 'le client', desc: form.description, prestations: prStr })
    })
    const d = await res.json()
    setIaText(d.text || '')
    setIaLoading(false)
  }

  async function saveDevis() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Vérifier le plan et le nombre de devis
    const { data: profil } = await supabase.from('profils').select('plan').eq('id', user.id).single()
    const { count } = await supabase.from('devis').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    
    const isGratuit = !profil || profil.plan !== 'pro'
    if (isGratuit && count >= 3) {
      alert('Limite de 3 devis atteinte. Passez en Pro pour créer des devis illimités.')
      setLoading(false)
      return
    }
    
    const num = 'DEV-' + Date.now().toString().slice(-6)
    const { data, error } = await supabase.from('devis').insert({
      user_id: user.id,
      numero: num,
      client_nom: form.client_nom,
      client_adresse: form.client_adresse,
      client_email: form.client_email,
      client_tel: form.client_tel,
      description: form.description,
      urgence: form.urgence,
      majoration: form.majoration,
      lignes: allLines,
      intro_ia: iaText,
      total_ht: ht,
      total_tva: tva,
      total_ttc: ttc,
      statut: 'brouillon'
    }).select().single()
    setLoading(false)
    if (!error && data) router.push(`/devis/${data.id}`)
  }

  return (
    <Layout active="/devis/nouveau">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Nouveau devis</h1>
          <p className="text-gray-500 text-sm mt-1">Remplissez les informations ci-dessous</p>
        </div>
        <button onClick={saveDevis} disabled={loading || !form.client_nom}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition">
          {loading ? 'Sauvegarde...' : 'Enregistrer le devis'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-medium text-gray-900 mb-4">Informations client</h2>
            {[['client_nom','Nom / Raison sociale','M. Dupont'],['client_adresse','Adresse','12 rue de la Paix, Paris'],['client_email','Email','dupont@email.fr'],['client_tel','Téléphone','06 12 34 56 78']].map(([k,l,p]) => (
              <div key={k} className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">{l}</label>
                <input value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
                  placeholder={p} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-medium text-gray-900 mb-4">Chantier</h2>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))}
                placeholder="Fuite sous évier, remplacement mitigeur..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Urgence</label>
                <select value={form.urgence} onChange={e => setForm(f => ({...f,urgence:e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="normal">Normal (48h)</option>
                  <option value="urgent">Urgent (aujourd'hui)</option>
                  <option value="planifie">Planifié</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Majoration</label>
                <select value={form.majoration} onChange={e => setForm(f => ({...f,majoration:parseInt(e.target.value)}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                  <option value={0}>Aucune</option>
                  <option value={25}>+25%</option>
                  <option value={50}>+50%</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-medium text-gray-900 mb-4">Prestations</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PRESTATIONS.map(p => {
                const isSel = selected.find(x => x.nom === p.nom)
                return (
                  <button key={p.nom} onClick={() => togglePresta(p)}
                    className={`text-left p-3 rounded-lg border text-sm transition ${isSel ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-400'}`}>
                    <div className="font-medium">{p.nom}</div>
                    <div className={`text-xs mt-0.5 ${isSel ? 'text-gray-300' : 'text-gray-400'}`}>{p.prix} € HT</div>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <input value={customNom} onChange={e => setCustomNom(e.target.value)} placeholder="Prestation personnalisée..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
              <input value={customPrix} onChange={e => setCustomPrix(e.target.value)} type="number" placeholder="Prix HT"
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"/>
              <button onClick={addCustom} className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Ajouter</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-gray-900">Aperçu du devis</h2>
              <button onClick={genIA} disabled={iaLoading}
                className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                {iaLoading ? 'Génération...' : '✨ Intro IA'}
              </button>
            </div>

            {iaText && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-800 italic">{iaText}</div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <div className="flex justify-between mb-3">
                <div><div className="font-semibold text-base">DEVIS</div><div className="text-gray-400 text-xs">DEV-XXXXXX · {new Date().toLocaleDateString('fr-FR')}</div></div>
                <div className="text-right text-xs text-gray-500"><div className="font-medium text-gray-900">Votre Plomberie Pro</div><div>contact@plomberie.fr</div></div>
              </div>
              <div className="mb-3 p-2 bg-white rounded text-xs">
                <div className="font-medium">{form.client_nom || 'Nom du client'}</div>
                <div className="text-gray-400">{form.client_adresse || 'Adresse'}</div>
              </div>
              {allLines.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">Sélectionnez des prestations...</p>
              ) : (
                <>
                  <table className="w-full text-xs mb-3">
                    <thead><tr className="border-b border-gray-200"><th className="text-left pb-1 text-gray-400">Prestation</th><th className="text-right pb-1 text-gray-400">HT</th></tr></thead>
                    <tbody>
                      {allLines.map((l, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-1.5">{l.nom}</td>
                          <td className="text-right font-medium">{Math.round(l.prix * (1 + form.majoration / 100))} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-right text-xs space-y-0.5">
                    <div className="text-gray-500">Total HT : {ht} €</div>
                    <div className="text-gray-500">TVA 10% : {tva} €</div>
                    <div className="font-semibold text-base text-gray-900">Total TTC : {ttc} €</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
