'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function VolunteerSessions() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([]) // upcoming booked sessions
  const [availableSessions, setAvailableSessions] = useState([]) // sessions they can book
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setMessage('Error loading user or not signed in.')
        setLoading(false)
        return
      }

      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .from('private_volunteer_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profileData) {
        setMessage('Error loading volunteer profile.')
        setLoading(false)
        return
      }

      const { data: bookedData, error: bookedError } = await supabase
        .rpc('view_reservations', { volunteer_id_input: user.id })

      if (bookedError) {
        console.error(bookedError)
        setMessage('Error loading your sessions.')
      } else {
        setSessions(bookedData || [])
      }

      const { data: availableData, error: availableError } = await supabase
        .rpc('view_open_reservations')

      if (availableError) {
        console.error(availableError)
        setMessage('Error loading available sessions.')
      } else {
        setAvailableSessions(availableData || [])
      }

      setLoading(false)
    }

    loadData()
  }, [])

  async function handleCancelSession(reservationId, reservationDate) {
    const now = new Date()
    const sessionDate = new Date(reservationDate)
    const hoursUntilSession = (sessionDate - now) / (1000 * 60 * 60)

    if (hoursUntilSession < 48) {
      setMessage('You can only cancel sessions at least 48 hours in advance.')
      return
    }

    const { error } = await supabase.rpc('update_reservations', {
      reservation_id_input: reservationId,
      new_volunteer_id_input: null,
    })

    if (error) {
      console.error(error)
      setMessage('Error canceling session.')
    } else {
      setMessage('Session successfully canceled.')
      setSessions(sessions.filter((s) => s.reservation_id !== reservationId))
    }
  }

  async function handleBookSession(reservationId) {
    if (!user) return

    const { error } = await supabase.rpc('add_reservation', {
      reservation_id_input: reservationId,
      volunteer_id_input: user.id,
    })

    if (error) {
      console.error(error)
      setMessage('Error booking session.')
    } else {
      setMessage('Session successfully booked!')
      setAvailableSessions(availableSessions.filter((s) => s.reservation_id !== reservationId))
    }
  }

  if (loading) {
    return <div className="text-center mt-10">Loading your sessions...</div>
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-4 text-center">Manage Your Sessions</h1>
      {message && <div className="text-center text-blue-600 mb-4">{message}</div>}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">My Upcoming Sessions</h2>
        {sessions.length > 0 ? (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <li key={session.reservation_id} className="flex justify-between items-center border p-3 rounded-md">
                <span><strong>Date:</strong> {new Date(session.reservation_date).toLocaleString()}</span>
                <button
                  onClick={() => handleCancelSession(session.reservation_id, session.reservation_date)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        ) : <p>You have no upcoming sessions booked.</p>}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Available Sessions</h2>
        {availableSessions.length > 0 ? (
          <ul className="space-y-3">
            {availableSessions.map((session) => (
              <li key={session.reservation_id} className="flex justify-between items-center border p-3 rounded-md">
                <span><strong>Date:</strong> {new Date(session.reservation_date).toLocaleString()}</span>
                <button
                  onClick={() => handleBookSession(session.reservation_id)}
                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Book
                </button>
              </li>
            ))}
          </ul>
        ) : <p>No available sessions at this time.</p>}
      </section>
    </div>
  )
}
