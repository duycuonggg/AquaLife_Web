import { useState } from 'react'
import { Box, Typography, Grid, TextField, Button, Card, CardContent } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
// styles migrated from Contact.css into MUI `sx` props
import { getHeadquaterAPI, getBranchesAPI } from '~/apis'
import { useEffect } from 'react'

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

  const [branches, setBranches] = useState([])

  const [hq, setHq] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await getHeadquaterAPI()
        if (!mounted) return
        // backend returns the headquater document directly
        setHq(data)
      } catch (err) {
        // ignore
      }
    })()
    ;(async () => {
      try {
        const b = await getBranchesAPI()
        if (!mounted) return
        setBranches(Array.isArray(b) ? b : [])
      } catch (err) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

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

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ background: '#fff', p: 2.25, borderRadius: 1.25, boxShadow: '0 10px 30px rgba(2,6,23,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ width: 42, height: 42, background: 'rgba(10,165,194,0.08)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0aa5c2', mb: 1 }}><EmailIcon /></Box>
                <Typography variant="subtitle1">Email</Typography>
                <Typography variant="body2" color="text.secondary">{hq?.email || 'support@aqualife.vn'}</Typography>
              </Box>

              <Box sx={{ background: '#fff', p: 2.25, borderRadius: 1.25, boxShadow: '0 10px 30px rgba(2,6,23,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ width: 42, height: 42, background: 'rgba(10,165,194,0.08)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0aa5c2', mb: 1 }}><PhoneIcon /></Box>
                <Typography variant="subtitle1">Gọi cho chúng tôi</Typography>
                <Typography variant="body2" color="text.secondary">{hq?.phone || '0912 345 678'}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mb: 10, mt: 20 }}>Các cửa hàng của chúng tôi</Typography>
          <Grid container spacing={3}>
            {(branches.length ? branches : []).map((l) => (
              <Grid item xs={12} md={4} key={l._id || l.title || l.address}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 18px 40px rgba(2,6,23,0.06)', height: 150 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Box sx={{ width: 36, height: 36, background: 'rgba(10,165,194,0.06)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0aa5c2' }}><LocationOnIcon /></Box>
                      <Typography variant="h6">{l.name || l.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{l.address}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>{l.phone}</Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: '#666' }}>{l.hours || ''}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Footer />
    </Box>
  )
}
