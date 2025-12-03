import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Grid, Card, CardContent, Button, Typography, TextField, IconButton } from '@mui/material'
import { getProductAPI, getProductsAPI } from '~/apis/index'
import { addToCart } from '~/utils/cart'
import { Link as RouterLink } from 'react-router-dom'
// styles migrated from ProductDetail.css into MUI `sx` props
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!id) return
      try {
        const data = await getProductAPI(id)
        if (mounted) setProduct(data || null)
      } catch (err) {
        // fallback to loading all products if single endpoint missing
        try {
          const all = await getProductsAPI()
          if (!mounted) return
          setProducts(all || [])
          const found = (all || []).find(p => (p._id || p.id) === id)
          if (found) setProduct(found)
        } catch (err2) {
          // eslint-disable-next-line no-console
          console.error('Failed loading product', err2)
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  const changeQuantity = (next) => {
    // treat `next` as a delta (e.g. 1 or -1) when called from +/- buttons
    setQuantity(q => {
      const n = q + (Number(next) || 0)
      return n < 1 ? 1 : n
    })
  }

  if (!product) {
    return (
      <Box>
        <Header />
        <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
          <Typography>Đang tải sản phẩm hoặc sản phẩm không tồn tại.</Typography>
        </Box>
        <Footer />
      </Box>
    )
  }

  const statusMap = {
    available: 'Còn hàng',
    out_of_stock: 'Hết hàng',
    discontinued: 'Ngừng kinh doanh'
  }

  return (
    <Box>
      <Header />
      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ borderRadius: '8px', overflow: 'hidden', background: '#f8fafc' }}>
              <Box sx={{ height: { xs: 260, md: 360 }, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${product.imageUrl || ''})` }} />
            </Box>
            <Box display="flex" gap={2} mt={2}>
              {((product.thumbnails && product.thumbnails.length) ? product.thumbnails : [product.imageUrl]).map((t, i) => (
                <Box key={i} sx={{ width: { xs: 64, md: 80 }, height: { xs: 48, md: 60 }, borderRadius: '6px', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', backgroundImage: `url(${t || ''})` }} />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{product.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{product.shortDescription || product.description || ''}</Typography>

            <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 700 }}>{(Number(product.price) || 0).toLocaleString('vi-VN')} đ</Typography>

            <Box display="flex" alignItems="center" gap={2} mt={3}>
              <Box display="flex" alignItems="center" sx={{ border: '1px solid #e6eef6', borderRadius: 1, px: 1 }}>
                <IconButton size="small" onClick={() => changeQuantity(-1)}>
                  <RemoveIcon />
                </IconButton>
                <TextField value={quantity} onChange={(e) => {
                  const v = Number(e.target.value)
                  setQuantity(Number.isNaN(v) ? 1 : (v < 1 ? 1 : Math.floor(v)))
                }} size="small" inputProps={{ style: { width: 48, textAlign: 'center' } }} />
                <IconButton size="small" onClick={() => changeQuantity(1)}>
                  <AddIcon />
                </IconButton>
              </Box>

              <Button variant="contained" color="primary" sx={{ px: 3 }} onClick={() => {
                addToCart(product, quantity)
                // notify header via dispatched event (saveCart already dispatches), but ensure immediate update
                try {
                  window.dispatchEvent(new CustomEvent('cartUpdated'))
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.warn('Failed to dispatch cartUpdated event', e)
                }
                alert('Đã thêm ' + quantity + ' sản phẩm vào giỏ (demo)')
              }}>Thêm vào giỏ</Button>
            </Box>
            <Box display="flex" alignItems="center" gap={2} mt={2} >
              <Typography>Số lượng</Typography>
              <Button variant="contained" color="primary" sx={{ px: 3 }}>{product.quantity}</Button>
              <Box ml={15} display="flex" gap={2} alignItems="center">
                <Typography>Tình trạng:</Typography>
                <Button variant="contained" color="primary" sx={{ px: 3 }}> {statusMap[product.status]}</Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Sản phẩm liên quan</Typography>
          <Grid container spacing={2}>
            {(products || []).slice(0, 4).map((r) => (
              <Grid item xs={12} sm={6} md={3} key={r._id || r.id}>
                <Card>
                  <RouterLink to={`/products/${r._id || r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Box sx={{ height: 120, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${r.imageUrl || ''})` }} />
                    <CardContent>
                      <Typography sx={{ fontWeight: 700 }}>{r.name}</Typography>
                      <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>{(Number(r.price) || 0).toLocaleString('vi-VN')} đ</Typography>
                    </CardContent>
                  </RouterLink>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      <Box sx={{ height: '1px', bgcolor: '#ecf0f1' }}></Box>
      <Footer />
    </Box>
  )
}
