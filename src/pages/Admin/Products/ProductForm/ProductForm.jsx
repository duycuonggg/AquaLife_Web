import { useState, useEffect } from 'react'
import { Box, TextField, Button, Card, CardContent, Typography, MenuItem } from '@mui/material'
import PropTypes from 'prop-types'
import { createProductAPI, updateProductAPI, getCategoriesAPI } from '~/apis/index'

export default function ProductForm({ onSuccess, initialData, onCancel }) {
  const [productName, setProductName] = useState('')
  const [productType, setProductType] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('available')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategoriesAPI()
        setCategories(Array.isArray(cats) ? cats : [])
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.product_name || '')
      setProductType(initialData.product_type || '')
      setCategoryId(initialData.category_id || '')
      setDescription(initialData.description || '')
      setPrice(initialData.price != null ? String(initialData.price) : '')
      setStockQuantity(initialData.stock_quantity != null ? String(initialData.stock_quantity) : '')
      setImageUrl(initialData.image_url || '')
      setStatus(initialData.status || 'available')
      setError('')
    }
  }, [initialData])

  const reset = () => {
    setProductName('')
    setProductType('')
    setCategoryId('')
    setDescription('')
    setPrice('')
    setStockQuantity('')
    setImageUrl('')
    setStatus('available')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!productName || !price || !productType || !imageUrl) {
      setError('Vui lòng điền đầy đủ: tên, loại, giá và ảnh')
      return
    }

    const payload = {
      product_name: productName,
      product_type: productType,
      category_id: categoryId || undefined,
      price: Number(price),
      stock_quantity: stockQuantity ? Number(stockQuantity) : 0,
      description,
      image_url: imageUrl,
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
          <TextField label="Tên sản phẩm" value={productName} onChange={(e) => setProductName(e.target.value)} required sx={{ gridColumn: '1 / 2' }} />
          <TextField select label="Loại sản phẩm" value={productType} onChange={(e) => setProductType(e.target.value)} required sx={{ gridColumn: '2 / 3' }}>
            <MenuItem value="">Chọn loại</MenuItem>
            <MenuItem value="fish">Cá</MenuItem>
            <MenuItem value="aquarium">Bể cá</MenuItem>
            <MenuItem value="accessory">Phụ kiện</MenuItem>
            <MenuItem value="food">Thức ăn</MenuItem>
            <MenuItem value="plant">Cây thủy sinh</MenuItem>
          </TextField>

          <TextField select label="Danh mục" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} sx={{ gridColumn: '1 / 2' }}>
            <MenuItem value="">Không chọn</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id || cat.id} value={cat._id || cat.id}>{cat.category_name}</MenuItem>
            ))}
          </TextField>

          <TextField select label="Tình trạng" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ gridColumn: '2 / 3' }}>
            <MenuItem value="available">Còn hàng</MenuItem>
            <MenuItem value="out_of_stock">Hết hàng</MenuItem>
            <MenuItem value="discontinued">Ngừng kinh doanh</MenuItem>
          </TextField>

          <TextField label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} sx={{ gridColumn: '1 / -1' }} />

          <TextField label="Giá (VNĐ)" value={price} onChange={(e) => setPrice(e.target.value)} type="number" required sx={{ gridColumn: '1 / 2' }} />
          <TextField label="Số lượng tồn kho" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} type="number" sx={{ gridColumn: '2 / 3' }} />

          <TextField label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required sx={{ gridColumn: '1 / -1' }} />

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
