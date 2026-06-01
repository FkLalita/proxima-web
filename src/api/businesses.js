const BASE = '/api/v1'

async function get(path) {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

async function post(path, body, token) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const businessApi = {
  nearby: (lat, lng, { radius = 2000, category = '', limit = 30 } = {}) =>
    get(`/businesses/nearby?lat=${lat}&lng=${lng}&radius=${radius}&category=${encodeURIComponent(category)}&limit=${limit}`),

  search: (q, lat, lng) =>
    get(`/businesses/search?q=${encodeURIComponent(q)}&lat=${lat}&lng=${lng}`),

  register: (input, token) =>
    post('/businesses', input, token),

  claim: (input, token) =>
    post('/businesses/claim', input, token),

  flag: (id, reason, token) =>
    post(`/businesses/${id}/flag`, { reason }, token),

  getMyBusinesses: (token) =>
    fetch('/api/v1/owner/businesses', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()),

  updateBusiness: (id, input, token) =>
    fetch(`/api/v1/businesses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    }).then(r => r.json()),

  deleteBusiness: (id, token) =>
    fetch(`/api/v1/businesses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),

  recordView: (id) =>
    fetch(`/api/v1/businesses/${id}/view`, { method: 'POST' }),
}


