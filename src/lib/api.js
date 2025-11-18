// Simple API helper for GymControl AI
// Uses VITE_BACKEND_URL or falls back to same origin

const BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Error de red')
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

export const api = {
  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  // Seed
  seed: () => request('/seed', { method: 'POST' }),
  // Dashboard
  statsOverview: () => request('/stats/overview'),
  statsPaymentsDaily: () => request('/stats/payments_daily?days=30'),
  // Plans
  listPlans: (onlyActive = false) => request(`/plans${onlyActive ? '?only_active=true' : ''}`),
  createPlan: (data) => request('/plans', { method: 'POST', body: JSON.stringify(data) }),
  updatePlan: (id, data) => request(`/plans/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  // Members
  listMembers: (q = '') => request(`/members${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  createMember: (data) => request('/members', { method: 'POST', body: JSON.stringify(data) }),
  getMember: (id) => request(`/members/${id}`),
  listMemberMemberships: (id) => request(`/members/${id}/memberships`),
  createMembership: (memberId, data) => request(`/members/${memberId}/memberships`, { method: 'POST', body: JSON.stringify(data) }),
  cancelMembership: (id) => request(`/memberships/${id}/cancel`, { method: 'POST' }),
  // Payments
  listPayments: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.date_from) qs.append('date_from', params.date_from)
    if (params.date_to) qs.append('date_to', params.date_to)
    if (params.method) qs.append('method', params.method)
    const s = qs.toString()
    return request(`/payments${s ? `?${s}` : ''}`)
  },
  createPayment: (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  // Checkins
  listCheckins: (day) => request(`/checkins${day ? `?day=${day}` : ''}`),
  checkin: (memberId) => request(`/members/${memberId}/checkin`, { method: 'POST' }),
}
