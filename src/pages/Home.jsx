import { useEffect, useState } from 'react'
import { Box, Button, Typography, Grid, Card, CardContent, CardActions, TextField } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { getProductsAPI } from '~/apis/index'
// logo and shopping cart icon unused here (Header renders brand/cart)
import '~/styles/Home.css'
const heroImg = new URL('../assets/ChatGPT Image Nov 11, 2025, 10_38_32 PM.png', import.meta.url).href
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import LoopIcon from '@mui/icons-material/Loop'
import Footer from '~/components/Footer'
import Header from '~/components/Header'

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

  const categories = [
    { title: 'Bể cá', subtitle: 'Tanks' },
    { title: 'Cá nhiệt đới', subtitle: 'Tropical Fish' },
    { title: 'Thiết bị', subtitle: 'Equipment' },
    { title: 'Thực vật thủy sinh', subtitle: 'Aquatic Plants' }
  ]

  return (
    <Box>
      {/* Navbar (shared) */}
      <Header />

      {/* Hero (full-bleed image with slogan) */}
      <Box className="home-hero" role="img" aria-label="Hero banner" style={{ backgroundImage: `url(${heroImg})` }}>
        <Box className="hero-slogan">
          <span className="line line1">Chạm vào từng khoảnh khắc</span>
          <br />
          <span className="line line2">sống động <span style={{ color: 'red' }}>&#9825;</span></span>
        </Box>
      </Box>

      {/* Categories */}
      <Box sx={{ background: 'linear-gradient(180deg,#f7fbfb,#ffffff)', py: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 10, mt: 10 }}>Danh mục sản phẩm</Typography>
        </Box>
        <Box className="home-categories">
          <Grid container spacing={3}>
            {categories.map((c) => (
              <Grid item xs={12} sm={6} md={3} key={c.title}>
                <Card sx={{ height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(180deg,#fff,#f7fdfe)' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="primary">{c.subtitle}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{c.title}</Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-start', px: 2, pb: 2 }}>
                    <Button component={RouterLink} to="/products" size="small">View {c.subtitle}</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Featured Products (minimal view: image, name, price) */}
      <Box className="home-featured">
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
              <Box
                className="featured-mini"
                component={RouterLink}
                to={`/products/${p._id || p.id}`}
                sx={{ textAlign: 'center', p: 1, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                {p.imageUrl ? (
                  <Box className="mini-thumb" sx={{ backgroundImage: `url(${p.imageUrl})` }} />
                ) : (
                  <Box className="mini-thumb" sx={{ background: '#f2f2f2' }} />
                )}
                <Typography className="mini-name" sx={{ mt: 1, fontWeight: 600 }}>{p.name}</Typography>
                <Typography className="mini-price" sx={{ color: '#d32f2f', fontWeight: 700 }}>{(Number(p.price) || 0).toLocaleString('vi-VN')} đ</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Feature icons */}
      <Box sx={{ background: 'linear-gradient(180deg,#f7fbfb,#ffffff)', py: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 10, mt: 10 }}>Chính Sách và Cam Kết Hàng Đầu</Typography>
        </Box>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <LocalShippingIcon sx={{ fontSize: 48, mb: 1, color: '#e67e22' }} />
                <Typography fontWeight={700}>Miễn phí vận chuyển</Typography>
                <Typography variant="caption">Đơn hàng từ 500k</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <WorkspacePremiumIcon sx={{ fontSize: 48, mb: 1, color: '#d35400' }} />
                <Typography fontWeight={700}>Đảm bảo chất lượng</Typography>
                <Typography variant="caption">Của hàng uy tín</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <SupportAgentIcon sx={{ fontSize: 48, mb: 1, color: '#f39c12' }} />
                <Typography fontWeight={700}>Chuyên gia hỗ trợ</Typography>
                <Typography variant="caption">24/7</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <LoopIcon sx={{ fontSize: 48, mb: 1, color: '#f1c40f' }} />
                <Typography fontWeight={700}>Dễ dàng trả hàng</Typography>
                <Typography variant="caption">30 ngày</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Testimonials + Newsletter */}
      <Box className="home-testimonials">
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 10, mt: 10 }}>Khách hàng của chúng tôi</Typography>
        </Box>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}><Card><CardContent><Typography fontWeight={700}>Sarah Johnson</Typography><Typography variant="body2" color="text.secondary">Love the selection and fast delivery.</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={4}><Card><CardContent><Typography fontWeight={700}>Michael Chen</Typography><Typography variant="body2" color="text.secondary">Great quality fish and plants.</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={4}><Card><CardContent><Typography fontWeight={700}>Emily Rodriguez</Typography><Typography variant="body2" color="text.secondary">Customer support helped me set up my tank.</Typography></CardContent></Card></Grid>
        </Grid>
      </Box>

      <Box sx={{ background: 'linear-gradient(180deg,#f7fbfb,#ffffff)', py: 4 }}>
        <Box className="home-newsletter" >
          <Box display="flex" alignItems="center" gap={2} mb={2} justifyContent={'center'} flexDirection={'column'}>
            <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mt: 10 }}>Hãy đăng ký ngay</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 10, textAlign: 'center' }}>Nhận các mẹo chăm sóc bể cá chuyên nghiệp, ưu đãi độc quyền và sản phẩm mới.</Typography>
          </Box>
          <Box className="subscribe-form" display="flex" gap={2}>
            <TextField placeholder="Nhập email của bạn" fullWidth />
            <Button variant="contained">Gửi</Button>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  )
}
