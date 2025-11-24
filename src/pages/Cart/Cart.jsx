import { useEffect, useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, Button, TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import { getCart, removeFromCart, updateQty, clearCart } from '~/utils/cart'

export default function Cart() {
  const [items, setItems] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  useEffect(() => {
    setItems(getCart())
    const onUpdate = () => setItems(getCart())
    window.addEventListener('cartUpdated', onUpdate)
    window.addEventListener('storage', onUpdate)
    return () => {
      window.removeEventListener('cartUpdated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [])

  const onRemove = (id) => {
    removeFromCart(id)
    setItems(getCart())
  }

  const onQty = (id, v) => {
    const n = Number(v) || 1
    updateQty(id, n < 1 ? 1 : Math.floor(n))
    setItems(getCart())
  }

  const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0)

  const onCheckout = async () => {
    if (items.length === 0) return alert('Giỏ hàng đang trống')
    if (!customerName || customerName.trim().length < 2) return alert('Vui lòng nhập tên khách hàng')
    if (!customerPhone || customerPhone.trim().length < 7) return alert('Vui lòng nhập số điện thoại hợp lệ')
    if (!paymentMethod) return alert('Vui lòng chọn phương thức thanh toán')

    // For now, simulate successful payment / order creation on frontend
    try {
      // simulate network/save delay
      await new Promise((res) => setTimeout(res, 600))
      clearCart()
      setItems([])
      setCustomerName('')
      setCustomerPhone('')
      setCustomerEmail('')
      setPaymentMethod('cash')
      alert('Thanh toán thành công. Cảm ơn bạn đã mua hàng!')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Checkout failed', err)
      alert('Thanh toán thất bại: ' + (err?.message || 'Lỗi'))
    }
  }

  return (
    <Box>
      <Header />
      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Giỏ hàng</Typography>
        {items.length === 0 ? (
          <Typography>Giỏ hàng trống.</Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              {items.map((it) => (
                <Card key={it.id} sx={{ mb: 2 }}>
                  <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ width: 96, height: 72, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${it.imageUrl || ''})` }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{it.name}</Typography>
                      <Typography color="primary">{(Number(it.price) || 0).toLocaleString('vi-VN')} đ</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField size="small" value={it.qty} onChange={(e) => onQty(it.id, e.target.value)} inputProps={{ style: { width: 56, textAlign: 'center' } }} />
                      <Button color="error" onClick={() => onRemove(it.id)}>Xóa</Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Grid>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography sx={{ fontWeight: 700 }}>Tổng</Typography>
                  <Typography sx={{ mt: 1 }}>{total.toLocaleString('vi-VN')} đ</Typography>

                  <TextField label="Tên khách hàng" fullWidth value={customerName} onChange={(e) => setCustomerName(e.target.value)} sx={{ mt: 2 }} />
                  <TextField label="Số điện thoại" fullWidth value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} sx={{ mt: 1 }} />
                  <TextField label="Email (tuỳ chọn)" fullWidth value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} sx={{ mt: 1 }} />

                  <FormControl sx={{ mt: 2 }} component="fieldset">
                    <FormLabel component="legend">Phương thức thanh toán</FormLabel>
                    <RadioGroup row value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <FormControlLabel value="cash" control={<Radio />} label="Tiền mặt" />
                      <FormControlLabel value="card" control={<Radio />} label="Thẻ" />
                      <FormControlLabel value="online" control={<Radio />} label="Ví/Chuyển khoản" />
                    </RadioGroup>
                  </FormControl>

                  <Button variant="contained" sx={{ mt: 2 }} onClick={onCheckout}>Thanh toán</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
      <Footer />
    </Box>
  )
}
