import { useEffect, useState } from 'react'
import { getEmployeesAPI, deleteEmployeeAPI, deleteAllEmployeesAPI, getBranchesAPI } from '~/apis/index'
import EmployeeForm from '~/pages/Admin/Employees/EmployeeForm/EmployeeForm'
import { toast } from 'react-toastify'
import { getUserRole } from '~/utils/auth'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Pagination, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [branches, setBranches] = useState([])
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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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
      <Box display="flex" alignItems="center" mb={5} gap={2} mt={3}>
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
        <TableContainer component={Paper} sx={{ border: '1px solid #0b8798' }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#0b8798' }}>
              <TableRow>
                <TableCell align="center">Chi nhánh</TableCell>
                <TableCell align="center">Tên</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Vai trò</TableCell>
                <TableCell align="center">Số điện thoại</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
                const filtered = (employees || []).filter((emp) => {
                  if (!searchTerm) return true
                  const q = searchTerm.toLowerCase()
                  return (emp.name || '').toLowerCase().includes(q) || (emp.email || '').toLowerCase().includes(q) || (emp.role || '').toLowerCase().includes(q) || (emp.phone || '').toLowerCase().includes(q)
                })
                const total = filtered.length
                const totalPages = Math.max(1, Math.ceil(total / pageSize))
                const safePage = Math.min(Math.max(1, currentPage), totalPages)
                const start = (safePage - 1) * pageSize
                const pageItems = filtered.slice(start, start + pageSize)
                return pageItems.map((emp) => (
                  <TableRow key={emp._id || emp.id}>
                    <TableCell align="center">{(branches.find(b => b._id === emp.branchesId)?.name) || '-'}</TableCell>
                    <TableCell align="center">{emp.name}</TableCell>
                    <TableCell align="center">{emp.email}</TableCell>
                    <TableCell align="center">{emp.role}</TableCell>
                    <TableCell align="center">{emp.phone}</TableCell>
                    <TableCell align="center">
                      <Button size="small" onClick={() => handleEdit(emp)}>Sửa</Button>
                      {isAdmin && <Button size="small" color="error" onClick={() => handleDelete(emp._id || emp.id)}>Xóa</Button>}
                    </TableCell>
                  </TableRow>
                ))
              })()}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, mb: 10 }}>
          <Stack spacing={2}>
            <Pagination count={Math.max(1, Math.ceil(((employees || []).filter((emp) => {
              if (!searchTerm) return true
              const q = searchTerm.toLowerCase()
              return (emp.name || '').toLowerCase().includes(q) || (emp.email || '').toLowerCase().includes(q) || (emp.role || '').toLowerCase().includes(q) || (emp.phone || '').toLowerCase().includes(q)
            })).length / pageSize))} page={currentPage} onChange={(e, v) => setCurrentPage(v)} color="primary" />
          </Stack>
        </Box>
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
