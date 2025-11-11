import { useEffect, useState } from 'react'
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, TextField } from '@mui/material'
import { getEmployeesAPI, deleteEmployeeAPI, deleteAllEmployeesAPI } from '~/apis/index'
import EmployeeForm from '~/components/EmployeeForm'
import { toast } from 'react-toastify'
import { getUserRole } from '~/utils/auth'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  // loading state reserved for potential future spinner UI
  const [searchTerm, setSearchTerm] = useState('')
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)

  const isAdmin = getUserRole() === 'admin'

  const fetch = async () => {
    try {
      const res = await getEmployeesAPI()
      // getEmployeesAPI already returns response.data (the array), so use it directly
      /* eslint-disable-next-line no-console */
      console.debug('GET /v1/employees response:', res)
      setEmployees(res || [])
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi khi lấy nhân viên')
    }
  }

  useEffect(() => { fetch() }, [])

  const handleCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const handleEdit = (item) => {
    setEditing(item)
    setOpen(true)
  }

  const handleDelete = async (id) => {
    if (!isAdmin) return toast.error('Chỉ admin mới có quyền này')
    if (!window.confirm('Xác nhận xóa?')) return
    try {
      await deleteEmployeeAPI(id)
      toast.success('Đã xóa nhân viên')
      fetch()
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi khi xóa')
    }
  }

  const handleDeleteAll = async () => {
    if (!isAdmin) return toast.error('Chỉ admin mới có quyền này')
    if (!window.confirm('Xác nhận xóa tất cả nhân viên?')) return
    try {
      await deleteAllEmployeesAPI()
      toast.success('Đã xóa tất cả nhân viên')
      fetch()
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi khi xóa tất cả')
    }
  }

  const handleSuccess = () => {
    toast.success('Hoàn tất')
    setOpen(false)
    fetch()
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <h2>Quản lý nhân viên</h2>
        <TextField size="small" placeholder="Tìm kiếm nhân viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 260 }} />
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={fetch} title="Làm mới">
          <RefreshIcon />
        </IconButton>
        <Button variant="contained" onClick={handleCreate}>Tạo nhân viên</Button>
        {isAdmin && <Button variant="outlined" color="error" onClick={handleDeleteAll}>Xóa tất cả</Button>}
      </Box>

      <Box>
        {/* DEBUG: show count to help diagnose why table may be empty */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Mật khẩu</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {((employees || []).filter((emp) => {
                if (!searchTerm) return true
                const q = searchTerm.toLowerCase()
                return (emp.name || '').toLowerCase().includes(q) || (emp.email || '').toLowerCase().includes(q) || (emp.role || '').toLowerCase().includes(q) || (emp.phone || '').toLowerCase().includes(q)
              })).map((emp) => (
                <TableRow key={emp._id || emp.id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.role}</TableCell>
                  <TableCell>{emp.phone}</TableCell>
                  <TableCell>••••••••</TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => handleEdit(emp)}>Sửa</Button>
                    {isAdmin && <Button size="small" color="error" onClick={() => handleDelete(emp._id || emp.id)}>Xóa</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Cập nhật nhân viên' : 'Tạo nhân viên'}</DialogTitle>
        <DialogContent>
          <EmployeeForm initialData={editing} onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
