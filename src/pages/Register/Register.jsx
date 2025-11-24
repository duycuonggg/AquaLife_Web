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
import '~/pages/Register/Register.css'
import { registerAPI } from '~/apis/index'
import logo from '~/assets/logo.png'

const Register = () => {
  // State lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  })

  // State hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  // Xử lý khi người dùng nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    // Clear lỗi khi người dùng bắt đầu gõ lại
    if (errorMsg) setErrorMsg('')
  }

  // Toggle hiển thị mật khẩu
  const handleClickShowPassword = () => setShowPassword((show) => !show)

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // 1. Validate cơ bản
    // trim values
    const fullName = formData.fullName.trim()
    const email = formData.email.trim()
    const phone = formData.phone.trim()
    const address = formData.address.trim()
    const password = formData.password
    const confirmPassword = formData.confirmPassword

    if (password !== confirmPassword) {
      setErrorMsg('Confirm Password does not match.')
      return
    }
    // Server requires password min 10 chars (customersModel validation)
    if (password.length < 10) {
      setErrorMsg('Password must be at least 10 characters.')
      return
    }
    // Address must be reasonably long (server requires min 10)
    if (address.length < 10) {
      setErrorMsg('Address must be at least 10 characters.')
      return
    }
    // Phone pattern (basic vietnamese mobile pattern similar to backend)
    const phonePattern = /^(0(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-46-9]))\d{7}$/
    if (phone && !phonePattern.test(phone)) {
      setErrorMsg('Phone number format is invalid.')
      return
    }

    // 2. Gọi API
    try {
      setLoading(true)
      // Chuẩn bị data để gửi xuống BE (cấu trúc tùy thuộc BE của bạn yêu cầu)
      const payload = {
        name: fullName,
        email,
        phone,
        address,
        password
      }

      await registerAPI(payload)
      // chuyển sang trang login khi đăng ký thành công
      navigate('/login', { replace: true })

    } catch (error) {
      // Hiển thị lỗi từ BE trả về nếu có
      setErrorMsg(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="signup-container">
      <Box className="signup-header">
        <Box className="logo-area">
          <img src={logo} alt="AquaLife Logo" className="logo-icon" />
          <Typography variant="h3" className="logo-text">
            AquaLife
          </Typography>
        </Box>
        <Typography variant="h6" className="page-title">
          Tạo tài khoản mới
        </Typography>
        <Typography variant="body1" className="page-subtitle">
          Tham gia cùng với AquaLife
        </Typography>
      </Box>

      <Card className="signup-card">
        <CardContent className="signup-card-content">
          <form onSubmit={handleSubmit}>
            {/* Map inputs for concise code; layout handled by CSS grid (.form-grid) */}
            <Box className="form-grid">
              {[
                { id: 'fullName', name: 'fullName', label: 'Họ tên', placeholder: 'John Doe', type: 'text', required: true },
                { id: 'email', name: 'email', label: 'Địa chỉ email', placeholder: 'you@example.com', type: 'email', required: true },
                { id: 'phone', name: 'phone', label: 'Số điện thoại', placeholder: '0123456789', type: 'tel', required: true },
                { id: 'address', name: 'address', label: 'Địa chỉ', placeholder: '123 Main St', type: 'text', required: true },
                { id: 'password', name: 'password', label: 'Mật khẩu', placeholder: '••••••••', type: showPassword ? 'text' : 'password', required: true, toggle: true },
                { id: 'confirmPassword', name: 'confirmPassword', label: 'Xác nhận mật khẩu', placeholder: '••••••••', type: 'password', required: true }
              ].map((f) => (
                <Box className="form-group" key={f.name}>
                  <label htmlFor={f.id}>{f.label}</label>
                  <TextField
                    id={f.id}
                    name={f.name}
                    type={f.type}
                    placeholder={f.placeholder}
                    variant="outlined"
                    fullWidth
                    required={f.required}
                    value={formData[f.name]}
                    onChange={handleChange}
                    className="custom-textfield"
                    InputProps={f.toggle ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    } : undefined}
                    error={f.name === 'confirmPassword' && formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
                  />
                </Box>
              ))}
            </Box>

            {errorMsg && (
              <Typography color="error" className="error-text">
                {errorMsg}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="signup-button"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </form>

          <Box className="signup-footer">
            <Typography variant="body2">
              Bạn đã có tài khoản?{' '}
              <Link href="/login" underline="hover" className="signin-link">
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Register