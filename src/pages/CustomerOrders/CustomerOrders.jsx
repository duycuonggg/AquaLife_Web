import { useEffect, useState } from 'react'
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material'
import Header from '~/components/Header/Header'
import Footer from '~/components/Footer/Footer'
import './CustomerOrders.css'
import { getCustomerOrdersAPI } from '~/apis/index'
import { useNavigate } from 'react-router-dom'

export default function CustomerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const data = await getCustomerOrdersAPI()
        if (!mounted) return
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load orders', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <Box>
      <Header />
      <Box className="orders-container">
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 10, mb: 10 }}>Đơn hàng của tôi</Typography>
        <Box className="orders-card">
          {orders.length === 0 ? (
            <Box className="placeholder">Bạn chưa có đơn hàng nào.</Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table className="orders-table" size="small">
                <TableHead className='orders-header'>
                  <TableRow>
                    <TableCell>Mã đơn</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Tổng tiền</TableCell>
                    <TableCell sx={{ width: 300 }}>Địa chỉ giao</TableCell>
                    <TableCell align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o._id || o.id}>
                      <TableCell>{o._id || o.id}</TableCell>
                      <TableCell>{new Date(o.orderDate).toLocaleString()}</TableCell>
                      <TableCell>{o.status}</TableCell>
                      <TableCell sx={{ color: '#d32f2f', fontWeight: 700 }}>{(Number(o.totalPrice) || 0).toLocaleString('vi-VN')} đ</TableCell>
                      <TableCell>{o.deliveryAddress}</TableCell>
                      <TableCell align="center">
                        <div className="orders-actions">
                          <Button size="small" variant="outlined" onClick={() => navigate(`/orders/${o._id || o.id}`)}>Chi tiết</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}
