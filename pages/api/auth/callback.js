import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { code } = req.query

  if (!code) {
    res.status(400).send('Missing code')
    return
  }

  // Exchange OAuth code for a Supabase session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
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

  // ✅ Check if a volunteer profile exists for this user
  const { data: profile, error: profileError } = await supabase
    .from('private_volunteer_profiles')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Volunteer profile lookup error:', profileError)
    res.redirect(307, '/profile')
    return
  }

  // ✅ If they already have a volunteer profile, send them to their dashboard/profile
  // Otherwise, send them to register to complete setup
  const destination = profile ? '/profile' : '/register'
  res.redirect(307, destination)
}
