import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, TextField, Typography, InputAdornment, IconButton, Link } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
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
      setErrorMsg('Mật khẩu xác nhận không khớp.')
      return
    }
    // Server requires password min 10 chars (customersModel validation)
    if (password.length < 10) {
      setErrorMsg('Mật khẩu phải có ít nhất 10 ký tự.')
      return
    }
    // Address must be reasonably long (server requires min 10)
    if (address.length < 10) {
      setErrorMsg('Địa chỉ phải có ít nhất 10 ký tự.')
      return
    }
    // Phone pattern (basic vietnamese mobile pattern similar to backend)
    const phonePattern = /^(0(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-46-9]))\d{7}$/
    if (phone && !phonePattern.test(phone)) {
      setErrorMsg('Số điện thoại không hợp lệ.')
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
    <Box sx={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(90deg,#e9fbff 0%, #f1f7fb 100%)', px: 2, py: 5, fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
    }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Box component="img" src={logo} alt="AquaLife Logo" sx={{ width: 70, height: 70 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0693a6', ml: 1 }}>AquaLife</Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>Tạo tài khoản mới</Typography>
        <Typography variant="body1" color="text.secondary">Tham gia cùng với AquaLife</Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 760, borderRadius: 2, boxShadow: '0 18px 30px rgba(20,60,80,0.06)', overflow: 'visible' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <form onSubmit={handleSubmit}>
            {/* Map inputs for concise code; layout handled by CSS grid (.form-grid) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(260px, 1fr))' }, gap: '12px 16px' }}>
              {[
                { id: 'fullName', name: 'fullName', label: 'Họ tên', placeholder: 'Duy Cường', type: 'text', required: true },
                { id: 'email', name: 'email', label: 'Địa chỉ email', placeholder: 'duycuong@example.com', type: 'email', required: true },
                { id: 'phone', name: 'phone', label: 'Số điện thoại', placeholder: '0958258613', type: 'tel', required: true },
                { id: 'address', name: 'address', label: 'Địa chỉ', placeholder: '123 Hoàng Mai, Hà Nội', type: 'text', required: true },
                { id: 'password', name: 'password', label: 'Mật khẩu', placeholder: '••••••••', type: showPassword ? 'text' : 'password', required: true, toggle: true },
                { id: 'confirmPassword', name: 'confirmPassword', label: 'Xác nhận mật khẩu', placeholder: '••••••••', type: 'password', required: true }
              ].map((f) => (
                <Box key={f.name} sx={{ mb: 2 }}>
                  <Box component="label" htmlFor={f.id} sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#374151' }}>{f.label}</Box>
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
              <Typography color="error" sx={{ textAlign: 'center', mb: 2 }}>{errorMsg}</Typography>
            )}

            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 1, py: 1.5, fontWeight: 600, borderRadius: 1, backgroundColor: '#008C9E', '&:hover': { backgroundColor: '#00798a' } }}>
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </form>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">Bạn đã có tài khoản?{' '}
              <Link href="/login" underline="hover" sx={{ color: '#008C9E', fontWeight: 600 }}>Đăng nhập</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Register