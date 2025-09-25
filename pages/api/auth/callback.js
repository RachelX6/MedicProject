// pages/api/auth/callback.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { code } = req.query

  if (!code) {
    res.status(400).send('Missing code')
    return
  }

  const { error: exchangeError } = 
    await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    console.error('OAuth exchange error:', exchangeError)
    res.redirect(307, '/?error=oauth')
    return
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    res.redirect(307, '/?error=no_session')
    return
  }

  // 👇 make sure this matches your actual table name!
  const { data: profile, error: profileError } = await supabase
    .from('profile')
    .select('id')
    .eq('id', session.user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Profile lookup error:', profileError)
    res.redirect(307, '/dashboard')
    return
  }

  const destination = profile ? '/profile' : '/register'
  res.redirect(307, destination)
}
