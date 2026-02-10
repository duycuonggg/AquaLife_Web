// Validate form đăng ký. Trả về object errors theo từng field để hiển thị tại chỗ.
export const validateRegister = ({ fullName, email, password, confirmPassword, address, phone }) => {
  const errors = {}

  if (!fullName || !fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên.'
  else if (fullName.trim().length < 2) errors.fullName = 'Họ tên phải có ít nhất 2 ký tự.'

  if (!email) errors.email = 'Vui lòng nhập email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ.'

  if (!phone) errors.phone = 'Vui lòng nhập số điện thoại.'
  else {
    const phonePattern = /^(0(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-46-9]))\d{7}$/
    if (!phonePattern.test(phone)) errors.phone = 'Số điện thoại không hợp lệ.'
  }

  if (!address) errors.address = 'Vui lòng nhập địa chỉ.'
  else if (address.trim().length < 10) errors.address = 'Địa chỉ phải có ít nhất 10 ký tự.'

  if (!password) errors.password = 'Vui lòng nhập mật khẩu.'
  else if (password.length < 10) errors.password = 'Mật khẩu phải có ít nhất 10 ký tự.'

  if (!confirmPassword) errors.confirmPassword = 'Vui lòng nhập lại mật khẩu.'
  else if (password && confirmPassword !== password) errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'

  return errors
}

export const validateLogin = ({ email, password }) => {
  const errors = {}
  if (!email) errors.email = 'Vui lòng nhập email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ.'

  if (!password) errors.password = 'Vui lòng nhập mật khẩu.'
  return errors
}