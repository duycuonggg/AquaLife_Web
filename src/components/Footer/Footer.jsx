import { Box, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import logo from '~/assets/logo.png'
import facebook from '~/assets/facebook.png'
import instagram from '~/assets/instagram.png'
import tiktok from '~/assets/tiktok.png'
import '~/components/Footer/Footer.css'

export default function Footer() {
  return (
    <Box component="footer" className="site-footer">
      <Box sx={{ height: '0px', bgcolor: '#ecf0f1', mb: 10 }}></Box>
      <Box className="footer-inner">
        <Box className="footer-col footer-brand">
          <Box className='brand'>
            <img src={logo} alt="AquaLife" className='brand-img' />
            <Typography fontWeight={700} className='brand-title'>AquaLife</Typography>
          </Box>
          <Typography>Chạm vào từng khoảnh khắc <br /> sống động <span style={{ color: 'red' }}>&#9825;</span></Typography>
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
      <Box className="footer-bottom">© 2025 || AquaLife Shop. All rights reserved.</Box>
    </Box>
  )
}
