import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Avatar, Button, Typography, TextField } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import { getUserFromToken } from '~/utils/auth'
import { getCustomerAPI, updateCustomerAPI } from '~/apis/index'
import '~/pages/Profile/Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', image: '' })

  useEffect(() => {
    const payload = getUserFromToken()
    if (!payload || payload.role !== 'customer') {
      navigate('/login')
      return
    }
    const uid = payload.id || payload._id || payload.userId || ''
    if (!uid) {
      navigate('/login')
      return
    }

    // try to populate from localStorage immediately so UI shows while we fetch
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
        image: prev.image || storedImage || ''
      }))
    } catch (err) {
      // ignore storage errors
    }

    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        // try to prefer stored values from localStorage first
        const storedImage = localStorage.getItem('auth_user_image')
        const storedName = localStorage.getItem('auth_user_name')

        const me = await getCustomerAPI(uid)
        if (!mounted) return
        const data = me || {}
        // ensure fields exist
        const initial = {
          name: data.name || storedName || '',
          email: data.email || '',
          phone: data.phone || data.mobile || '',
          address: data.address || '',
          image: data.image || storedImage || ''
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
      if (form.image) payload.image = form.image
      if (form.email) payload.email = form.email

      // update API returns an update result, so re-fetch the customer to get current data
      await updateCustomerAPI(id, payload)
      const refreshed = await getCustomerAPI(id)
      const data = refreshed || {}
      setCustomer(data)
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || data.mobile || '',
        address: data.address || '',
        image: data.image || ''
      })

      // persist displayed name/image/email/phone/address for fast UI updates
      try {
        if (data.image) localStorage.setItem('auth_user_image', data.image)
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
      <Box className="profile-container" sx={{ maxWidth: 980, mx: 'auto', p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 10 }}>Hồ sơ của tôi</Typography>

        <Box className="profile-card">
          <Box className="profile-left">
            <Avatar src={form.image} alt={form.name || 'Khách hàng'} sx={{ width: 120, height: 120, mb: 2 }}>
              {(!form.image && form.name) ? form.name[0] : ''}
            </Avatar>
            <Box sx={{ mt: 1 }}>
              <Button variant="outlined" size="small" onClick={() => setEditing(!editing)} sx={{ mr: 1 }}>Chỉnh sửa hồ sơ</Button>
            </Box>
          </Box>

          <Box className="profile-right">
            <TextField label="Họ và tên" fullWidth value={form.name} onChange={onChange('name')} margin="normal" disabled={!editing} />
            <TextField label="Email" fullWidth value={form.email} onChange={onChange('email')} margin="normal" disabled={!editing} />
            <TextField label="Số điện thoại" fullWidth value={form.phone} onChange={onChange('phone')} margin="normal" disabled={!editing} />
            <TextField label="Địa chỉ" fullWidth value={form.address} onChange={onChange('address')} margin="normal" disabled={!editing} />
            <TextField label="URL ảnh (avatar)" fullWidth value={form.image} onChange={onChange('image')} margin="normal" disabled={!editing} />

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
