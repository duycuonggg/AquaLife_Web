import { useEffect, useState } from 'react'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Pagination, IconButton, TextField } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AdminOrderDetail from './AdminOrderDetail/AdminOrderDetail'
// AdminOrders.css was empty — styles handled via MUI `sx` props
import { getOrdersAPI, updateOrderAPI, getCustomersAPI } from '~/apis/index'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const load = async () => {
    try {
      const [items, users] = await Promise.all([getOrdersAPI(), getCustomersAPI()])
      const userMap = (Array.isArray(users) ? users : []).reduce((acc, u) => {
        const id = idToStr(u?._id || u?.id)
        if (!id) return acc
        acc[id] = u
        return acc
      }, {})

      const normalized = Array.isArray(items) ? items.map((o) => {
        const rawUserId = o.userId || o.customerId || o.customersId
        const userId = idToStr(rawUserId?._id || rawUserId)
        const user = userMap[userId]
        const displayName = user?.name || user?.email || user?.phone || userId
        return {
          ...o,
          __id: idToStr(o._id || o.id),
          __userId: userId,
          __userDisplay: displayName
        }
      }) : []
      setOrders(normalized)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load orders', err)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const openDetail = (id) => setSelectedOrderId(id)
  const closeDetail = () => setSelectedOrderId(null)
  const [approvingId, setApprovingId] = useState(null)

  const idToStr = (v) => {
    if (!v && v !== 0) return ''
    try {
      if (typeof v === 'string') return v
      if (v && typeof v.toString === 'function') return v.toString()
      return JSON.stringify(v)
    } catch (e) {
      return String(v)
    }
  }

  const filtered = (orders || []).filter((o) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (o._id || o.id || '').toString().toLowerCase().includes(q) || (o.__userDisplay || '').toLowerCase().includes(q)
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const shown = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={5} gap={2} mt={3}>
        <h2>Quản lý đơn hàng</h2>
        <TextField size="small" placeholder="Tìm kiếm đơn hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 260 }} />
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={load} title="Làm mới">
          <RefreshIcon />
        </IconButton>
      </Box>

      <TableContainer component={Paper} sx={{ border: '1px solid #0b8798' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#0b8798' }}>
            <TableRow>
              <TableCell align="center">Mã đơn</TableCell>
                <TableCell align="center">Khách hàng</TableCell>
                <TableCell align="center">Thời gian</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Tổng</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((o) => (
              <TableRow key={o._id || o.id}>
                <TableCell align="center">{o._id || o.id}</TableCell>
                <TableCell align="center">{o.__userDisplay || '-'}</TableCell>
                <TableCell align="center">
                  {(() => {
                    const timeValue = o.createdAt || o.orderDate
                    return timeValue ? new Date(timeValue).toLocaleString() : '-'
                  })()}
                </TableCell>
                <TableCell align="center">{o.status}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#d32f2f' }}>{(Number(o.totalPrice) || 0).toLocaleString('vi-VN')} đ</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button size="small" variant="outlined" onClick={() => openDetail(o._id || o.id)}>Chi tiết</Button>
                    {o.status === 'Đang đợi' ? (
                      approvingId === (o._id || o.id) ? (
                        <Button size="small" variant="contained" disabled>
                          ...
                        </Button>
                      ) : (
                        <Button size="small" variant="contained" onClick={async () => {
                          try {
                            setApprovingId(o._id || o.id)
                            const updated = await updateOrderAPI(o._id || o.id, { status: 'Đã xác nhận' })
                            setOrders((prev) => prev.map(x => (String(x._id) === String(o._id || o.id) ? updated : x)))
                            // refresh modal if it's open for this order
                            if (selectedOrderId === (o._id || o.id)) {
                              setSelectedOrderId(null)
                              // reopen to trigger reload
                              setTimeout(() => setSelectedOrderId(o._id || o.id), 120)
                            }
                          } catch (err) {
                            // eslint-disable-next-line no-console
                            console.error('Approve failed', err)
                            const status = err?.response?.status
                            const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message
                            if (status === 401 || status === 403) {
                              alert('Cập nhật trạng thái thất bại: Bạn không có quyền (401/403)')
                            } else {
                              alert(`Cập nhật trạng thái thất bại: ${serverMsg}`)
                            }
                          } finally {
                            setApprovingId(null)
                          }
                        }}>Xác nhận</Button>
                      )
                    ) : (
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </Box>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminOrderDetail open={Boolean(selectedOrderId)} orderId={selectedOrderId} onClose={closeDetail} />

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, mb: 10 }}>
        <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
      </Box>
    </Box>
  )
}
