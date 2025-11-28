// Small helper to standardize invoking Supabase Edge Functions
export async function invokeFunction(supabase, name, opts = {}) {
  const { method = 'POST', body, requireAuth = false } = opts

  // If GET or explicit requireAuth, call the function endpoint directly so we can
  // attach the user's access token in the Authorization header.
  if (method === 'GET' || requireAuth) {
    // try to get a session token (may be undefined in anon contexts)
    let accessToken
    try {
      const { data: { session } = {} } = await supabase.auth.getSession()
      accessToken = session?.access_token
    } catch (e) {
      // ignore - continue without token
    }

    const url = `${supabase.supabaseUrl}/functions/v1/${name}`
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const text = await res.text()
    let data
    try {
      data = text ? JSON.parse(text) : null
    } catch (e) {
      data = text
    }

    if (!res.ok) {
      const err = (data && data.error) || data || { message: 'Function request failed' }
      throw err
    }

    return { data }
  }

  // Otherwise prefer the client SDK invoke (POST-like calls)
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) throw error
  return { data }
}
