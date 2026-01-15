import { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material'
import { getOrderAPI, getOrderDetailsAPI, getProductAPI } from '~/apis/index'

export default function AdminOrderDetail({ open, orderId, onClose }) {
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!orderId) return
      setLoading(true)
      try {
        const o = await getOrderAPI(orderId)
        if (!mounted) return
        setOrder(o)
        const details = await getOrderDetailsAPI(orderId)
        if (!mounted) return
        const withProd = await Promise.all((details || []).map(async (d) => {
          try {
            const pid = (d.productsId && (d.productsId._id || d.productsId.toString)) ? (d.productsId._id || d.productsId.toString()) : String(d.productsId)
            const p = await getProductAPI(pid)
            return { ...d, productName: p?.product_name, productImage: p?.image_url || p?.image }
          } catch (err) {
            return d
          }
        }))
        setItems(withProd)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load admin order detail', err)
      } finally {
        setLoading(false)
      }
    }
    if (open) load()
    return () => { mounted = false }
  }, [open, orderId])

  return (
    <Dialog open={Boolean(open)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle variant='h5' sx={{ fontWeight: 700 }}>Chi tiết đơn hàng</DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1 }} elevation={0}>
          <Box>
            {!order && !loading && <Typography>Không tìm thấy đơn hàng.</Typography>}
            {order && (
              <>
                <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, pb: 2 }}>
                  <Typography><span style={{ fontWeight: 700 }}>Mã đơn:</span> {order._id || order.id}</Typography>
                </Box>
                <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, pb: 2 }}>
                  <Typography><span style={{ fontWeight: 700 }}>Thời gian:</span> {new Date(order.orderDate).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, pb: 2 }}>
                  <Typography><span style={{ fontWeight: 700 }}>Trạng thái:</span> {order.status}</Typography>
                </Box>
                <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, pb: 2 }}>
                  <Typography><span style={{ fontWeight: 700 }}>Tổng:</span> {(Number(order.totalPrice) || 0).toLocaleString('vi-VN')} đ</Typography>
                </Box>
                <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, pb: 2 }}>
                  <Typography><span style={{ fontWeight: 700 }}>Địa chỉ:</span> {order.deliveryAddress}</Typography>
                </Box>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Tên sản phẩm</TableCell>
                        <TableCell align="center">Ảnh</TableCell>
                        <TableCell align="center">Số lượng</TableCell>
                        <TableCell align="center">Giá</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(items || []).map((it) => (
                        <TableRow key={it._id || it.id}>
                          <TableCell align="center">{it.productName || it.productsId}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                              {it.productImage ? (
                                <Box sx={{ width: 64, height: 48, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${it.productImage})`, borderRadius: 1 }} />
                              ) : (
                                <Box sx={{ width: 64, height: 48, background: '#f0f0f0', borderRadius: 1 }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">{it.quantity}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: '#d32f2f' }}>{(Number(it.priceAtOrder) || 0).toLocaleString('vi-VN')} đ</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}
