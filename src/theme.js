import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const theme = extendTheme({
  palette: {
    primary: {
      main: '#0693a6'
    }
  },
  // chuyển về chữ bình thường (viết hoa chữ cái đầu)
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          color: '#000000',
          '&.Mui-selected': {
            color: '#0693a6' // màu khi được chọn
          }
        }
      }
    }
  }
})

export default theme