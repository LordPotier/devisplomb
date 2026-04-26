import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  async function handleAuth(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        })
        if (error) throw error
        setMsg('📧 Email de réinitialisation envoyé ! Vérifiez votre boîte mail.')
      } else if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        router.push('/abonnement')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err) {
      setMsg(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-content-center">
      <div className="max-w-md w-full mx-auto mt-20 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DevisPlomb</h1>
          <p className="text-gray-500 mt-2">Gérez vos devis et paiements facilement</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="vous@email.fr" />
          </div>
          {!isForgotPassword && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mot de passe</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="••••••••" />
          </div>
          )}
          {msg && <p className={`text-sm p-3 rounded-lg ${msg.includes('envoyé') ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>{msg}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50">
            {loading ? 'Chargement...' : isForgotPassword ? 'Envoyer l\'email' : isSignup ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          {isSignup ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <button onClick={() => setIsSignup(!isSignup)} className="text-gray-900 font-medium underline">
            {isSignup ? 'Se connecter' : 'Créer un compte'}
          </button>
        </p>
        {!isSignup && !isForgotPassword && (
          <p className="text-center text-sm mt-2">
            <button onClick={() => { setIsForgotPassword(true); setMsg('') }} className="text-gray-500 hover:text-gray-700 underline">
              Mot de passe oublié ?
            </button>
          </p>
        )}
        {isForgotPassword && (
          <p className="text-center text-sm mt-4">
            <button onClick={() => { setIsForgotPassword(false); setMsg('') }} className="text-gray-500 hover:text-gray-700 underline">
              ← Retour à la connexion
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
