import { useEffect, useState } from 'react'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Pagination, IconButton, TextField } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AdminOrderDetail from './AdminOrderDetail/AdminOrderDetail'
import './AdminOrders.css'
import { getOrdersAPI, getBranchesAPI, getCustomersAPI, updateOrderAPI } from '~/apis/index'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [branches, setBranches] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const load = async () => {
    try {
      const items = await getOrdersAPI()
      const normalized = Array.isArray(items) ? items.map((o) => ({
        ...o,
        __id: idToStr(o._id || o.id),
        __customersId: idToStr(o.customersId),
        __branchesId: idToStr(o.branchesId)
      })) : []
      setOrders(normalized)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load orders', err)
    }
  }

  const loadBranches = async () => {
    try {
      const b = await getBranchesAPI()
      setBranches(Array.isArray(b) ? b : [])
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load branches', err)
    }
  }

  const [customers, setCustomers] = useState([])
  const loadCustomers = async () => {
    try {
      const c = await getCustomersAPI()
      const normalized = Array.isArray(c) ? c.map((cu) => ({ ...cu, __id: idToStr(cu._id || cu.id) })) : []
      setCustomers(normalized)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load customers', err)
    }
  }

  useEffect(() => { load(); loadBranches(); loadCustomers() }, [])

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
    return (o._id || o.id || '').toString().toLowerCase().includes(q) || (o.name || o.customerName || '').toLowerCase().includes(q)
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
              <TableCell align="center">Chi nhánh</TableCell>
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
                <TableCell align="center">{branches.find(b => (b._id || b.id) === (o.branchesId || ''))?.name || '-'}</TableCell>
                <TableCell align="center">{o._id || o.id}</TableCell>
                <TableCell align="center">{(() => {
                  const found = customers.find(c => c.__id === o.__customersId)
                  return found?.name || o.name || o.customerName || '-'
                })()}
                </TableCell>
                <TableCell align="center">{new Date(o.orderDate).toLocaleString()}</TableCell>
                <TableCell align="center">{o.status}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#d32f2f' }}>{(Number(o.totalPrice) || 0).toLocaleString('vi-VN')} đ</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button size="small" variant="outlined" onClick={() => openDetail(o._id || o.id)}>Chi tiết</Button>
                    {o.status === 'Đang chờ' ? (
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
