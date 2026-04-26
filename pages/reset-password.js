import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Vérifier le token dans l'URL
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) {
      setMsg('Lien de réinitialisation invalide ou expiré.')
    }
  }, [])

  async function handleReset(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    if (password !== confirmPassword) {
      setMsg('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMsg('Le mot de passe doit contenir au moins 6 caractères.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setMsg('✅ Mot de passe mis à jour !')
      setTimeout(() => router.push('/'), 3000)
    } catch (err) {
      setMsg(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-content-center">
      <div className="max-w-md w-full mx-auto mt-20 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">🔐 Réinitialiser le mot de passe</h1>
          <p className="text-gray-500 mt-2">Entrez votre nouveau mot de passe</p>
        </div>

        {success ? (
          <div className="text-center">
            <p className="text-green-600 bg-green-50 p-4 rounded-lg">{msg}</p>
            <p className="text-sm text-gray-500 mt-4">Redirection vers la connexion...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nouveau mot de passe</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirmer le mot de passe</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="••••••••" />
            </div>
            {msg && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{msg}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50">
              {loading ? 'Chargement...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}