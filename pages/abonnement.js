import { useState } from 'react'

export default function Abonnement() {
  const [loading, setLoading] = useState(false)

  async function subscribe() {
    window.location.href = 'https://buy.stripe.com/7sY28s4w3968aA137edZ600'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-sm w-full mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">DevisPlomb Pro</h1>
        <p className="text-gray-500 text-sm mb-6">Sans engagement · Résiliable à tout moment</p>
        <div className="text-4xl font-bold text-gray-900 mb-1">19 €<span className="text-lg font-normal text-gray-400">/mois</span></div>
        <p className="text-xs text-gray-400 mb-6">HT</p>
        <ul className="text-sm text-left space-y-2 mb-6 text-gray-600">
          {['Devis illimités','Export PDF professionnel','Signature électronique','Suivi des paiements','Génération IA des textes','Support par email'].map(f => (
            <li key={f} className="flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>
          ))}
        </ul>
        <button onClick={subscribe} disabled={loading}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition disabled:opacity-50">
          {loading ? 'Redirection...' : 'Souscrire maintenant'}
        </button>
        <p className="text-xs text-gray-400 mt-3">Paiement sécurisé par Stripe</p>
      </div>
    </div>
  )
}
