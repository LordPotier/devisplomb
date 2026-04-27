import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { generateDevisPDF } from '../../lib/pdf'

export default function DevisDetail() {
  const router = useRouter()
  const { id } = router.query
  const [devis, setDevis] = useState(null)
  const [userPlan, setUserPlan] = useState({ plan: 'gratuit' })

  useEffect(() => {
    if (id) {
      supabase.from('devis').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setDevis(data)
      })
      // Vérifier le plan utilisateur
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          supabase.from('profils').select('plan').eq('id', data.session.user.id).single().then(({ data: profil }) => {
            setUserPlan({ plan: profil?.plan || 'gratuit' })
          })
        }
      })
    }
  }, [id])

  const isPro = userPlan.plan === 'pro'

  function handleExportPDF() {
    if (!isPro) {
      alert('Fonctionnalité Pro : Export PDF débloqué avec le plan Pro.')
      router.push('/abonnement')
      return
    }
    generateDevisPDF(devis)
  }

  function handleSignature() {
    if (!isPro) {
      alert('Fonctionnalité Pro : Signature électronique débloquée avec le plan Pro.')
      router.push('/abonnement')
      return
    }
    // Logique de signature à implémenter
    supabase.from('devis').update({ statut: 'envoyé' }).eq('id', id).then(() => setDevis(d => ({...d, statut: 'envoyé'})))
  }

  if (!devis) return <Layout><p className="text-gray-400">Chargement...</p></Layout>

  return (
    <Layout active="/devis">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{devis.numero}</h1>
          <p className="text-gray-500 text-sm mt-1">{devis.client_nom}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push(`/devis/modifier/${id}`)}
            className="border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            Modifier
          </button>
          <button onClick={handleExportPDF}
            className={`border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 ${!isPro ? 'border-orange-200 text-orange-600' : 'border-gray-200'}`}>
            {!isPro ? '🔒 Export PDF' : 'Export PDF'}
          </button>
          <button onClick={handleSignature}
            className={`px-4 py-2 rounded-lg text-sm hover:bg-gray-700 ${!isPro ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-gray-900 text-white'}`}>
            {!isPro ? '🔒 Signature' : 'Marquer comme envoyé'}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Client</p>
            <p className="font-medium">{devis.client_nom}</p>
            <p className="text-sm text-gray-500">{devis.client_adresse}</p>
            <p className="text-sm text-gray-500">{devis.client_email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Montant</p>
            <p className="text-2xl font-semibold text-gray-900">{devis.total_ttc} € TTC</p>
            <p className="text-sm text-gray-500">{devis.total_ht} € HT + TVA {devis.total_tva} €</p>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-400 text-xs border-b border-gray-100">
            <th className="pb-3">Prestation</th><th className="pb-3 text-right">Prix HT</th>
          </tr></thead>
          <tbody>
            {(devis.lignes || []).map((l, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-3">{l.nom}</td>
                <td className="py-3 text-right font-medium">{l.prix} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}