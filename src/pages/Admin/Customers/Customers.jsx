import { useEffect, useState } from 'react'
import RefreshIcon from '@mui/icons-material/Refresh'
import { getCustomersAPI, updateCustomerAPI } from '~/apis/index'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Pagination, Stack } from '@mui/material'
import { toast } from 'react-toastify'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const fetch = async () => {
    setLoading(true)
    try {
      const data = await getCustomersAPI()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch customers', err)
      toast.error('Không thể tải danh sách khách hàng')
    }
    setLoading(false)
  }
  useEffect(() => {
    fetch()
  }, [])

  const handleOpenEdit = (customer) => {
    setEditing({ ...customer })
    setEditOpen(true)
  }
  const handleCloseEdit = () => {
    setEditOpen(false)
    setEditing(null)
  }
  const handleSaveEdit = async () => {
    if (!editing) return
    try {
      setLoading(true)
      const toUpdate = { ...editing }
      if (toUpdate.password === '') {
        delete toUpdate.password
      }
      await updateCustomerAPI(toUpdate._id || toUpdate.id, toUpdate)
      toast.success('Cập nhật khách hàng thành công')
      handleCloseEdit()
      fetch()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update customer', err)
      toast.error('Cập nhật khách hàng thất bại')
    }
    setLoading(false)
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={5} gap={2} mt={3}>
        <h2>Quản lý khách hàng</h2>
        <TextField size="small" placeholder="Tìm kiếm khách hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 260 }} />
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={fetch} title="Làm mới" disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <TableContainer component={Paper} sx={{ border: '1px solid #0b8798' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#0b8798' }}>
            <TableRow>
              <TableCell align="center">Tên</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">Số điện thoại</TableCell>
              <TableCell align="center">Địa chỉ</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(() => {
              const filtered = (customers || []).filter((c) => {
                if (!searchTerm) return true
                const q = searchTerm.toLowerCase()
                return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q)
              })
              const total = filtered.length
              const totalPages = Math.max(1, Math.ceil(total / pageSize))
              const safePage = Math.min(Math.max(1, currentPage), totalPages)
              const start = (safePage - 1) * pageSize
              const pageItems = filtered.slice(start, start + pageSize)
              return pageItems.map((c) => (
                <TableRow key={c._id || c.id}>
                  <TableCell align="center">{c.name}</TableCell>
                  <TableCell align="center">{c.email}</TableCell>
                  <TableCell align="center">{c.phone}</TableCell>
                  <TableCell align="center">{c.address}</TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => handleOpenEdit(c)}>Sửa</Button>
                  </TableCell>
                </TableRow>
              ))
            })()}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, mb: 10 }}>
        <Stack spacing={2}>
          <Pagination count={Math.max(1, Math.ceil(((customers || []).filter((c) => {
            if (!searchTerm) return true
            const q = searchTerm.toLowerCase()
            return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q)
          })).length / pageSize))} page={currentPage} onChange={(e, v) => setCurrentPage(v)} color="primary" />
        </Stack>
      </Box>

      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Sửa khách hàng</DialogTitle>
        <DialogContent>
          {editing && (
            <Box sx={{ mt: 1, display: 'grid', gap: 12 }}>
              <TextField label="Tên" value={editing.name || ''} onChange={(e) => setEditing(s => ({ ...s, name: e.target.value }))} fullWidth />
              <TextField label="Email" value={editing.email || ''} onChange={(e) => setEditing(s => ({ ...s, email: e.target.value }))} fullWidth />
              <TextField label="Số điện thoại" value={editing.phone || ''} onChange={(e) => setEditing(s => ({ ...s, phone: e.target.value }))} fullWidth />
              <TextField label="Địa chỉ" value={editing.address || ''} onChange={(e) => setEditing(s => ({ ...s, address: e.target.value }))} fullWidth />
              <TextField label="Mật khẩu (để trống nếu không đổi)" type="password" value={editing.password || ''} onChange={(e) => setEditing(s => ({ ...s, password: e.target.value }))} fullWidth />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
