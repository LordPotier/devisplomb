import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

export default function Paiements() {
  const router = useRouter()
  const [devis, setDevis] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (!data.session) router.push('/') })
    supabase.from('devis').select('*').in('statut', ['envoyé', 'accepté', 'retard']).order('created_at', { ascending: false }).then(({ data }) => { if (data) setDevis(data) })
  }, [])

  async function marquerPaye(id) {
    await supabase.from('devis').update({ statut: 'payé' }).eq('id', id)
    setDevis(prev => prev.filter(d => d.id !== id))
  }

  const enRetard = devis.filter(d => d.statut === 'retard')
  const enAttente = devis.filter(d => d.statut === 'envoyé' || d.statut === 'accepté')

  return (
    <Layout active="/paiements">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Suivi des paiements</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">En retard</p>
          <p className="text-2xl font-semibold text-red-500">{enRetard.reduce((a,d)=>a+d.total_ttc,0)} €</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">En attente</p>
          <p className="text-2xl font-semibold text-amber-500">{enAttente.reduce((a,d)=>a+d.total_ttc,0)} €</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">Total à encaisser</p>
          <p className="text-2xl font-semibold text-gray-900">{devis.reduce((a,d)=>a+d.total_ttc,0)} €</p>
        </div>
      </div>

      {enRetard.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-red-700 mb-2">⚠️ Paiements en retard</p>
          {enRetard.map(d => (
            <div key={d.id} className="flex justify-between items-center bg-white rounded-lg p-3 mb-2">
              <div><p className="font-medium text-sm">{d.client_nom}</p><p className="text-xs text-gray-400">{d.numero} · {d.total_ttc} €</p></div>
              <div className="flex gap-2">
                <button onClick={() => marquerPaye(d.id)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Marquer payé</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-medium text-gray-900 mb-4">Tous les paiements en cours</h2>
        {devis.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Aucun paiement en attente 🎉</p>
        ) : devis.map(d => (
          <div key={d.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="font-medium text-sm">{d.client_nom}</p>
              <p className="text-xs text-gray-400">{d.numero} · {new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-sm">{d.total_ttc} €</span>
              <button onClick={() => marquerPaye(d.id)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Marquer payé</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
