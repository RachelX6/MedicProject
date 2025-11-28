import { useEffect, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import useProfile from '../hooks/useProfile'
import { invokeFunction } from '../lib/supabaseFunctions'

export default function SettingsPage() {
    const supabase = useSupabaseClient()
    const user = useUser()
    const { profile } = useProfile()

    const [emailPreferences, setEmailPreferences] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [statusMsg, setStatusMsg] = useState('')

    // All senior homes (for email notifications)
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
                if (data?.email_preferences) setEmailPreferences(data.email_preferences)
                setLoading(false)
            })
    }, [profile, supabase])

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
            const { data } = await invokeFunction(supabase, 'update_email_preferences', { body: { email_preferences: emailPreferences } })
            if (data?.error) {
                console.error('Edge Function returned error:', data)
                setStatusMsg('❌ Failed to save preferences.')
            } else {
                setStatusMsg('✅ Preferences saved successfully.')
            }
        } catch (err) {
            console.error('Edge Function error:', err)
            setStatusMsg('❌ Failed to save preferences.')
        } finally {
            setSaving(false)
            setTimeout(() => setStatusMsg(''), 3000)
        }
    }

    if (!user || !profile || loading) return <div>Loading settings…</div>

    return (
        <div style={{
            maxWidth: '700px',
            margin: '2rem auto',
            padding: '2.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        }}>
            <h1 style={{ color: '#8d171b', marginBottom: '1.5rem', fontSize: '2rem' }}>Settings</h1>

            <section style={{ marginTop: '2rem', color: '#171717' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#8d171b', fontWeight: '600' }}>Email Preferences</h3>
                <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', color: '#666' }}>
                    Select the senior homes you would like to receive email notifications from.
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

            {/* Back to dashboard/home */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                    type="button"
                    onClick={() => window.location.href = "/"}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#8d171b',
                        padding: '0.75rem 2rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    ← Back
                </button>
            </div>
        </div>
    )
}
