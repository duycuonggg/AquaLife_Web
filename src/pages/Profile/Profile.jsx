import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Avatar, Button, Typography, TextField } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import { getUserFromToken } from '~/utils/auth'
import { getCustomerAPI, updateCustomerAPI } from '~/apis/index'

export default function Profile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', imageUrl: '' })

  useEffect(() => {
    const payload = getUserFromToken()
    if (!payload || payload.role !== 'customer') {
      navigate('/RegisterAndLogin')
      return
    }
    const uid = payload.id || payload._id || payload.userId || ''
    if (!uid) {
      navigate('/RegisterAndLogin')
      return
    }

    // Ưu tiên lấy dữ liệu từ localStorage để hiển thị nhanh trước khi gọi API
    try {
      const storedImage = localStorage.getItem('auth_user_image')
      const storedName = localStorage.getItem('auth_user_name')
      const storedEmail = localStorage.getItem('auth_user_email')
      const storedPhone = localStorage.getItem('auth_user_phone')
      const storedAddress = localStorage.getItem('auth_user_address')
      setCustomer(prev => prev || { _id: uid, id: uid })
      setForm(prev => ({
        ...prev,
        name: prev.name || storedName || '',
        email: prev.email || storedEmail || '',
        phone: prev.phone || storedPhone || '',
        address: prev.address || storedAddress || '',
        imageUrl: prev.imageUrl || storedImage || ''
      }))
    } catch (err) {
      // ignore storage errors
    }

    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        // Ưu tiên giá trị đã lưu khi gọi API để tránh nháy UI
        const storedImage = localStorage.getItem('auth_user_image')
        const storedName = localStorage.getItem('auth_user_name')

        const me = await getCustomerAPI(uid)
        if (!mounted) return
        const data = me || {}
        // Đảm bảo các trường luôn có giá trị mặc định
        const initial = {
          name: data.name || storedName || '',
          email: data.email || '',
          phone: data.phone || data.mobile || '',
          address: data.address || '',
          imageUrl: data.imageUrl || data.image || storedImage || ''
        }
        setCustomer(data)
        setForm(initial)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load profile', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [navigate])

  const onChange = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const onSave = async () => {
    if (!customer) return
    try {
      setLoading(true)
      const id = customer._id || customer.id
      const payload = { name: form.name, phone: form.phone, address: form.address }
      if (form.imageUrl) payload.imageUrl = form.imageUrl
      if (form.email) payload.email = form.email

      // API trả về kết quả cập nhật, nên gọi lại để lấy dữ liệu mới nhất
      await updateCustomerAPI(id, payload)
      const refreshed = await getCustomerAPI(id)
      const data = refreshed || {}
      setCustomer(data)
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || data.mobile || '',
        address: data.address || '',
        imageUrl: data.imageUrl || data.image || ''
      })

      // Lưu lại để hiển thị nhanh ở các màn khác
      try {
        if (data.imageUrl || data.image) localStorage.setItem('auth_user_image', data.imageUrl || data.image)
        if (data.name) localStorage.setItem('auth_user_name', data.name)
        if (data.email) localStorage.setItem('auth_user_email', data.email)
        if (data.phone) localStorage.setItem('auth_user_phone', data.phone)
        if (data.address) localStorage.setItem('auth_user_address', data.address)
      } catch (err) { /* ignore storage errors */ }
      setEditing(false)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update profile', err)
      alert('Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f7fbfb, #ffffff)' }}>
      <Header />
      <Box sx={{ maxWidth: 980, mx: 'auto', p: 3, pt: 6, mb: 20 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mb: 10, mt: 3 }}>Hồ sơ của tôi</Typography>

        <Box sx={{ display: 'flex', gap: 3, background: '#fff', borderRadius: 2, p: 2.5, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', alignItems: 'flex-start', border: '1px solid #0b8798', flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ width: { xs: '100%', md: 260 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar src={form.imageUrl} alt={form.name || 'Khách hàng'} sx={{ width: 120, height: 120, mb: 2, border: '4px solid #f3f7f8' }}>
              {(!form.imageUrl && form.name) ? form.name[0] : ''}
            </Avatar>
            <Box sx={{ mt: 1 }}>
              <Button variant="outlined" size="small" onClick={() => setEditing(!editing)} sx={{ mr: 1 }}>Chỉnh sửa hồ sơ</Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <TextField label="Họ và tên" fullWidth value={form.name} onChange={onChange('name')} margin="normal" disabled={!editing} />
            <TextField label="Email" fullWidth value={form.email} onChange={onChange('email')} margin="normal" disabled={!editing} />
            <TextField label="Số điện thoại" fullWidth value={form.phone} onChange={onChange('phone')} margin="normal" disabled={!editing} />
            <TextField label="Địa chỉ" fullWidth value={form.address} onChange={onChange('address')} margin="normal" disabled={!editing} />
            <TextField label="URL ảnh (avatar)" fullWidth value={form.imageUrl} onChange={onChange('imageUrl')} margin="normal" disabled={!editing} />

            {editing && (
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" onClick={onSave} disabled={loading}>Lưu</Button>
                <Button variant="outlined" onClick={() => setEditing(false)} disabled={loading}>Hủy</Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}
