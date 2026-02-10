import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, TextField, Typography, InputAdornment, IconButton, Link } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { registerAPI, loginAPI } from '~/apis/index'
import { getUserFromToken } from '~/utils/auth'
import { validateRegister, validateLogin } from '~/utils/validattion'
import logo from '~/assets/logo.png'

// Cấu hình styling cho TextField
const INPUT_STYLE = {
  '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0097A7' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0097A7', borderWidth: '1px' },
  '& input': { padding: '12px 14px' }
}

// Cấu hình styling cho Button
const BUTTON_STYLE = {
  py: 1.5,
  backgroundColor: '#008C9E',
  '&:hover': { backgroundColor: '#00798a' },
  fontSize: '1rem',
  fontWeight: 600
}

// Role constant
const ROLE_CUSTOMER = 'customer'

// Danh sách fields cho form đăng ký
const REGISTER_FORM_FIELDS = [
  { id: 'fullName', name: 'fullName', label: 'Họ tên', placeholder: 'Họ tên của bạn', type: 'text', required: true },
  { id: 'email', name: 'email', label: 'Địa chỉ email', placeholder: 'emailcuaban@gmail.com', type: 'email', required: true },
  { id: 'phone', name: 'phone', label: 'Số điện thoại', placeholder: 'Số điện thoại của bạn', type: 'tel', required: true },
  { id: 'address', name: 'address', label: 'Địa chỉ', placeholder: 'Địa chỉ của bạn', type: 'text', required: true },
  { id: 'password', name: 'password', label: 'Mật khẩu', placeholder: '••••••••', type: 'password', required: true, toggle: true },
  { id: 'confirmPassword', name: 'confirmPassword', label: 'Xác nhận mật khẩu', placeholder: '••••••••', type: 'password', required: true, toggle: true }
]

