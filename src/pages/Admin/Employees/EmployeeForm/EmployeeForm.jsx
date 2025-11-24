import { useState, useEffect } from 'react'
import { Box, TextField, Button, Card, CardContent, Typography, MenuItem } from '@mui/material'
import PropTypes from 'prop-types'
import { createEmployeeAPI, updateEmployeeAPI } from '~/apis/index'

export default function EmployeeForm({ onSuccess, initialData, onCancel }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('staff')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setEmail(initialData.email || '')
      setPhone(initialData.phone || '')
      setRole(initialData.role || 'staff')
      setPassword('')
      setError('')
    }
  }, [initialData])

  const reset = () => {
    setName('')
    setEmail('')
    setPhone('')
    setRole('staff')
    setPassword('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !role) {
      setError('Vui lòng điền tên, email và vai trò')
      return
    }

    const payload = { name, email, phone, role }
    if (!initialData && password) payload.password = password
    if (!initialData && !password) {
      setError('Mật khẩu là bắt buộc khi tạo nhân viên')
      return
    }
    if (initialData && password) payload.password = password

    try {
      setLoading(true)
      let res
      if (initialData && (initialData._id || initialData.id)) {
        const id = initialData._id || initialData.id
        res = await updateEmployeeAPI(id, payload)
      } else {
        res = await createEmployeeAPI(payload)
      }
      if (onSuccess) onSuccess(res)
      reset()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Lỗi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit} display="grid" gap={2} sx={{ gridTemplateColumns: '1fr 1fr' }}>
          <TextField label="Tên" value={name} onChange={(e) => setName(e.target.value)} required sx={{ gridColumn: '1 / 2' }} />
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={{ gridColumn: '2 / 3' }} />

          <TextField label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} sx={{ gridColumn: '1 / 2' }} />
          <TextField select label="Vai trò" value={role} onChange={(e) => setRole(e.target.value)} sx={{ gridColumn: '2 / 3' }}>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
          </TextField>

          <TextField label="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} type="password" sx={{ gridColumn: '1 / -1' }} helperText={initialData ? 'Để trống nếu không đổi mật khẩu' : ''} />

          {error && <Typography color="error" sx={{ gridColumn: '1 / -1' }}>{error}</Typography>}

          <Box display="flex" gap={2} sx={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" disabled={loading}>{loading ? (initialData ? 'Đang cập nhật...' : 'Đang tạo...') : (initialData ? 'Cập nhật' : 'Tạo')}</Button>
            <Button type="button" variant="outlined" onClick={initialData ? onCancel : reset} disabled={loading}>{initialData ? 'Hủy' : 'Làm lại'}</Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

EmployeeForm.propTypes = {
  onSuccess: PropTypes.func,
  initialData: PropTypes.object,
  onCancel: PropTypes.func
}
