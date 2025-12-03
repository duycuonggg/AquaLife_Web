import { useEffect, useState } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
// styles migrated from OrderDetail.css into MUI `sx` props
import { getOrderAPI, getOrderDetailsAPI, getProductAPI } from '~/apis/index'
import { useParams } from 'react-router-dom'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const o = await getOrderAPI(id)
        if (!mounted) return
        setOrder(o)

        const details = await getOrderDetailsAPI(id)
        // debug: log raw details returned from API
        // eslint-disable-next-line no-console
        console.log('Order details API response for', id, details)
        if (!mounted) return

        // fetch product names + images in parallel with debug logs
        const withNames = await Promise.all((details || []).map(async (d) => {
          const prodId = (d.productsId && (d.productsId._id || d.productsId.toString)) ? (d.productsId._id || d.productsId.toString()) : String(d.productsId)
          // eslint-disable-next-line no-console
          console.log('Fetch product for order-detail', prodId)
          try {
            const p = await getProductAPI(prodId)
            // eslint-disable-next-line no-console
            console.log('Product fetched', prodId, p)
            return { ...d, productName: p?.name, productImage: p?.imageUrl || p?.image }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed fetching product for', prodId, err?.response?.status || err?.message || err)
            return d
          }
        }))

        setItems(withNames)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load order detail', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  return (
    <Box>
      <Header />
      <Box sx={{ maxWidth: 1000, margin: '0 auto', p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 10, mt: 10 }}>Chi tiết đơn hàng</Typography>
        <Box sx={{ background: '#fff', p: '18px', borderRadius: '8px', boxShadow: '0 6px 18px rgba(0,0,0,0.04)', marginBottom: '100px' }}>
          {loading && !order && <Typography>Đang tải...</Typography>}
          {order && (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '100px' }}>
                <Typography sx={{ lineHeight: 3 }}><strong>Mã đơn:</strong> {order._id || order.id}</Typography>
                <Typography sx={{ lineHeight: 3 }}><strong>Thời gian:</strong> {new Date(order.orderDate).toLocaleString()}</Typography>
                <Typography sx={{ lineHeight: 3 }}><strong>Trạng thái:</strong> {order.status}</Typography>
                <Typography sx={{ lineHeight: 3 }}><strong>Tổng:</strong> {(Number(order.totalPrice) || 0).toLocaleString('vi-VN')} đ</Typography>
                <Typography sx={{ lineHeight: 3 }}><strong>Địa chỉ:</strong> {order.deliveryAddress}</Typography>
              </Box>

              <Box mt={2}>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small" sx={{ '& th, & td': { padding: '8px 12px', borderBottom: '1px solid #eee' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên sản phẩm</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>Ảnh</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>Số lượng</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>Giá</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4}><em>Đơn hàng chưa có sản phẩm</em></TableCell>
                        </TableRow>
                      )}
                      {items.map((it) => (
                        <TableRow key={it._id || it.id}>
                          <TableCell>{it.productName}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {it.productImage ? (
                                <Box sx={{ width: 64, height: 48, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${it.productImage})`, borderRadius: 1 }} />
                              ) : (
                                <Box sx={{ width: 64, height: 48, background: '#f0f0f0', borderRadius: 1 }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{it.quantity}</TableCell>
                          <TableCell sx={{ color: '#d32f2f', fontWeight: 700, textAlign: 'center' }}>{(Number(it.priceAtOrder) || 0).toLocaleString('vi-VN')} đ</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}

          {!loading && !order && (
            <Typography>Không tìm thấy đơn hàng.</Typography>
          )}
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}
