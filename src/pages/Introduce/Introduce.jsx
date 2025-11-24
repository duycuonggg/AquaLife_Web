import { Box, Typography, Grid, Button, Avatar } from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import PublicIcon from '@mui/icons-material/Public'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import '~/pages/Introduce/Introduce.css'
const introduceImg = new URL('~/assets/Introduce.png', import.meta.url).href


const team = [
  { name: 'Nguyễn Duy Cường', role: 'Người sáng lập', avatar: 'https://scontent.fhan14-5.fna.fbcdn.net/v/t39.30808-6/434676690_442145844943398_3149193981518289588_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=4tr8qXcr5_YQ7kNvwFUbnpG&_nc_oc=Adla8trB3w-m8zrNLoxYnK_hUFu-4D7Nh0LvJBuoezCPXO46gqfPMH0l9uH4JRsPBn4cvkSxMSVyCR3UExD-QCX2&_nc_zt=23&_nc_ht=scontent.fhan14-5.fna&_nc_gid=xuUBVHH4o1XW_-Z9dfM6LA&oh=00_AfirVei93TE0AWQbU5cbn6bGquToOYrR7a7BnBAbUKB2wA&oe=6924BA75' },
  { name: 'Trần Thị Dung', role: 'Quản lý chi nhánh Hà Nội', avatar: 'https://kenh14cdn.com/203336854389633024/2024/11/21/photo-1-17321846736181338524201-1732185461479-1732185462752272250093.jpg' },
  { name: 'Nguyễn Ánh Hân', role: 'Quản lý chi nhánh HCM', avatar: 'https://images2.thanhnien.vn/528068263637045248/2024/9/19/5-7-1726770263571270712017.jpg' }
]

export default function Introduce() {
  return (
    <Box>
      <Header />

      <Box className="introduce-content">
        {/* Hàng tính năng */}
        <Box className="introduce-hero">
          <Box className="introduce-hero-inner">
            <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 5, mt: 5, color: '#0b8798' }}>AquaLife</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 5, mt: 5 }}>Nơi nuôi dưỡng đam mê thủy sinh — chất lượng, tận tâm, bền vững.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 5, maxWidth: 600, margin: '0 auto' }}>
              Hơn 1 thập kỉ, chúng tôi đã nỗ lực, đồng hành với những người đam mê thủy sinh và cùng nhau phát triển cộng đồng.
              AquaLife không chỉ cung cấp chất lượng sản phẩm tốt nhất, lời khuyên của những chuyên gia hàng đầu trong lĩnh vực thủy sinh mà còn là những dịch vụ, ưu đãi ngoài mong đợi cho khách hàng.
              AquaLife xin cảm ơn sự tin tưởng và đồng hành của quý khách hàng trong suốt thời gian qua <span style={{ color: '#e74c3c' }}>&hearts;</span>.
            </Typography>
          </Box>
        </Box>
        <Box className="features-row">
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} sm={6} md={3}>
              <Box className="feature">
                <Box className="feature-icon"><FavoriteBorderIcon fontSize="large" /></Box>
                <Typography variant="h6">Đam mê thủy sinh</Typography>
                <Typography variant="body2" color="text.secondary">Chúng tôi là những người đam mê thủy sinh, chia sẻ tình yêu với thế giới dưới nước.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="feature">
                <Box className="feature-icon"><CheckCircleOutlineIcon fontSize="large" /></Box>
                <Typography variant="h6">Sản phẩm chất lượng</Typography>
                <Typography variant="body2" color="text.secondary">Chỉ những sản phẩm tốt nhất và cá khỏe mạnh mới có mặt trong bộ sưu tập của chúng tôi.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="feature">
                <Box className="feature-icon"><PeopleOutlineIcon fontSize="large" /></Box>
                <Typography variant="h6">Tư vấn chuyên gia</Typography>
                <Typography variant="body2" color="text.secondary">Đội ngũ chuyên gia giàu kinh nghiệm hỗ trợ bạn từng bước chăm sóc và thiết kế bể cá.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="feature">
                <Box className="feature-icon"><PublicIcon fontSize="large" /></Box>
                <Typography variant="h6">Bền vững</Typography>
                <Typography variant="body2" color="text.secondary">Cam kết nguồn cung trách nhiệm và các phương pháp thân thiện với môi trường.</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Story with image */}
        <Box className="story-section">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box className="story-image" role="img" aria-label="Our story image" style={{ backgroundImage: `url(${introduceImg})` }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 3, mt: 3 }}>Câu chuyện của chúng tôi</Typography>
              <Typography variant="body1" paragraph>Khởi nguồn từ một dự án đam mê vào năm 2015, AquaLife đã phát triển trở thành một thương hiệu đáng tin cậy trong lĩnh vực thủy sinh. Người sáng lập, chịu ảnh hưởng bởi tình yêu biển cả từ nhỏ, mong muốn tạo ra nơi hội tụ chất lượng và chuyên môn.</Typography>
              <Typography variant="body1" paragraph>Ngày nay, chúng tôi phục vụ hàng ngàn khách hàng, cung cấp từ bộ khởi đầu cho người mới đến thiết bị cao cấp cho các chuyên gia. Mỗi sản phẩm đều được kiểm tra nghiêm ngặt bởi đội ngũ của chúng tôi để đảm bảo tiêu chuẩn cao nhất.</Typography>

              <Box className="story-stats">
                <Box className="story-stat"><Typography variant="h5" sx={{ fontWeight: 800, color: '#0aa5c2' }}>10+</Typography><Typography variant="caption">Năm kinh nghiệm</Typography></Box>
                <Box className="story-stat"><Typography variant="h5" sx={{ fontWeight: 800, color: '#0aa5c2' }}>50K+</Typography><Typography variant="caption">Khách hàng hài lòng</Typography></Box>
                <Box className="story-stat"><Typography variant="h5" sx={{ fontWeight: 800, color: '#0aa5c2' }}>500+</Typography><Typography variant="caption">Sản phẩm</Typography></Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Team */}
        <Box className="team-section">
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 10, mt: 10 }}>Đội ngũ của chúng tôi</Typography>
          <Grid container spacing={3}>
            {team.map((m) => (
              <Grid item xs={12} sm={4} key={m.name}>
                <Box className="team-card">
                  <Avatar sx={{ width: 80, height: 80, mb: 2 }} src={m.avatar}>{m.name[0]}</Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{m.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{m.role}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box className="introduce-cta">
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 5, mt: 5 }}>Bạn muốn bắt đầu dự án bể cá của riêng mình?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>Chúng tôi tư vấn miễn phí và hỗ trợ lắp đặt trọn gói.</Typography>
          <Button variant="contained" href="/contact">Nhận tư vấn miễn phí</Button>
        </Box>
      </Box>

      <Footer />
    </Box>
  )
}
