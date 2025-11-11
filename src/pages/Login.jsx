import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Link
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import '../styles/login.css'
import { loginAPI } from '../apis'
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
    if (!email) { setErrorMsg('Email is required'); return }
    if (!password) { setErrorMsg('Password is required'); return }
    try {
      setLoading(true)
      const res = await loginAPI({ email, password })
      // store token
      if (res?.token) {
        localStorage.setItem('auth_token', res.token)
      }

      // Prefer role from token payload (more reliable) but fall back to response body
      const tokenPayload = getUserFromToken()
      const roleFromToken = tokenPayload?.role
      const user = res?.employee || res?.customer
      const effectiveRole = roleFromToken || user?.role

      // If employee/staff/manager/admin, redirect to admin
      if (effectiveRole && effectiveRole !== 'customer') {
        navigate('/admin', { replace: true })
      } else {
        // default redirect (customer) -> homepage/register
        navigate('/', { replace: true })
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="signup-container">
      <Box className="signup-header">
        <Box className="logo-area">
          <img src={logo} alt="AquaLife Logo" className="logo-icon" />
          <Typography variant="h3" className="logo-text">AquaLife</Typography>
        </Box>
        <Typography variant="h6" className="page-title">Chào mừng trở lại</Typography>
        <Typography variant="body1" className="page-subtitle">Đăng nhập vào tài khoản của bạn</Typography>
      </Box>

      <Card className="signup-card">
        <CardContent className="signup-card-content">
          <form onSubmit={handleSubmit}>
            <Box className="form-group">
              <label htmlFor="email">Địa chỉ email</label>
              <TextField id="email" name="email" type="email" placeholder="you@example.com" variant="outlined" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} className="custom-textfield" />
            </Box>

            <Box className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <TextField id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" variant="outlined" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} className="custom-textfield" InputProps={{ endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(s => !s)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                </InputAdornment>
              ) }} />
            </Box>

            {errorMsg && <Typography color="error" className="error-text">{errorMsg}</Typography>}

            <Button type="submit" variant="contained" fullWidth className="signup-button" disabled={loading}>{loading ? 'Signing...' : 'Sign In'}</Button>
          </form>

          <Box className="signup-footer">
            <Typography variant="body2">Bạn chưa có tài khoản{' '}<Link href="/" underline="hover" className="signin-link">Đăng ký</Link></Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
