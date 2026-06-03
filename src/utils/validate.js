export const validate = {
  required: v => v?.trim() ? null : 'This field is required',

  name: v => {
    if (!v?.trim()) return 'Business name is required'
    if (v.trim().length < 2) return 'Name must be at least 2 characters'
    if (v.trim().length > 100) return 'Name too long'
    return null
  },

  email: v => {
    if (!v?.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email'
    return null
  },

  password: v => {
    if (!v) return 'Password is required'
    if (v.length < 6) return 'Password must be at least 6 characters'
    return null
  },

  phone: v => {
    if (!v?.trim()) return null // optional
    const cleaned = v.replace(/\D/g, '')
    if (cleaned.length < 10 || cleaned.length > 15) return 'Enter a valid phone number'
    return null
  },

  whatsapp: v => {
    if (!v?.trim()) return null // optional
    const cleaned = v.replace(/\D/g, '')
    if (cleaned.length < 10 || cleaned.length > 15) return 'Enter a valid WhatsApp number'
    return null
  },

  url: v => {
    if (!v?.trim()) return null // optional
    try {
      new URL(v.trim())
      return null
    } catch {
      return 'Enter a valid URL (include https://)'
    }
  },

  instagram: v => {
    if (!v?.trim()) return null
    const clean = v.trim().replace(/^@/, '')
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(clean)) return 'Enter a valid Instagram handle'
    return null
  },

  address: v => {
    if (!v?.trim()) return 'Address is required'
    if (v.trim().length < 5) return 'Enter a more specific address'
    return null
  },
}

export function sanitize(v) {
  if (typeof v !== 'string') return v
  return v.trim().replace(/[<>]/g, '')
}

export function sanitizePhone(v) {
  if (!v) return ''
  const digits = v.replace(/\D/g, '')
  // Convert 08012345678 → +2348012345678
  if (digits.startsWith('0') && digits.length === 11) {
    return '+234' + digits.slice(1)
  }
  if (!digits.startsWith('234') && digits.length === 10) {
    return '+234' + digits
  }
  return digits.startsWith('+') ? v.trim() : '+' + digits
}
