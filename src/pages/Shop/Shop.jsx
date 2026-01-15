import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Grid, Card, CardContent, Button, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Pagination, Stack } from '@mui/material'
import { getProductsAPI } from '~/apis/index'
import { addToCart } from '~/utils/cart'
import { Link as RouterLink } from 'react-router-dom'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const location = useLocation()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductsAPI()
        setProducts(data || [])
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load products', err)
      }
    }
    load()
  }, [])

  // initialize type filter from query param if present
  useEffect(() => {
    const paramsQ = new URLSearchParams(location.search)
    const t = paramsQ.get('type') || ''
    if (t) setTypeFilter(t)
  }, [location.search])

  // reset to first page whenever filters/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, minPrice, maxPrice])

  // compute filtered products and pagination
  const filteredProducts = (products || []).filter((p) => {
    const q = searchTerm.trim().toLowerCase()
    if (q) {
      const inName = (p.product_name || '').toLowerCase().includes(q)
      const inType = (p.product_type || '').toLowerCase().includes(q)
      if (!inName && !inType) return false
    }
    if (typeFilter) {
      if ((p.product_type || '') !== typeFilter) return false
    }
    const price = Number(p.price) || 0
    if (minPrice !== '') {
      const min = Number(minPrice)
      if (!Number.isNaN(min) && price < min) return false
    }
    if (maxPrice !== '') {
      const max = Number(maxPrice)
      if (!Number.isNaN(max) && price > max) return false
    }
    return true
  })

  const total = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (safePage - 1) * pageSize
  const pageItems = filteredProducts.slice(startIndex, startIndex + pageSize)

  // Shop page only renders product grid now; product detail moved to ProductDetail page

  // fallback: show shop grid (original behavior)
  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f7fbfb, #ffffff)' }}>
      <Header />
      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3, mt: 5 }}>

        {/* Filters / Search */}
        <Box className="shop-filters" display="flex" gap={2} alignItems="center" mb={10}>
          <TextField size="small" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 240 }} />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select label="Danh mục" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <MenuItem value="">Tất cả</MenuItem>
              {[...new Set((products || []).map(p => p.product_type).filter(Boolean))].map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField size="small" type="number" placeholder="Giá từ" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} sx={{ width: 120 }} />
          <TextField size="small" type="number" placeholder="Giá đến" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} sx={{ width: 120 }} />

          <Box sx={{ flex: 1 }} />
        </Box>

        <Grid container spacing={3}>
          {pageItems.map((p) => (
            <Grid item xs={12} sm={6} md={3} key={p._id || p.id}>
              <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 12px 30px rgba(16,24,32,0.08)', height: '100%' }}>
                <RouterLink to={`/products/${p._id || p.id}`}>
                  <Box sx={{ width: '100%', height: { xs: 180, md: 220 }, backgroundImage: `url(${p.image_url || ''})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'block' }} />
                </RouterLink>
                <CardContent>
                  <Typography sx={{ mt: 1, fontWeight: 600 }}>{p.product_name}</Typography>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                    <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>{(Number(p.price) || 0).toLocaleString('vi-VN')} đ</Typography>
                    {/* eslint-disable-next-line no-console */}
                    <Button variant="contained" size="small" onClick={() => { addToCart(p, 1); try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) { console.error('error', e) } }}>Thêm vào giỏ</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Stack spacing={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 10, mb: 10 }}>
        <Pagination
          count={totalPages}
          page={safePage}
          onChange={(e, v) => setCurrentPage(v)}
          variant="outlined"
          color="primary"
        />
      </Stack>

      <Footer />
    </Box>
  )
}
