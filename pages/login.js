import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Vérifier si on vient d'une redirection automatique ou d'un paramètre signup
    if (router.query.signup === 'true') {
      setIsSignup(true)
    }

    // Vérifier la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard')
      }
      // Si pas de session, rester sur /login
    })
  }, [router.query])

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
          <Link href="/accueil" className="text-3xl font-bold text-gray-900">DevisPlomb</Link>
          <p className="text-gray-500 mt-2">{isSignup ? 'Créez votre compte' : 'Connectez-vous à votre compte'}</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="vous@email.fr" />
          </div>
          {!isForgotPassword && (
            <div className="relative">
              <label className="block text-sm text-gray-600 mb-1">Mot de passe</label>
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 pr-10"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
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
        <div className="mt-6 text-center">
          <Link href="/accueil" className="text-sm text-gray-500 hover:text-gray-700">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}