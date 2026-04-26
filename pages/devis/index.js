import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'

export default function Devis() {
  const router = useRouter()
  const [devis, setDevis] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (!data.session) router.push('/') })
    supabase.from('devis').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setDevis(data) })
  }, [])

  const badge = (s) => {
    const m = { 'brouillon': 'bg-gray-100 text-gray-600', 'envoyé': 'bg-blue-100 text-blue-700', 'accepté': 'bg-green-100 text-green-700', 'retard': 'bg-red-100 text-red-600', 'payé': 'bg-green-100 text-green-700' }
    return m[s] || 'bg-gray-100 text-gray-500'
  }

  return (
    <Layout active="/devis">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mes devis</h1>
        <a href="/devis/nouveau" className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition">+ Nouveau devis</a>
      </div>
      <div className="bg-white rounded-xl border border-gray-100">
        {devis.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📄</p>
            <p>Aucun devis pour l'instant</p>
            <a href="/devis/nouveau" className="text-sm text-gray-900 underline mt-2 inline-block">Créer votre premier devis</a>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 text-xs border-b border-gray-100">
              <th className="p-4">N°</th><th className="p-4">Client</th><th className="p-4">Montant TTC</th><th className="p-4">Date</th><th className="p-4">Statut</th><th className="p-4">Actions</th>
            </tr></thead>
            <tbody>
              {devis.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium">{d.numero}</td>
                  <td className="p-4">{d.client_nom}</td>
                  <td className="p-4 font-medium">{d.total_ttc} €</td>
                  <td className="p-4 text-gray-400">{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${badge(d.statut)}`}>{d.statut}</span></td>
                  <td className="p-4">
                    <button onClick={() => router.push(`/devis/${d.id}`)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 mr-2">Voir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
