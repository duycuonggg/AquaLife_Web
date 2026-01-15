import { useEffect, useState } from 'react'
import { Box, Grid, Card, CardContent, Button, Typography, TextField, IconButton } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { getProductsAPI } from '~/apis/index'
import { addToCart } from '~/utils/cart'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Banner from '~/assets/Banner.png'
import banner1 from '~/assets/banner1.png'
import banner2 from '~/assets/banner2.png'
import banner3 from '~/assets/banner3.png'
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
  const banners = [banner1, banner2, banner3]
  const [bannerIndex, setBannerIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const prev = (e) => { e?.stopPropagation(); setBannerIndex(i => (i - 1 + banners.length) % banners.length) }
  const next = (e) => { e?.stopPropagation(); setBannerIndex(i => (i + 1) % banners.length) }

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

  // auto-rotate banners every 4 seconds (pauses on hover)
  useEffect(() => {
    if (paused) return undefined
    const t = setInterval(() => {
      setBannerIndex((i) => (i + 1) % banners.length)
    }, 4000)
    return () => clearInterval(t)
  }, [paused, banners.length])

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
      <Header />

      {/* Navbar (shared) */}
      <Box sx={{ position: 'relative' }}>
        <Box
          role="img"
          aria-label="Hero banner"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          sx={{
            width: '100%',
            backgroundImage: `url(${banners[bannerIndex] || Banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            height: { xs: 350, md: 750 },
            position: 'relative',
            transition: 'background-image 0.6s ease-in-out'
          }}
        >
          {/* dark gradient overlay for contrast */}
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.46))' }} />

          {/* left text + CTA */}
          {/* left text + CTA (only on first banner) */}
          {bannerIndex === 0 && (
            <Box sx={{ position: 'absolute', left: { xs: 16, md: 48 }, top: '30%', color: '#fff', maxWidth: { xs: '70%', md: '40%' } }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 22, md: 44 }, lineHeight: 1.05, textShadow: '0 6px 20px rgba(0,0,0,0.45)', animation: 'fadeInUp 700ms ease forwards' }}>Chạm vào từng khoảnh khắc</Typography>
              <Typography sx={{ mt: 1, mb: 2, opacity: 0.95, animation: 'fadeInUp 700ms ease forwards', animationDelay: '160ms' }}>Sống động mỗi ngày với bể cá của bạn</Typography>
              <Button component={RouterLink} to="/shop" variant="contained" sx={{ bgcolor: '#ff7043', '&:hover': { bgcolor: '#f45e36' }, animation: 'fadeInUp 700ms ease forwards', animationDelay: '320ms' }}>Mua ngay</Button>
            </Box>
          )}

          {/* prev/next controls */}
          <IconButton aria-label="Previous banner" onClick={prev} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#fff', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.45)' } }}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton aria-label="Next banner" onClick={next} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#fff', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.45)' } }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* indicators */}
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 12, display: 'flex', justifyContent: 'center', gap: 1 }}>
          {banners.map((_, idx) => (
            <Box key={idx} onClick={() => setBannerIndex(idx)} sx={{ width: 10, height: 10, borderRadius: '50%', background: idx === bannerIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)', cursor: 'pointer' }} />
          ))}
        </Box>
      </Box>

      {/* Featured Products (minimal view: image, name, price) */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 1.5, mt: 5 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 10, mt: 10 }}>Sản phẩm nổi bật</Typography>
          <Box sx={{ flex: 1 }} />
        </Box>

        <Grid container spacing={3}>
          {(featured || []).filter(p => {
            if (!search) return true
            const q = search.toLowerCase()
            return (p.product_name || '').toLowerCase().includes(q) || (p.product_type || '').toLowerCase().includes(q)
          }).map((p) => (
            <Grid item xs={6} sm={4} md={3} key={p._id || p.id}>
              <Card sx={{ borderRadius: 1, background: '#fff', boxShadow: '0 6px 18px rgba(16,24,32,0.06)' }}>
                <RouterLink to={`/products/${p._id || p.id}`}>
                  <Box sx={{ width: '100%', height: 140, backgroundImage: `url(${p.image_url || ''})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 1 }} />
                </RouterLink>
                <CardContent>
                  <Typography sx={{ mt: 1, fontWeight: 600 }}>{p.product_name}</Typography>
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
      <Box sx={{ mt: 10 }}>
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
      <Box sx={{ mt: 20, mb: 10 }}>
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
