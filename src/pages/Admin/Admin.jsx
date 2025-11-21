import { useEffect, useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Storefront as StorefrontIcon,
  People as PeopleIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import './Admin.css'
import { useNavigate } from 'react-router-dom'
import { getBranchesAPI } from '~/apis/index'
// product dialogs are handled inside the Products page
import logo from '~/assets/logo.png'
import LogoutIcon from '@mui/icons-material/Logout'
import Products from '~/pages/Products'
import Employees from '~/pages/Employees'
import Customers from '~/pages/Customers'

export default function Admin() {
  const [section, setSection] = useState('dashboard')
  const [tabIndex, setTabIndex] = useState(0)

  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()


  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getBranchesAPI()
        setBranches(data)
      } catch (err) {
        // keep debug info out of UI per requirement; allow a single console line for dev troubleshooting
        /* eslint-disable-next-line no-console */
        console.error('Failed to load branches', err)
      } finally {
        setLoading(false)
      }
    }

    // load branches once when component mounts
    load()
  }, [])
  return (
    <Box className="admin-root">
      <AppBar position="fixed" className="admin-appbar">
        <Toolbar>
          <img src={logo} alt="AquaLife Logo" className="logo-icon" />
          <Typography variant="h6" className="appbar-title">AquaLife</Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            className="appbar-title"
            startIcon={<LogoutIcon />}
            onClick={() => {
              try {
                localStorage.removeItem('auth_token')
              } catch (e) {
                /* ignore */
              }
              navigate('/login', { replace: true })
            }}
          >
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" className="admin-main">
        <Box className="admin-top">
          <Box className="admin-title-area">
            <Tabs
              value={tabIndex}
              onChange={(e, v) => {
                setTabIndex(v)
                // internal keys (English) used by section comparisons; labels remain Vietnamese
                const mapping = ['dashboard', 'products', 'branches', 'employees', 'customers']
                setSection(mapping[v])
              }}
              sx={{ mt: 1 }}
            >
              <Tab icon={<DashboardIcon />} iconPosition="start" label="Bảng điều khiển" />
              <Tab icon={<InventoryIcon />} iconPosition="start" label="Sản phẩm" />
              <Tab icon={<StorefrontIcon />} iconPosition="start" label="Chi nhánh" />
              <Tab icon={<PeopleIcon />} iconPosition="start" label="Nhân viên" />
              <Tab icon={<PersonIcon />} iconPosition="start" label="Khách hàng" />
            </Tabs>
          </Box>
        </Box>

        {section === 'dashboard' && (
          <Box>
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>Hiệu suất bán hàng chi nhánh</Typography>
              <Grid container spacing={3}>
                {loading ? (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography>Đang tải...</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ) : (branches.length > 0 ? branches.map((b) => (
                  <Grid item xs={12} key={b._id || b.id}>
                    <Card className="branch-panel">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6">{b.name}</Typography>
                          </Box>
                          <Box>
                            <Button size="small" variant="text">Xem chi tiết ▾</Button>
                          </Box>
                        </Box>

                        <Box mt={2}>
                          <LinearProgress variant="determinate" value={b.progress || 0} sx={{ height: 10, borderRadius: 6 }} />
                        </Box>

                        <Box className="branch-inner-card" mt={2}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                              <Box className="metric-tile">
                                <Typography variant="caption">Doanh thu</Typography>
                                <Typography fontWeight={700}>{b.revenue ?? '-'}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Box className="metric-tile">
                                <Typography variant="caption">Đơn hàng</Typography>
                                <Typography fontWeight={700}>{b.orders ?? '-'}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Box className="metric-tile">
                                <Typography variant="caption">Khách hàng</Typography>
                                <Typography fontWeight={700}>{b.customers ?? '-'}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Box className="metric-tile">
                                <Typography variant="caption">Nhân viên</Typography>
                                <Typography fontWeight={700}>{b.avgOrder ?? '-'}</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )) : null)}
              </Grid>
            </Box>
          </Box>
        )}

        {section === 'products' && (
          <Box>
            <Products />
          </Box>
        )}

        {section === 'branches' && (
          <Box>
            <Typography variant="h5" gutterBottom>Branch Management</Typography>
            <Grid container spacing={3}>
              {branches.length > 0 ? branches.map((b) => (
                <Grid item xs={12} sm={6} md={4} key={b._id || b.id}>
                  <Card className="branch-card-grid">
                    <Box className="branch-grid-media" style={{ backgroundImage: `url(${b.image})` }} />
                    <CardContent>
                      <Typography variant="h6">{b.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{b.address}</Typography>
                      <Box mt={2}>
                        <Typography variant="body2">Manager: {b.manager}</Typography>
                        <Typography variant="body2">{b.phone}</Typography>
                        <Typography variant="body2">{b.email}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )) : null}
            </Grid>
          </Box>
        )}

        {section === 'employees' && (
          <Box>
            <Employees />
          </Box>
        )}

        {section === 'customers' && (
          <Box>
            <Box>
              <Customers />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