export default function Auth() {
  // === STATE MANAGEMENT ===
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(false) // false = Đăng ký, true = Đăng nhập
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  })
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const toggleMode = () => {
    setIsLogin(prev => !prev)
    setErrorMsg('')
    setFieldErrors({})
    setShowRegisterPassword(false)
    setShowConfirmPassword(false)
    setShowLoginPassword(false)
  }

  /**
   * Xử lý thay đổi giá trị input trong form đăng ký
   */
  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setRegisterData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (errorMsg) setErrorMsg('')
  }

  /**
   * Xử lý thay đổi giá trị input trong form đăng nhập
   */
  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (errorMsg) setErrorMsg('')
  }

  /**
   * Xử lý submit form đăng ký
   * - Validate input
   * - Gọi API đăng ký
   * - Chuyển sang form đăng nhập sau khi thành công
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    const errors = validateRegister(registerData)
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }

    const fullName = registerData.fullName.trim()
    const email = registerData.email.trim()
    const phone = registerData.phone.trim()
    const address = registerData.address.trim()
    const password = registerData.password

    try {
      setLoading(true)
      const payload = { name: fullName, email, phone, address, password }
      await registerAPI(payload)

      setIsLogin(true)
      setErrorMsg('')
      setLoginData(prev => ({ ...prev, email }))
    } catch (error) {
      const backendMsg = error.response?.data?.message_vi || error.response?.data?.message
      setErrorMsg(backendMsg || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Xử lý submit form đăng nhập
   * - Validate input
   * - Gọi API đăng nhập
   * - Lưu token & thông tin user vào localStorage
   * - Redirect theo role (admin hoặc customer)
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    const { email, password } = loginData

    const errors = validateLogin(loginData)
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }

    try {
      setLoading(true)
      const res = await loginAPI({ email, password })

      if (res?.token) {
        localStorage.setItem('auth_token', res.token)
      }

      const user = res?.customer || {}
      if (user.imageUrl || user.image) localStorage.setItem('auth_user_image', user.imageUrl || user.image)
      if (user.name) localStorage.setItem('auth_user_name', user.name)

      const tokenPayload = getUserFromToken()
      const roleFromToken = tokenPayload?.role
      const effectiveRole = roleFromToken || user.role

      navigate(effectiveRole !== ROLE_CUSTOMER ? '/admin' : '/', { replace: true })
    } catch (err) {
      const backendMsg = err.response?.data?.message_vi || err.response?.data?.message
      setErrorMsg(backendMsg || 'Đăng nhập thất bại. Vui lòng thử lại.')
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
      <Box sx={{ textAlign: 'center', mb: 3, zIndex: 10 }}>
        <Box component="img" src={logo} alt="AquaLife Logo" sx={{ width: 70, height: 70 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0693a6', ml: 1 }}>AquaLife</Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
          {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isLogin ? 'Đăng nhập vào tài khoản của bạn' : 'Tham gia cùng với AquaLife'}
        </Typography>
      </Box>

      <Box sx={{
        perspective: '1000px',
        width: '100%',
        maxWidth: isLogin ? 420 : 760,
        transition: 'max-width 0.6s ease-in-out'
      }}>
        <Card sx={{
          borderRadius: 2,
          boxShadow: '0 18px 30px rgba(20,60,80,0.06)',
          overflow: 'visible',
          transformStyle: 'preserve-3d',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isLogin ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative'
        }}>
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
              <form onSubmit={handleRegisterSubmit} noValidate>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(260px, 1fr))' },
                  gap: '12px 16px'
                }}>
                  {REGISTER_FORM_FIELDS.map((f) => {
                    const isPasswordField = f.name === 'password'
                    const isConfirmField = f.name === 'confirmPassword'
                    const isToggleField = !!f.toggle
                    const inputType = isToggleField
                      ? (isPasswordField
                        ? (showRegisterPassword ? 'text' : 'password')
                        : isConfirmField
                          ? (showConfirmPassword ? 'text' : 'password')
                          : f.type)
                      : f.type

                    return (
                      <Box key={f.name} sx={{ mb: 2 }}>
                        <Box component="label" htmlFor={f.id} sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151' }}>
                          {f.label}
                        </Box>
                        <TextField
                          id={f.id}
                          name={f.name}
                          type={inputType}
                          placeholder={f.placeholder}
                          variant="outlined"
                          fullWidth
                          required={f.required}
                          value={registerData[f.name]}
                          onChange={handleRegisterChange}
                          sx={INPUT_STYLE}
                          error={Boolean(fieldErrors[f.name])}
                          helperText={fieldErrors[f.name] || ''}
                          FormHelperTextProps={{ sx: { mt: 0.5, ml: 0, color: '#d32f2f', fontSize: '0.85rem' } }}
                          InputProps={isToggleField ? {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() => {
                                    if (isPasswordField) setShowRegisterPassword(prev => !prev)
                                    else if (isConfirmField) setShowConfirmPassword(prev => !prev)
                                  }}
                                  edge="end"
                                >
                                  {(isPasswordField ? showRegisterPassword : showConfirmPassword) ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            )
                          } : undefined}
                        />
                      </Box>
                    )
                  })}
                </Box>

                {errorMsg && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{errorMsg}</Typography>}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 2, ...BUTTON_STYLE }}
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
              <form onSubmit={handleLoginSubmit} noValidate>
                <Box sx={{ mb: 2 }}>
                  <Box component="label" htmlFor="login-email" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151' }}>
                    Địa chỉ email
                  </Box>
                  <TextField
                    id="login-email"
                    name="email"
                    placeholder="emailcuaban@gmail.com"
                    type="email"
                    variant="outlined"
                    fullWidth
                    required
                    value={loginData.email}
                    onChange={handleLoginChange}
                    sx={INPUT_STYLE}
                    error={Boolean(fieldErrors.email)}
                    helperText={fieldErrors.email || ''}
                    FormHelperTextProps={{ sx: { mt: 0.5, ml: 0, color: '#d32f2f', fontSize: '0.85rem' } }}
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
                    type={showLoginPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    required
                    value={loginData.password}
                    onChange={handleLoginChange}
                    sx={INPUT_STYLE}
                    error={Boolean(fieldErrors.password)}
                    helperText={fieldErrors.password || ''}
                    FormHelperTextProps={{ sx: { mt: 0.5, ml: 0, color: '#d32f2f', fontSize: '0.85rem' } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            edge="end"
                          >
                            {showLoginPassword ? <VisibilityOff /> : <Visibility />}
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
                  sx={{ mt: 2, ...BUTTON_STYLE }}
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
                    sx={{ color: '#0b8798', fontWeight: 600, cursor: 'pointer', mb: 0.5, ml: 0.5 }}
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