let apiRoot = ''
if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:5173'
} else {
  apiRoot = 'https://aqualife-api.onrender.com'
}
export const API_ROOT = apiRoot

export const REGISTER_FIELD = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: ''
}

export const LOGIN_FIELD = {
  email: '',
  password: ''
}