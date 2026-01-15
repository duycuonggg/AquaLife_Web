import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, TextField, Typography, InputAdornment, IconButton, Link } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { registerAPI, loginAPI } from '~/apis/index'
import { getUserFromToken } from '~/utils/auth'
import logo from '~/assets/logo.png'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false) // false = Register, true = Login
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  // Register form data
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  })

  // Login form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)

  // Toggle between login and register
  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrorMsg('')
    setShowPassword(false)
  }

  // Handle register form change
  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setRegisterData({ ...registerData, [name]: value })
    if (errorMsg) setErrorMsg('')
  }

  // Handle login form change
  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData({ ...loginData, [name]: value })
    if (errorMsg) setErrorMsg('')
  }

  // Handle register submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const fullName = registerData.fullName.trim()
    const email = registerData.email.trim()
    const phone = registerData.phone.trim()
    const address = registerData.address.trim()
    const password = registerData.password
    const confirmPassword = registerData.confirmPassword

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.')
      return
    }
    if (password.length < 10) {
      setErrorMsg('Mật khẩu phải có ít nhất 10 ký tự.')
      return
    }
    if (address.length < 10) {
      setErrorMsg('Địa chỉ phải có ít nhất 10 ký tự.')
      return
    }
    const phonePattern = /^(0(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-46-9]))\d{7}$/
    if (phone && !phonePattern.test(phone)) {
      setErrorMsg('Số điện thoại không hợp lệ.')
      return
    }

    try {
      setLoading(true)
      const payload = { name: fullName, email, phone, address, password }
      await registerAPI(payload)
      // Switch to login mode after successful registration
      setIsLogin(true)
      setErrorMsg('')
      // Optionally pre-fill login email
      setLoginData({ ...loginData, email })
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Handle login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const { email, password } = loginData
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }

    try {
      setLoading(true)
      const res = await loginAPI({ email, password })

      if (res?.token) {
        localStorage.setItem('auth_token', res.token)
      }

      try {
        const user = res?.customer
        if (user?.image) localStorage.setItem('auth_user_image', user.image)
        if (user?.name) localStorage.setItem('auth_user_name', user.name)
      } catch (e) {
        // ignore storage errors
      }

      const tokenPayload = getUserFromToken()
      const roleFromToken = tokenPayload?.role
      const user = res?.customer
      const effectiveRole = roleFromToken || user?.role

      if (effectiveRole && effectiveRole !== 'customer') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setErrorMsg('Đăng nhập thất bại, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(90deg,#e9fbff 0%, #f1f7fb 100%)',
      px: 2,
      py: 5,
      overflow: 'hidden'
    }}>
      {/* Logo and Title */}
      <Box sx={{ textAlign: 'center', mb: 3, zIndex: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Box component="img" src={logo} alt="AquaLife Logo" sx={{ width: 70, height: 70 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0693a6', ml: 1 }}>AquaLife</Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
          {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isLogin ? 'Đăng nhập vào tài khoản của bạn' : 'Tham gia cùng với AquaLife'}
        </Typography>
      </Box>

      {/* Container with perspective for 3D effect */}
      <Box sx={{
        perspective: '1000px',
        width: '100%',
        maxWidth: isLogin ? 420 : 760,
        transition: 'max-width 0.6s ease-in-out'
      }}>
        {/* Card with flip animation */}
        <Card sx={{
          borderRadius: 2,
          boxShadow: '0 18px 30px rgba(20,60,80,0.06)',
          overflow: 'visible',
          transformStyle: 'preserve-3d',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isLogin ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative'
        }}>
          {/* Register Form - Front Side */}
          <Box sx={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            position: isLogin ? 'absolute' : 'relative',
            width: '100%',
            opacity: isLogin ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
            pointerEvents: isLogin ? 'none' : 'auto'
          }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <form onSubmit={handleRegisterSubmit}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(260px, 1fr))' },
                  gap: '12px 16px'
                }}>
                  {[
                    { id: 'fullName', name: 'fullName', label: 'Họ tên', placeholder: 'Duy Cường', type: 'text', required: true },
                    { id: 'email', name: 'email', label: 'Địa chỉ email', placeholder: 'duycuong@example.com', type: 'email', required: true },
                    { id: 'phone', name: 'phone', label: 'Số điện thoại', placeholder: '0958258613', type: 'tel', required: true },
                    { id: 'address', name: 'address', label: 'Địa chỉ', placeholder: '123 Hoàng Mai, Hà Nội', type: 'text', required: true },
                    { id: 'password', name: 'password', label: 'Mật khẩu', placeholder: '••••••••', type: showPassword ? 'text' : 'password', required: true, toggle: true },
                    { id: 'confirmPassword', name: 'confirmPassword', label: 'Xác nhận mật khẩu', placeholder: '••••••••', type: 'password', required: true }
                  ].map((f) => (
                    <Box key={f.name} sx={{ mb: 2 }}>
                      <Box component="label" htmlFor={f.id} sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151' }}>
                        {f.label}
                      </Box>
                      <TextField
                        id={f.id}
                        name={f.name}
                        type={f.type}
                        placeholder={f.placeholder}
                        variant="outlined"
                        fullWidth
                        required={f.required}
                        value={registerData[f.name]}
                        onChange={handleRegisterChange}
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0097A7' },
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0097A7', borderWidth: '1px' },
                          '& input': { padding: '12px 14px' }
                        }}
                        InputProps={f.toggle ? {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        } : undefined}
                      />
                    </Box>
                  ))}
                </Box>

                {errorMsg && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{errorMsg}</Typography>}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    backgroundColor: '#008C9E',
                    '&:hover': { backgroundColor: '#00798a' },
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2">
                  Bạn đã có tài khoản?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={toggleMode}
                    underline="hover"
                    sx={{ color: '#0b8798', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Đăng nhập
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Box>

          {/* Login Form - Back Side */}
          <Box sx={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: isLogin ? 'relative' : 'absolute',
            width: '100%',
            top: 0,
            left: 0,
            opacity: isLogin ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            pointerEvents: isLogin ? 'auto' : 'none'
          }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <form onSubmit={handleLoginSubmit}>
                <Box sx={{ mb: 2 }}>
                  <Box component="label" htmlFor="login-email" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151' }}>
                    Địa chỉ email
                  </Box>
                  <TextField
                    id="login-email"
                    name="email"
                    placeholder="duycuong@example.com"
                    type="email"
                    variant="outlined"
                    fullWidth
                    required
                    value={loginData.email}
                    onChange={handleLoginChange}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' },
                      '& input': { padding: '12px 14px' }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box component="label" htmlFor="login-password" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151' }}>
                    Mật khẩu
                  </Box>
                  <TextField
                    id="login-password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    required
                    value={loginData.password}
                    onChange={handleLoginChange}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' },
                      '& input': { padding: '12px 14px' }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                {errorMsg && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{errorMsg}</Typography>}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    backgroundColor: '#008C9E',
                    '&:hover': { backgroundColor: '#00798a' },
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2">
                  Bạn chưa có tài khoản?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={toggleMode}
                    underline="hover"
                    sx={{ color: '#0b8798', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Đăng ký
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
