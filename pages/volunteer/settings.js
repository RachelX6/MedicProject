import { useEffect, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import useProfile from '../../hooks/useProfile'

export default function SettingsPage() {
    const supabase = useSupabaseClient()
    const user = useUser()
    const { profile } = useProfile()

    const [emailPreferences, setEmailPreferences] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [statusMsg, setStatusMsg] = useState('')

    // ✅ All senior homes
    const allSeniorHomes = [
        'Tapestry',
        'Terrace on 7th',
        'South Granville Lodge',
        'Point Grey Private Hospital',
        'Pinegrove Place',
        'Opal by Element',
        'Casa Mia',
        'Arbutus Care Center',
    ]

    useEffect(() => {
        if (!profile) return

        supabase
            .from('private_profiles')
            .select('email_preferences')
            .eq('id', profile.id)
            .single()
            .then(({ data }) => {
                if (data?.email_preferences) {
                    setEmailPreferences(data.email_preferences)
                }
                setLoading(false)
            })
    }, [profile])

    const togglePreference = (value) => {
        setEmailPreferences((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        )
    }

    const savePreferences = async () => {
        if (!user) return
        setSaving(true)
        setStatusMsg('Saving...')

        try {
            const { data, error } = await supabase.functions.invoke('update_email_preferences', {
                body: {
                    email_preferences: emailPreferences,
                },
            })

            if (error) {
                console.error('Edge Function error:', error)
                setStatusMsg('❌ Failed to save preferences.')
            } else {
                setStatusMsg('✅ Preferences saved successfully.')
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            setStatusMsg('❌ Unexpected error.')
        } finally {
            setSaving(false)
            setTimeout(() => setStatusMsg(''), 3000)
        }
    }

    if (!user || !profile || loading) return <div>Loading settings…</div>

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
            <h1 style={{ color: '#8d171b' }}>Settings</h1>

            <section style={{ marginTop: '2rem', color: 'black' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#8d171b' }}>Email Preferences</h3>
                <p style={{ marginBottom: '1.2rem', lineHeight: '1.6' }}>
                    Select the senior homes you would like to receive email notifications from — including homes that are not your assigned location.
                    <br />
                    If a volunteer becomes unavailable for a session at one of the selected homes, you will be notified by email. You can claim open sessions through the <strong>Change Availability</strong> page.
                </p>

                <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'grid', gap: '0.5rem' }}>
                    {allSeniorHomes.map((home) => (
                        <li key={home}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                cursor: 'pointer',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={emailPreferences.includes(home)}
                                    onChange={() => togglePreference(home)}
                                />
                                {home}
                            </label>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={savePreferences}
                    disabled={saving}
                    style={{
                        marginTop: '1rem',
                        backgroundColor: '#8d171b',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    {saving ? 'Saving…' : 'Save Preferences'}
                </button>
                {statusMsg && <p style={{ marginTop: '0.5rem' }}>{statusMsg}</p>}
            </section>
            {/* Back to profile button */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                    type="button"
                    onClick={() => window.location.href = "/profile"}
                    style={{
                        backgroundColor: '#ccc',
                        color: '#333',
                        padding: '0.65rem 1.8rem',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                    }}
                >
                    ← Back to Profile
                </button>
            </div>
        </div>
        
        
    )
}
