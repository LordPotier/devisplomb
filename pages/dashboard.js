import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ devis: 0, ca: 0, enAttente: 0, enRetard: 0 })
  const [recentDevis, setRecentDevis] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/')
    })
    loadData()
  }, [])

  async function loadData() {
    const { data } = await supabase.from('devis').select('*').order('created_at', { ascending: false }).limit(5)
    if (data) {
      setRecentDevis(data)
      const ca = data.reduce((a, d) => a + (d.total_ttc || 0), 0)
      const enAttente = data.filter(d => d.statut === 'envoyé').reduce((a, d) => a + (d.total_ttc || 0), 0)
      const enRetard = data.filter(d => d.statut === 'retard').reduce((a, d) => a + (d.total_ttc || 0), 0)
      setStats({ devis: data.length, ca, enAttente, enRetard })
    }
  }

  const statCards = [
    { label: 'Devis ce mois', value: stats.devis, color: 'text-gray-900' },
    { label: 'CA total HT', value: stats.ca + ' €', color: 'text-green-600' },
    { label: 'En attente', value: stats.enAttente + ' €', color: 'text-amber-600' },
    { label: 'En retard', value: stats.enRetard + ' €', color: 'text-red-500' },
  ]

  const statusBadge = (s) => {
    const map = { 'brouillon': 'bg-gray-100 text-gray-600', 'envoyé': 'bg-blue-100 text-blue-700', 'accepté': 'bg-green-100 text-green-700', 'retard': 'bg-red-100 text-red-700', 'payé': 'bg-green-100 text-green-700' }
    return map[s] || 'bg-gray-100 text-gray-500'
  }

  return (
    <Layout active="/dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Bonjour 👋</h1>
        <p className="text-gray-500 mt-1 text-sm">Voici un aperçu de votre activité</p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium text-gray-900">Derniers devis</h2>
          <a href="/devis/nouveau" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">+ Nouveau devis</a>
        </div>
        {recentDevis.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📄</p>
            <p>Aucun devis pour l'instant</p>
            <a href="/devis/nouveau" className="text-sm text-gray-900 underline mt-2 inline-block">Créer votre premier devis</a>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 text-xs border-b border-gray-100">
              <th className="pb-3">N°</th><th className="pb-3">Client</th><th className="pb-3">Montant</th><th className="pb-3">Date</th><th className="pb-3">Statut</th>
            </tr></thead>
            <tbody>
              {recentDevis.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/devis/${d.id}`)}>
                  <td className="py-3 font-medium">{d.numero}</td>
                  <td className="py-3">{d.client_nom}</td>
                  <td className="py-3 font-medium">{d.total_ttc} €</td>
                  <td className="py-3 text-gray-400">{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(d.statut)}`}>{d.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
