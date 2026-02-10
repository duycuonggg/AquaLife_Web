import { useState } from 'react'
import { Box, Typography, Grid, TextField, Button, Card, CardContent } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import { toast } from 'react-toastify'

export default function Contact() {
  // Trạng thái form: tên, email, tiêu đề, nội dung
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  // Trạng thái gửi (loading)
  const [sending, setSending] = useState(false)

  // Cập nhật giá trị input khi người dùng gõ
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Xử lý gửi form liên hệ
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      // TODO: gửi dữ liệu đến API khi sẵn sàng
      // Mô phỏng network delay
      await new Promise((r) => setTimeout(r, 700))
      toast.success('Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.')
      // Reset form sau khi gửi thành công
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      toast.error(err)
      toast.error('Gửi thất bại, hãy thử lại sau.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Box>
      <Header />

      {/* Phần tiêu đề trang liên hệ */}
      <Box sx={{ background: 'linear-gradient(180deg,#f7fbfb,#ffffff)', py: { xs: 5, md: 7 }, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 3, mt: 3 }}>Liên hệ</Typography>
        <Typography sx={{ color: '#577', mb: 0 }}>Có thắc mắc? Hãy gửi cho chúng tôi — chúng tôi sẵn sàng hỗ trợ.</Typography>
      </Box>

      {/* Form liên hệ (căn giữa trang) */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2, mt: 3, pb: 7.5, mb: 15 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 18px 40px rgba(2,6,23,0.06)' }}>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Họ và tên" name="name" value={form.name} onChange={onChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} fullWidth required />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField label="Tiêu đề" name="subject" value={form.subject} onChange={onChange} fullWidth />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField label="Nội dung" name="message" value={form.message} onChange={onChange} fullWidth multiline rows={6} />
                    </Grid>

                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" color="primary" disabled={sending} fullWidth>
                        {sending ? 'Đang gửi...' : 'Gửi tin nhắn'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Box>

      <Footer />
    </Box>
  )
}
