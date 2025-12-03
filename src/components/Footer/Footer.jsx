import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import logo from '~/assets/logo.png'
import facebook from '~/assets/facebook.png'
import instagram from '~/assets/instagram.png'
import tiktok from '~/assets/tiktok.png'

export default function Footer() {
  return (
    <Box component="footer" sx={{ background: 'linear-gradient(180deg, #dbe8e8, #ffffff)', color: '#0b2f3a', pt: 1.5, position: 'relative' }}>
      <Box sx={{ height: 0, bgcolor: '#ecf0f1', mb: 10 }} />

      <Box sx={{
        maxWidth: 1100,
        mx: 'auto',
        p: 1.5,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr 1fr 1fr' },
        gap: 3,
        alignItems: 'start'
      }}>
        <Box sx={{ lineHeight: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box component="img" src={logo} alt="AquaLife" sx={{ width: 44, height: 44, borderRadius: 1 }} />
            <Typography sx={{ fontWeight: 700, color: '#0b8798' }}>AquaLife</Typography>
          </Box>
          <Typography>Chạm vào từng khoảnh khắc <br /> sống động <span style={{ color: 'red' }}>&#9825;</span></Typography>
        </Box>

        <Box sx={{ lineHeight: 1.8 }}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>Cửa hàng</Typography>
          <Box><RouterLink to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>Cá Cảnh</RouterLink></Box>
          <Box><RouterLink to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>Tép cảnh</RouterLink></Box>
          <Box><RouterLink to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>Đèn</RouterLink></Box>
          <Box><RouterLink to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>Lọc</RouterLink></Box>
        </Box>

        <Box sx={{ lineHeight: 1.8 }}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>Hỗ trợ</Typography>
          <Box>Hướng dẫn</Box>
          <Box>Hỏi đáp</Box>
          <Box>Liên hệ</Box>
          <Box>Thông tin vận chuyển</Box>
        </Box>

        <Box sx={{ lineHeight: 1.8 }}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>Kết nối</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box component="img" src={facebook} alt="facebook" sx={{ width: 30, height: 30 }} />
            <Box component="img" src={instagram} alt="instagram" sx={{ width: 30, height: 30 }} />
            <Box component="img" src={tiktok} alt="tiktok" sx={{ width: 30, height: 30 }} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center', px: 1.5, fontSize: 15, fontWeight: 600, bgcolor: '#0b8798', color: '#064b61', mt: 2, pt: 2 }}>© 2025 || AquaLife Shop. All rights reserved.</Box>
    </Box>
  )
}
