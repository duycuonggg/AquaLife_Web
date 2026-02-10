import { Box, Typography, Grid, Button } from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import PublicIcon from '@mui/icons-material/Public'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import introduceImg from '~/assets/Introduce.png'

export default function Introduce() {


  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f7fbfb, #ffffff)' }}>
      <Header />

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2 }}>
        {/* Hàng tính năng */}
        <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
          <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 3, mt: 3, color: '#0b8798' }}>AquaLife</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 3, mt: 3 }}>Nơi nuôi dưỡng đam mê thủy sinh — chất lượng, tận tâm, bền vững.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 5, maxWidth: 600, margin: '0 auto' }}>
              Hơn 1 thập kỉ, chúng tôi đã nỗ lực, đồng hành với những người đam mê thủy sinh và cùng nhau phát triển cộng đồng.
              AquaLife không chỉ cung cấp chất lượng sản phẩm tốt nhất, lời khuyên của những chuyên gia hàng đầu trong lĩnh vực thủy sinh mà còn là những dịch vụ, ưu đãi ngoài mong đợi cho khách hàng.
              AquaLife xin cảm ơn sự tin tưởng và đồng hành của quý khách hàng trong suốt thời gian qua <span style={{ color: '#e74c3c' }}>&hearts;</span>.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2, mt: { xs: 6, md: 12 } }}>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2.5 }}>
                <Box sx={{ width: 64, height: 64, background: 'rgba(10,165,194,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, color: '#0aa5c2' }}><FavoriteBorderIcon fontSize="large" /></Box>
                <Typography variant="h6">Đam mê thủy sinh</Typography>
                <Typography variant="body2" color="text.secondary">Chúng tôi là những người đam mê thủy sinh, chia sẻ tình yêu với thế giới dưới nước.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2.5 }}>
                <Box sx={{ width: 64, height: 64, background: 'rgba(10,165,194,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, color: '#0aa5c2' }}><CheckCircleOutlineIcon fontSize="large" /></Box>
                <Typography variant="h6">Sản phẩm chất lượng</Typography>
                <Typography variant="body2" color="text.secondary">Chỉ những sản phẩm tốt nhất và cá khỏe mạnh mới có mặt trong bộ sưu tập của chúng tôi.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2.5 }}>
                <Box sx={{ width: 64, height: 64, background: 'rgba(10,165,194,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, color: '#0aa5c2' }}><PeopleOutlineIcon fontSize="large" /></Box>
                <Typography variant="h6">Tư vấn chuyên gia</Typography>
                <Typography variant="body2" color="text.secondary">Đội ngũ chuyên gia giàu kinh nghiệm hỗ trợ bạn từng bước chăm sóc và thiết kế bể cá.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2.5 }}>
                <Box sx={{ width: 64, height: 64, background: 'rgba(10,165,194,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, color: '#0aa5c2' }}><PublicIcon fontSize="large" /></Box>
                <Typography variant="h6">Bền vững</Typography>
                <Typography variant="body2" color="text.secondary">Cam kết nguồn cung trách nhiệm và các phương pháp thân thiện với môi trường.</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Story with image */}
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2, mt: { xs: 8, md: 25 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box role="img" aria-label="Our story image" sx={{ width: '100%', height: { xs: 220, md: 320 }, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 2, boxShadow: '0 18px 40px rgba(2,6,23,0.12)', backgroundImage: `url(${introduceImg})` }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 3, mt: 3 }}>Câu chuyện của chúng tôi</Typography>
              <Typography variant="body1" paragraph>Khởi nguồn từ một dự án đam mê vào năm 2015, AquaLife đã phát triển trở thành một thương hiệu đáng tin cậy trong lĩnh vực thủy sinh. Người sáng lập, chịu ảnh hưởng bởi tình yêu biển cả từ nhỏ, mong muốn tạo ra nơi hội tụ chất lượng và chuyên môn.</Typography>
              <Typography variant="body1" paragraph>Ngày nay, chúng tôi phục vụ hàng ngàn khách hàng, cung cấp từ bộ khởi đầu cho người mới đến thiết bị cao cấp cho các chuyên gia. Mỗi sản phẩm đều được kiểm tra nghiêm ngặt bởi đội ngũ của chúng tôi để đảm bảo tiêu chuẩn cao nhất.</Typography>

              <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}><Typography variant="h5" sx={{ fontWeight: 800, color: '#0aa5c2' }}>10+</Typography><Typography variant="caption">Năm kinh nghiệm</Typography></Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}><Typography variant="h5" sx={{ fontWeight: 800, color: '#0aa5c2' }}>50K+</Typography><Typography variant="caption">Khách hàng hài lòng</Typography></Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}><Typography variant="h5" sx={{ fontWeight: 800, color: '#0aa5c2' }}>500+</Typography><Typography variant="caption">Sản phẩm</Typography></Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ textAlign: 'center', p: 3, borderRadius: 1.25, mt: { xs: 6, md: 25 }, mb: { xs: 6, md: 25 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 5, mt: 5 }}>Bạn muốn bắt đầu dự án bể cá của riêng mình?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>Chúng tôi tư vấn miễn phí và hỗ trợ lắp đặt trọn gói.</Typography>
          <Button variant="contained" href="/contact">Nhận tư vấn miễn phí</Button>
        </Box>
      </Box>

      <Footer />
    </Box>
  )
}
