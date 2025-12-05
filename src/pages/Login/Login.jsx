import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, TextField, Typography, InputAdornment, IconButton, Link } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { loginAPI } from '~/apis/index'
import { getUserFromToken } from '~/utils/auth'
import logo from '~/assets/logo.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }
    try {
      setLoading(true)
      const res = await loginAPI({ email, password })
      // store token
      if (res?.token) {
        localStorage.setItem('auth_token', res.token)
      }

      // persist user image/name from login response if provided (so Header can show avatar without extra API calls)
      try {
        const user = res?.employee || res?.customer
        if (user?.image) localStorage.setItem('auth_user_image', user.image)
        if (user?.name) localStorage.setItem('auth_user_name', user.name)
      } catch (e) {
        // ignore storage errors
      }

      // Prefer role from token payload (more reliable) but fall back to response body
      const tokenPayload = getUserFromToken()
      const roleFromToken = tokenPayload?.role
      const user = res?.employee || res?.customer
      const effectiveRole = roleFromToken || user?.role

      // If employee/staff/manager/admin, redirect to admin
      if (effectiveRole && (effectiveRole === 'Chủ' || effectiveRole === 'Quản lý' || effectiveRole === 'Nhân viên')) {
        navigate('/admin', { replace: true })
      } else {
        // default redirect (customer) -> homepage/register
        navigate('/', { replace: true })
      }
    } catch (err) {
      setErrorMsg('Đăng nhập thất bại, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(90deg,#e9fbff 0%, #f1f7fb 100%)', p: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Box component="img" src={logo} alt="AquaLife Logo" sx={{ width: 70, height: 70 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0693a6' }}>AquaLife</Typography>
        </Box>
        <Typography variant="h6" sx={{ mt: 1, mb: 0.5, fontWeight: 700 }}>Chào mừng trở lại</Typography>
        <Typography variant="body1" color="text.secondary">Đăng nhập vào tài khoản của bạn</Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 420, p: 0, borderRadius: 2, boxShadow: '0 18px 30px rgba(20,60,80,0.06)' }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <Box component="label" htmlFor="email" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151' }}>Địa chỉ email</Box>
              <TextField id="email" name="email" placeholder="duycuong@example.com" type="email" variant="outlined" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& input': { padding: '12px 14px' } }} />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box component="label" htmlFor="password" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151' }}>Mật khẩu</Box>
              <TextField id="password" name="password" placeholder='••••••••' type={showPassword ? 'text' : 'password'} variant="outlined" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& input': { padding: '12px 14px' } }} InputProps={{ endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(s => !s)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                </InputAdornment>
              ) }} />
            </Box>

            {errorMsg && <Typography color="error" sx={{ mb: 2 }}>{errorMsg}</Typography>}

            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 1, py: 1.5, backgroundColor: '#008C9E', '&:hover': { backgroundColor: '#00798a' } }}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">Bạn chưa có tài khoản{' '}<Link href="/register" underline="hover" sx={{ color: '#0b8798', fontWeight: 600 }}>Đăng ký</Link></Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
