export function getUserFromToken() {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    // Giải mã payload JWT ở phần thứ hai
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload
  } catch (err) {
    return null
  }
}

export function getUserRole() {
  const user = getUserFromToken()
  return user?.role || null
}
