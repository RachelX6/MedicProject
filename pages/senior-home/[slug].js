import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { ExternalLink, CheckCircle, FileText, MapPin } from 'lucide-react'
import seniorHomesData from '../../data/seniorHomes.json'

export default function SeniorHomePage() {
    const router = useRouter()
    const { slug } = router.query
    const [homeData, setHomeData] = useState(null)

    useEffect(() => {
        if (slug && seniorHomesData[slug]) {
            setHomeData(seniorHomesData[slug])
        }
    }, [slug])

    if (!homeData) {
        return (
            <div style={{
                maxWidth: '700px',
                margin: '4rem auto',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>Loading...</p>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '2rem' }}>
            {/* Hero Banner */}
            <div style={{
                background: `linear-gradient(135deg, ${homeData.color} 0%, #8d171b 100%)`,
                color: 'white',
                padding: '3rem 2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.75rem',
                    fontWeight: '700'
                }}>
                    {homeData.fullName}
                </h1>
                <p style={{
                    fontSize: '1.2rem',
                    marginBottom: '1rem',
                    opacity: 0.95,
                    fontStyle: 'italic'
                }}>
                    {homeData.tagline}
                </p>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem',
                    opacity: 0.9
                }}>
                    <MapPin size={18} />
                    <span>{homeData.address}</span>
                </div>
            </div>

            {/* Welcome Section */}
            <div style={{
                backgroundColor: '#ffffff',
                padding: '2.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            }}>
                <h2 style={{
                    color: homeData.color,
                    marginBottom: '1.5rem',
                    fontSize: '1.8rem',
                    borderBottom: `3px solid ${homeData.color}`,
                    paddingBottom: '0.5rem',
                    display: 'inline-block'
                }}>
                    Welcome
                </h2>
                <p style={{
                    color: '#171717',
                    lineHeight: '1.8',
                    fontSize: '1.05rem'
                }}>
                    {homeData.introduction}
                </p>
            </div>

            {/* Volunteer Checklist */}
            <div style={{
                backgroundColor: '#ffffff',
                padding: '2.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            }}>
                <h2 style={{
                    color: homeData.color,
                    marginBottom: '1.5rem',
                    fontSize: '1.8rem',
                    borderBottom: `3px solid ${homeData.color}`,
                    paddingBottom: '0.5rem',
                    display: 'inline-block'
                }}>
                    Volunteer Checklist
                </h2>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                }}>
                    {homeData.checklist.map((item, index) => (
                        <li key={index} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '1rem',
                            padding: '1rem',
                            marginBottom: '0.75rem',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: `1px solid ${homeData.color}20`,
                        }}>
                            <CheckCircle
                                size={24}
                                style={{
                                    color: homeData.color,
                                    flexShrink: 0,
                                    marginTop: '0.125rem'
                                }}
                            />
                            <span style={{
                                color: '#171717',
                                fontSize: '1.05rem',
                                lineHeight: '1.6'
                            }}>
                                {item}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Resources */}
            <div style={{
                backgroundColor: '#ffffff',
                padding: '2.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            }}>
                <h2 style={{
                    color: homeData.color,
                    marginBottom: '1.5rem',
                    fontSize: '1.8rem',
                    borderBottom: `3px solid ${homeData.color}`,
                    paddingBottom: '0.5rem',
                    display: 'inline-block'
                }}>
                    Resources
                </h2>
                <div style={{
                    display: 'grid',
                    gap: '1rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
                }}>
                    {homeData.resources.map((resource, index) => (
                        <a
                            key={index}
                            href={resource.url}
                            style={{
                                display: 'block',
                                padding: '1.5rem',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: `2px solid ${homeData.color}20`,
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = homeData.color
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = `${homeData.color}20`
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.5rem'
                            }}>
                                <FileText size={20} style={{ color: homeData.color }} />
                                <h3 style={{
                                    margin: 0,
                                    color: '#171717',
                                    fontSize: '1.1rem',
                                    fontWeight: '600'
                                }}>
                                    {resource.title}
                                </h3>
                            </div>
                            <p style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '0.95rem',
                                lineHeight: '1.5'
                            }}>
                                {resource.description}
                            </p>
                        </a>
                    ))}
                </div>
            </div>

            {/* Screening Section */}
            <div style={{
                backgroundColor: '#ffffff',
                padding: '2.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                border: `2px solid ${homeData.color}30`,
            }}>
                <h2 style={{
                    color: homeData.color,
                    marginBottom: '1.5rem',
                    fontSize: '1.8rem',
                    borderBottom: `3px solid ${homeData.color}`,
                    paddingBottom: '0.5rem',
                    display: 'inline-block'
                }}>
                    Required Screening
                </h2>
                <p style={{
                    color: '#171717',
                    lineHeight: '1.7',
                    marginBottom: '2rem',
                    fontSize: '1.05rem'
                }}>
                    {homeData.screeningInstructions}
                </p>
                <a
                    href={homeData.screeningLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        backgroundColor: homeData.color,
                        color: 'white',
                        padding: '1rem 2rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)'
                        e.currentTarget.style.filter = 'brightness(1.1)'
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                        e.currentTarget.style.filter = 'brightness(1)'
                    }}
                >
                    <span>Complete Screening Process</span>
                    <ExternalLink size={20} />
                </a>
            </div>

            {/* Back Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                    onClick={() => router.push('/profile')}
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
                        e.currentTarget.style.backgroundColor = '#f8f9fa'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff'
                        e.currentTarget.style.transform = 'translateY(0)'
                    }}
                >
                    ← Back to Profile
                </button>
            </div>
        </div>
    )
}
