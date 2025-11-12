import { useEffect, useState } from 'react'
import { Box, Button, Typography, Grid, Card, CardContent, CardActions, TextField, IconButton } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { Link as RouterLink } from 'react-router-dom'
import ProductList from '~/components/ProductList'
import { getProductsAPI } from '~/apis/index'
import logo from '~/assets/logo.png'
import '~/styles/Home.css'
const heroImg = new URL('../assets/ChatGPT Image Nov 11, 2025, 10_38_32 PM.png', import.meta.url).href
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import LoopIcon from '@mui/icons-material/Loop'
import facebook from '~/assets/facebook.png'
import instagram from '~/assets/instagram.png'
import tiktok from '~/assets/tiktok.png'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

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

  const featured = (products || []).slice(0, 8)

  const categories = [
    { title: 'Bể cá', subtitle: 'Tanks' },
    { title: 'Cá nhiệt đới', subtitle: 'Tropical Fish' },
    { title: 'Thiết bị', subtitle: 'Equipment' },
    { title: 'Thực vật thủy sinh', subtitle: 'Aquatic Plants' }
  ]

  return (
    <Box>
      {/* Navbar */}
      <header className="home-nav">
        <div className="container">
          <div className="right">
            <div className="brand">
              <img src={logo} alt="AquaLife" />
              <span className="brand-title">AquaLife</span>
            </div>
          </div>

          <nav className="center" aria-label="main navigation">
            <Button component={RouterLink} to="/" className="nav-link">Trang chủ</Button>
            <Button component={RouterLink} to="/products" className="nav-link">Sản phẩm</Button>
            <Button component={RouterLink} to="/about" className="nav-link">Giới thiệu</Button>
            <Button component={RouterLink} to="/contact" className="nav-link">Liên hệ</Button>
          </nav>

          <div className="left">
            <Button component={RouterLink} to="/cart" variant="text" aria-label="cart">
              <ShoppingCartIcon sx={{ color: '#e67e22' }}/>
            </Button>
            <Button className="nav-link"component={RouterLink} to="/login" variant="text" >Đăng nhập</Button>
          </div>
        </div>
      </header>

      {/* Hero (full-bleed image with slogan) */}
      <Box className="home-hero" role="img" aria-label="Hero banner" style={{ backgroundImage: `url(${heroImg})` }}>
        <Box className="hero-slogan">Chạm vào từng khoảnh khắc <br /> sống động!</Box>
      </Box>

      {/* Categories */}
      <Box sx={{ background: '#f0fbfb', py: 4 }}>
        <Box className="home-categories">
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%' }}>Danh mục sản phẩm</Typography>
          </Box>
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
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%' }}>Sản phẩm nổi bật</Typography>
          <Box sx={{ flex: 1 }} />
        </Box>

        <Grid container spacing={3}>
          {(featured || []).filter(p => {
            if (!search) return true
            const q = search.toLowerCase()
            return (p.name || '').toLowerCase().includes(q) || (p.type || '').toLowerCase().includes(q)
          }).map((p) => (
            <Grid item xs={6} sm={4} md={3} key={p._id || p.id}>
              <Box className="featured-mini" sx={{ textAlign: 'center', p: 1 }}>
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
      <Box sx={{ background: '#f0fbfb', py: 4 }}>
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
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center', width: '100%' }}>Khách hàng của chúng tôi</Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}><Card><CardContent><Typography fontWeight={700}>Sarah Johnson</Typography><Typography variant="body2" color="text.secondary">Love the selection and fast delivery.</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={4}><Card><CardContent><Typography fontWeight={700}>Michael Chen</Typography><Typography variant="body2" color="text.secondary">Great quality fish and plants.</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={4}><Card><CardContent><Typography fontWeight={700}>Emily Rodriguez</Typography><Typography variant="body2" color="text.secondary">Customer support helped me set up my tank.</Typography></CardContent></Card></Grid>
        </Grid>
      </Box>

      <Box sx={{ background: '#f0fbfb', py: 4 }}>
        <Box className="home-newsletter" >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center', width: '100%' }}>Hãy đăng kí ngay</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>Nhận các mẹo chăm sóc bể cá chuyên nghiệp, ưu đãi độc quyền và sản phẩm mới.</Typography>
          <Box className="subscribe-form" display="flex" gap={2}>
            <TextField placeholder="Nhập email của bạn" fullWidth />
            <Button variant="contained">Gửi</Button>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box component="footer" className="site-footer">
        <Box className="footer-inner">
          <Box className="footer-col footer-brand">
            <Box className='brand'>
              <img src={logo} alt="AquaLife" className='brand-img' />
              <Typography fontWeight={700} className='brand-title'>AquaLife</Typography>
            </Box>
            <Typography>Chạm vào từng khoảnh khắc <br /> sống động!</Typography>
          </Box>

          <Box className="footer-col">
            <Typography fontWeight={700} sx={{ mb: 1 }}>Cửa hàng</Typography>
            <Box>
              <RouterLink to="/products" className='footer-link'>Cá Cảnh</RouterLink>
            </Box>
            <Box>
              <RouterLink to="/products" className='footer-link'>Tép cảnh</RouterLink>
            </Box>
            <Box>
              <RouterLink to="/products" className='footer-link'>Đèn</RouterLink>
            </Box>
            <Box>
              <RouterLink to="/products" className='footer-link'>Lọc</RouterLink>
            </Box>
          </Box>

          <Box className="footer-col">
            <Typography fontWeight={700} sx={{ mb: 1 }}>Hỗ trợ</Typography>
            <Box>Hướng dẫn</Box>
            <Box>Hỏi đáp</Box>
            <Box>Liên hệ</Box>
            <Box>Thông tin vận chuyển</Box>
          </Box>

          <Box className="footer-col">
            <Typography fontWeight={700} sx={{ mb: 1 }}>Kết nối</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <img src={facebook} alt="AquaLife" width={30} height={30} />
              <img src={instagram} alt="AquaLife" width={30} height={30} />
              <img src={tiktok} alt="AquaLife" width={30} height={30} />
            </Box>
          </Box>
        </Box>
        <Box sx={{ height: '1px', background: '#ecf0f1', marginTop: 4 }}></Box>
        <Box className="footer-bottom">© 2025 || AquaLife Shop. All rights reserved.</Box>
      </Box>
    </Box>
  )
}
