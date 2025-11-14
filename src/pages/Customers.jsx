import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { getCustomersAPI, updateCustomerAPI, deleteCustomerAPI, deleteAllCustomersAPI, getBranchesAPI } from '~/apis/index'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { toast } from 'react-toastify'
import { getUserRole } from '~/utils/auth'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const isAdmin = getUserRole() === 'admin'

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await getCustomersAPI()
      // getCustomersAPI returns response.data directly
      setCustomers(res || [])
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi khi lấy khách hàng')
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const b = await getBranchesAPI()
      setBranches(b)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load branches', err)
    }
  }

  useEffect(() => {
    fetch()
    fetchBranches()
  }, [])

  const handleOpenEdit = (c) => {
    setEditing({ ...c })
    setEditOpen(true)
  }

  const handleCloseEdit = () => {
    setEditing(null)
    setEditOpen(false)
  }

  const handleSaveEdit = async () => {
    try {
      const id = editing._id || editing.id
      const payload = {
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
        address: editing.address
      }
      // only include password if provided
      if (editing.password) payload.password = editing.password

      await updateCustomerAPI(id, payload)
      toast.success('Cập nhật khách hàng thành công')
      handleCloseEdit()
      fetch()
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi khi cập nhật')
    }
  }

  const handleDelete = async (id) => {
    if (!isAdmin) return toast.error('Chỉ admin mới có quyền này')
    const ok = window.confirm('Bạn chắc chắn muốn xóa khách hàng này?')
    if (!ok) return
    try {
      await deleteCustomerAPI(id)
      toast.success('Đã xóa khách hàng')
      // remove from selection if present
      fetch()
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi khi xóa')
    }
  }
  const handleDeleteAll = async () => {
    if (!isAdmin) return toast.error('Chỉ admin mới có quyền này')
    if (!window.confirm('Xác nhận xóa tất cả khách hàng?')) return
    try {
      await deleteAllCustomersAPI()
      toast.success('Đã xóa tất cả khách hàng')
      fetch()
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi khi xóa tất cả')
    }
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <h2>Quản lý khách hàng</h2>
        <TextField size="small" placeholder="Tìm kiếm khách hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 260 }} />
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={fetch} title="Làm mới" disabled={loading}>
          <RefreshIcon />
        </IconButton>
        {isAdmin && <Button variant="outlined" color="error" onClick={handleDeleteAll} sx={{ ml: 1 }} disabled={loading}>Xóa tất cả</Button>}
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Chi nhánh</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Mật khẩu</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {((customers || []).filter((c) => {
              if (!searchTerm) return true
              const q = searchTerm.toLowerCase()
              return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q)
            })).map((c) => (
              <TableRow key={c._id || c.id}>
                <TableCell>{(branches.find(b => (b._id || b.id) === c.branchesId)?.name) || '-'}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.address}</TableCell>
                <TableCell>••••••••</TableCell>
                <TableCell align="center">
                  <Button size="small" onClick={() => handleOpenEdit(c)}>Sửa</Button>
                  {isAdmin && <Button size="small" color="error" onClick={() => handleDelete(c._id || c.id)}>Xóa</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
