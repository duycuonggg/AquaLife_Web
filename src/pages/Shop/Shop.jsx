import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Grid, Card, CardContent, Button, Typography, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { getProductsAPI } from '~/apis/index'
import { addToCart } from '~/utils/cart'
import { Link as RouterLink } from 'react-router-dom'
import '~/pages/Shop/Shop.css'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [branchFilter, setBranchFilter] = useState('')

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

  const navigate = useNavigate()

  // initialize type filter from query param if present
  useEffect(() => {
    const paramsQ = new URLSearchParams(location.search)
    const t = paramsQ.get('type') || ''
    if (t) setTypeFilter(t)
    const b = paramsQ.get('branch') || ''
    if (b) setBranchFilter(b)
    else {
      // if no branch query param, try to read persisted selection from localStorage
      try {
        const saved = localStorage.getItem('selectedBranch') || ''
        if (saved) setBranchFilter(saved)
      } catch (err) {
        // ignore
      }
    }
  }, [location.search])

  // listen for branchSelected events (dispatched by Header) so filtering works across pages
  useEffect(() => {
    const onBranch = (e) => {
      const id = e?.detail?.id || ''
      setBranchFilter(id)
      try {
        // persist selection so future pages / reloads also know about it
        if (id) localStorage.setItem('selectedBranch', id)
        else localStorage.removeItem('selectedBranch')
        const params = new URLSearchParams(location.search)
        if (id) params.set('branch', id)
        else params.delete('branch')
        const search = params.toString() ? `?${params.toString()}` : ''
        navigate(`${location.pathname}${search}`, { replace: true })
      } catch (err) {
        // ignore
      }
    }
    window.addEventListener('branchSelected', onBranch)
    return () => window.removeEventListener('branchSelected', onBranch)
  }, [location.search, location.pathname, navigate])

  // reset to first page whenever filters/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, minPrice, maxPrice, branchFilter])

  // compute filtered products and pagination
  const filteredProducts = (products || []).filter((p) => {
    const q = searchTerm.trim().toLowerCase()
    if (q) {
      const inName = (p.name || '').toLowerCase().includes(q)
      const inType = (p.type || '').toLowerCase().includes(q)
      if (!inName && !inType) return false
    }
    // branch filtering
    if (branchFilter) {
      const id = String(branchFilter)
      if (!p) return false
      if (p.branchesId && String(p.branchesId) === id) {
        // matched
      } else if (Array.isArray(p.branchesId) && p.branchesId.map(x => String(x)).includes(id)) {
        // matched
      } else if (Array.isArray(p.stockByBranch)) {
        if (!p.stockByBranch.find(sb => String(sb.branch || sb.branchesId || sb.branchId) === id)) return false
      } else if (p.branchId && String(p.branchId) === id) {
        // matched
      } else {
        return false
      }
    }
    if (typeFilter) {
      if ((p.type || '') !== typeFilter) return false
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
      <Box className="shop-page" sx={{ maxWidth: 1100, mx: 'auto', p: 3, mt: 10 }}>

        {/* Filters / Search */}
        <Box className="shop-filters" display="flex" gap={2} alignItems="center" mb={10}>
          <TextField size="small" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 240 }} />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select label="Danh mục" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <MenuItem value="">Tất cả</MenuItem>
              {[...new Set((products || []).map(p => p.type).filter(Boolean))].map((t) => (
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
              <Card className="shop-card">
                <RouterLink to={`/products/${p._id || p.id}`} className="card-thumb-link">
                  <div className="card-thumb" style={{ backgroundImage: `url(${p.imageUrl || ''})` }} />
                </RouterLink>
                <CardContent>
                  <Typography className="mini-name" sx={{ mt: 1, fontWeight: 600 }}>{p.name}</Typography>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                    <Typography className="mini-price" sx={{ color: '#d32f2f', fontWeight: 700 }}>{(Number(p.price) || 0).toLocaleString('vi-VN')} đ</Typography>
                    <Button variant="contained" size="small" onClick={() => {
                      addToCart(p, 1)
                      try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) { console.error('error', e) }
                    }}>Thêm vào giỏ</Button>
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
