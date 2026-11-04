// Kiểm tra tính hợp lệ của email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Kiểm tra mật khẩu (tối thiểu 6 ký tự theo chuẩn Firebase Auth)
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

