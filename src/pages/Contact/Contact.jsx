import { useState } from 'react'
import { Box, Typography, Grid, TextField, Button, Card, CardContent } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      // TODO: submit to API endpoint when available
      // simulate network
      await new Promise((r) => setTimeout(r, 700))
      alert('Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      alert('Gửi thất bại, hãy thử lại sau.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Box>
      <Header />

      <Box sx={{ background: 'linear-gradient(180deg,#f7fbfb,#ffffff)', py: { xs: 5, md: 7 }, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', width: '100%', mb: 3, mt: 3 }}>Liên hệ</Typography>
        <Typography sx={{ color: '#577', mb: 0 }}>Có thắc mắc? Hãy gửi cho chúng tôi — chúng tôi sẵn sàng hỗ trợ.</Typography>
      </Box>

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2, mt: 3, pb: 7.5 }}>
        <Grid container spacing={4}>
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
