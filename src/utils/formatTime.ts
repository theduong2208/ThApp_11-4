// Định dạng giờ hiển thị trong bong bóng tin nhắn (HH:mm)
export function formatMessageTime(timestamp?: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Định dạng thời gian xem tin nhắn ("Đã xem lúc HH:mm")
export function formatReadTime(timestamp?: number): string {
  if (!timestamp) return '';
  return `Đã xem lúc ${formatMessageTime(timestamp)}`;
}

// Định dạng trạng thái hoạt động của người dùng ("Hoạt động X phút trước")
export function formatLastSeen(timestamp?: number): string {
  if (!timestamp) return 'Ngoại tuyến';
  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return 'Vừa mới truy cập';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) {
    return 'Vừa mới truy cập';
  }
  if (diffMin < 60) {
    return `Hoạt động ${diffMin} phút trước`;
  }
  if (diffHour < 24) {
    return `Hoạt động ${diffHour} giờ trước`;
  }
  if (diffDay === 1) {
    return 'Hoạt động hôm qua';
  }
  if (diffDay < 7) {
    return `Hoạt động ${diffDay} ngày trước`;
  }

  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `Hoạt động ngày ${day}/${month}`;
}

// Định dạng thời gian cho danh sách cuộc hội thoại
export function formatConversationTime(timestamp?: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return formatMessageTime(timestamp);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return 'Hôm qua';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}
