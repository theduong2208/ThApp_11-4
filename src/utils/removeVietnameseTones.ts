// Hàm loại bỏ dấu tiếng Việt phục vụ tìm kiếm không dấu
export function removeVietnameseTones(str: string): string {
  let result = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  result = result.replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'));
  return result.toLowerCase().trim();
}

