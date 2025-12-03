import { useEffect, useState } from 'react'
import { Box, Grid, Card, CardContent, Button, Typography, TextField } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { getProductsAPI } from '~/apis/index'
import { addToCart } from '~/utils/cart'
const heroImg = new URL('~/assets/Banner.png', import.meta.url).href
import Footer from '~/components/Footer/Footer'
import Header from '~/components/Header/Header'
import productreturn from '~/assets/productreturn.png'
import delivery from '~/assets/delivery.png'
import helpdesk from '~/assets/helpdesk.png'
import favorites from '~/assets/favorites.png'

export default function Home() {
  const [products, setProducts] = useState([])
  const [, setLoading] = useState(false)
  const [search] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getProductsAPI()
        setProducts(data || [])
      } catch (err) {
        /* eslint-disable-next-line no-console */
        console.error('Failed to load products', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const onBranch = (e) => {
      const id = e?.detail?.id || ''
      setSelectedBranchId(id)
      // scroll to featured products
      window.scrollTo({ top: 400, behavior: 'smooth' })
    }
    window.addEventListener('branchSelected', onBranch)
    return () => window.removeEventListener('branchSelected', onBranch)
  }, [])

  const matchesBranch = (p) => {
    if (!selectedBranchId) return true
    // product may contain branchesId (single), branchesId array, or stockByBranch array
    if (!p) return false
    if (p.branchesId && String(p.branchesId) === String(selectedBranchId)) return true
    if (Array.isArray(p.branchesId) && p.branchesId.map(x => String(x)).includes(String(selectedBranchId))) return true
    if (Array.isArray(p.stockByBranch)) {
      if (p.stockByBranch.find(sb => String(sb.branch || sb.branchesId || sb.branchId) === String(selectedBranchId))) return true
    }
    if (p.branchId && String(p.branchId) === String(selectedBranchId)) return true
    return false
  }

  const featured = (products || []).filter(matchesBranch).slice(0, 8)

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f7fbfb, #ffffff)' }}>
      {/* Navbar (shared) */}
      <Header />

      {/* Hero (full-bleed image with slogan) */}
      <Box
        role="img"
        aria-label="Hero banner"
        sx={{
          width: '100%',
          backgroundImage: `url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          height: { xs: 420, md: 680 },
          position: 'relative'
        }}
      >
        <Box sx={{
          position: 'absolute',
          left: { xs: 24, md: 48 },
          top: '28%',
          color: '#fff',
          fontWeight: 600,
          fontStyle: 'italic',
          lineHeight: 1.05,
          textShadow: '0 6px 20px rgba(0,0,0,0.45)',
          width: '30ch',
          fontFamily: 'monospace',
          fontSize: { xs: '24px', sm: '28px', md: '44px', lg: '56px' }
        }}>
          <Box component="span" sx={{ display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap', width: '30ch' }}>Chạm vào từng khoảnh khắc</Box>
          <br />
          <Box component="span" sx={{ display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap', width: '15ch' }}>sống động <Box component="span" sx={{ color: 'red' }}>&#9825;</Box></Box>
        </Box>
      </Box>

      {/* Featured Products (minimal view: image, name, price) */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 1.5, mt: 10 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 10, mt: 10 }}>Sản phẩm nổi bật</Typography>
          <Box sx={{ flex: 1 }} />
        </Box>

        <Grid container spacing={3}>
          {(featured || []).filter(p => {
            if (!search) return true
            const q = search.toLowerCase()
            return (p.name || '').toLowerCase().includes(q) || (p.type || '').toLowerCase().includes(q)
          }).map((p) => (
            <Grid item xs={6} sm={4} md={3} key={p._id || p.id}>
              <Card sx={{ borderRadius: 1, background: '#fff', boxShadow: '0 6px 18px rgba(16,24,32,0.06)' }}>
                <RouterLink to={`/products/${p._id || p.id}`}>
                  <Box sx={{ width: '100%', height: 140, backgroundImage: `url(${p.imageUrl || ''})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 1 }} />
                </RouterLink>
                <CardContent>
                  <Typography sx={{ mt: 1, fontWeight: 600 }}>{p.name}</Typography>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                    <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>{(Number(p.price) || 0).toLocaleString('vi-VN')} đ</Typography>
                    <Button variant="contained" size="small" onClick={() => { addToCart(p, 1); try { window.dispatchEvent(new CustomEvent('cartUpdated')) } catch (e) { console.error('error', e) } }}>Thêm vào giỏ</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Feature icons */}
      <Box sx={{ mt: 20 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 10, mt: 10 }}>Chính Sách và Cam Kết Hàng Đầu</Typography>
        </Box>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <img src={delivery} alt="Delivery" style={{ width: 80, height: 80, marginBottom: 8 }} />
                <Typography fontWeight={700}>Miễn phí vận chuyển</Typography>
                <Typography variant="caption">Đơn hàng từ 500k</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <img src={favorites} alt="Quality Assurance" style={{ width: 80, height: 80, marginBottom: 8 }} />
                <Typography fontWeight={700}>Đảm bảo chất lượng</Typography>
                <Typography variant="caption">Của hàng uy tín</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <img src={helpdesk} alt="Support" style={{ width: 80, height: 80, marginBottom: 8 }} />
                <Typography fontWeight={700}>Chuyên gia hỗ trợ</Typography>
                <Typography variant="caption">24/7</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <img src={productreturn} alt="Return" style={{ width: 80, height: 80, marginBottom: 8 }} />
                <Typography fontWeight={700}>Dễ dàng trả hàng</Typography>
                <Typography variant="caption">30 ngày</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Newsletter signup */}
      <Box sx={{ mt: 30, mb: 30 }}>
        <Box sx={{ textAlign: 'center' }} >
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mt: 10, mb: 5 }}>Hãy đăng ký ngay</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 10, textAlign: 'center' }}>Nhận các mẹo chăm sóc bể cá chuyên nghiệp, ưu đãi độc quyền và sản phẩm mới.</Typography>
        </Box>
        <Box sx={{ display: 'flex', width: '50%', mx: 'auto', mb: 10 }} >
          <TextField placeholder="Nhập email của bạn" fullWidth />
          <Button variant="contained">Gửi</Button>
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  )
}
