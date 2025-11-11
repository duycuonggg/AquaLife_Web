import { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button
} from '@mui/material'
import PropTypes from 'prop-types'
import '~/styles/Products.css'

export default function ProductList({ products, loading, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = (products || []).filter((p) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (p.name || '').toLowerCase().includes(q) || (p.type || '').toLowerCase().includes(q)
  })

  return (
    <Box>
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <TextField size="small" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 260 }} />
        <Box sx={{ flex: 1 }} />
      </Box>

      {loading ? (
        <Card>
          <CardContent>
            <Typography>Loading products...</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((p) => (
            <Grid item xs={12} sm={6} md={3} key={p._id || p.id}>
              <Card className="product-card">
                {p.imageUrl && (
                  <div className="product-thumb" style={{ backgroundImage: `url(${p.imageUrl})` }} />
                )}
                <CardContent>
                  <Typography className="product-name" variant="h6">{p.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{p.type} • {p.status}</Typography>
                  <Box mt={1}>
                    <Typography>Giá: {p.price}</Typography>
                    <Typography>Số lượng: {p.quantity}</Typography>
                  </Box>
                  <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => onEdit && onEdit(p)}>Sửa</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => onDelete && onDelete(p)}>Xóa</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

ProductList.propTypes = {
  products: PropTypes.array,
  loading: PropTypes.bool,
  onCreate: PropTypes.func
}
