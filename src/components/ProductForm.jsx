import { useState, useEffect } from 'react'
import { Box, TextField, Button, Card, CardContent, Typography, MenuItem } from '@mui/material'
import PropTypes from 'prop-types'
import { createProductAPI, updateProductAPI } from '~/apis/index'

export default function ProductForm({ onSuccess, initialData, onCancel }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('available')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setType(initialData.type || '')
      setDescription(initialData.description || '')
      setPrice(initialData.price != null ? String(initialData.price) : '')
      setQuantity(initialData.quantity != null ? String(initialData.quantity) : '')
      setImageUrl(initialData.imageUrl || '')
      setStatus(initialData.status || 'available')
      setError('')
    }
  }, [initialData])

  const reset = () => {
    setName('')
    setDescription('')
    setPrice('')
    setQuantity('')
    setImageUrl('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !price || !type || !description || !imageUrl) {
      setError('Vui lòng điền đầy đủ: tên, loại, mô tả, giá và ảnh')
      return
    }

    const payload = {
      // match backend validation keys
      name,
      type,
      price: Number(price),
      quantity: quantity ? Number(quantity) : 0,
      description,
      imageUrl,
      status
    }

    try {
      setLoading(true)
      let res
      if (initialData && (initialData._id || initialData.id)) {
        const id = initialData._id || initialData.id
        res = await updateProductAPI(id, payload)
      } else {
        res = await createProductAPI(payload)
      }
      // call optional callback so parent can refresh list
      if (onSuccess) onSuccess(res)
      reset()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit} display="grid" gap={2} sx={{ gridTemplateColumns: '1fr 1fr' }}>
          <TextField label="Tên sản phẩm" value={name} onChange={(e) => setName(e.target.value)} required sx={{ gridColumn: '1 / 2' }} />
          <TextField label="Loại" value={type} onChange={(e) => setType(e.target.value)} required sx={{ gridColumn: '2 / 3' }} />

          <TextField label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} required sx={{ gridColumn: '1 / -1' }} />

          <TextField label="Giá (VNĐ)" value={price} onChange={(e) => setPrice(e.target.value)} type="number" required sx={{ gridColumn: '1 / 2' }} />
          <TextField label="Số lượng" value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" sx={{ gridColumn: '2 / 3' }} />

          <TextField label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required sx={{ gridColumn: '1 / -1' }} />

          <TextField select label="Tình trạng" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ gridColumn: '1 / -1', maxWidth: 260 }}>
            <MenuItem value="available">Còn hàng</MenuItem>
            <MenuItem value="out_of_stock">Hết hàng</MenuItem>
            <MenuItem value="discontinued">Ngừng kinh doanh</MenuItem>
          </TextField>

          {imageUrl && (
            <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Box component="img" src={imageUrl} alt="preview" sx={{ maxWidth: 320, maxHeight: 200, objectFit: 'cover', borderRadius: 1, boxShadow: 1 }} onError={(e) => { e.target.style.display = 'none' }} />
            </Box>
          )}

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

ProductForm.propTypes = {
  onSuccess: PropTypes.func
}
