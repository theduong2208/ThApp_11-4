# Ứng Dụng Chat Realtime 1-1 (React Native CLI & Firebase)

Ứng dụng nhắn tin 1-1 thời gian thực phát triển tiếp nối từ **Bài thực hành 4**, sử dụng **React Native CLI** (không dùng Expo), viết 100% bằng **TypeScript** ở chế độ nghiêm ngặt (`"strict": true`, không dùng `any`), kết nối trực tiếp với **Firebase JS SDK (v9+ Modular)**.

---

## 📱 Các Tính Năng Nổi Bật

1. **Xác thực người dùng (Authentication):**
   - Đăng ký tài khoản (họ tên, email, mật khẩu tối thiểu 6 ký tự, xác nhận mật khẩu).
   - Đăng nhập với thông báo lỗi tiếng Việt thân thiện (`auth/invalid-credential`, `auth/user-not-found`,...).
   - Lưu phiên đăng nhập lâu dài bằng `@react-native-async-storage/async-storage` qua `getReactNativePersistence`.
   - Đăng xuất an toàn: tự động chuyển trạng thái `online: false` trước khi thoát.

2. **Hiện diện thời gian thực (Realtime Presence):**
   - Theo dõi trạng thái Online/Offline qua node hệ thống `.info/connected` của Firebase Realtime Database.
   - Tự động đánh dấu Offline và cập nhật `lastSeen` bằng `onDisconnect()` khi người dùng tắt app hoặc mất kết nối mạng.
   - Hiển thị chấm màu trực quan (Xanh: Online, Xám: Offline) trong Danh bạ và Header màn hình Chat.

3. **Danh bạ & Tìm kiếm:**
   - Lắng nghe danh sách người dùng realtime, tự động loại bỏ tài khoản của chính mình.
   - Thanh tìm kiếm hỗ trợ tiếng Việt không dấu (sử dụng thuật toán chuẩn hóa NFD).

4. **Trò chuyện 1-1 Realtime:**
   - Tạo mã phòng `chatId` chuẩn hóa giữa 2 người dùng (`[uidA, uidB].sort().join('_')`).
   - Nhắn tin tức thì không cần tải lại trang.
   - Phân biệt bong bóng tin nhắn: người gửi căn phải (xanh dương đậm), người nhận căn trái (trắng/xám nhạt).
   - Tự động cuộn xuống tin nhắn mới nhất (`scrollToEnd`).
   - Vô hiệu hóa nút gửi khi ô nhập rỗng, bàn phím không che nội dung (`KeyboardAvoidingView`).

5. **Chia sẻ vị trí GPS (📍 Location):**
   - Xin quyền truy cập vị trí trên Android (`ACCESS_FINE_LOCATION`) và iOS (`NSLocationWhenInUseUsageDescription`).
   - Gửi tọa độ GPS hiện tại dưới dạng bong bóng `LocationBubble` riêng biệt.
   - Chạm vào tin nhắn vị trí để mở ngay trên Google Maps.

6. **Màn hình Đoạn chat (Home):**
   - Hiển thị danh sách các cuộc hội thoại, sắp xếp theo thời gian tin nhắn mới nhất giảm dần.
   - Hiển thị badge đỏ đếm số tin nhắn chưa đọc (`unread`).
   - Sử dụng **Atomic Multi-Path Update** khi gửi tin: đồng thời ghi tin nhắn và cập nhật danh sách chat của cả người gửi lẫn người nhận.
   - Tự động reset số tin chưa đọc về `0` khi mở màn hình chat hoặc khi đang xem chat mà có tin nhắn mới đến.

7. **Thông báo & Cài đặt:**
   - Giữ nguyên giao diện và trải nghiệm thông báo từ Bài 4, hỗ trợ đánh dấu từng thông báo hoặc tất cả là đã đọc.
   - Màn hình Cài đặt hiển thị thông tin hồ sơ và nút Đăng xuất.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
src/
├── types/
│   ├── models.ts             # Định nghĩa AppUser, Message, Conversation, NotificationItem
│   ├── navigation.ts         # Khai báo AuthStackParamList, MainTabParamList, RootStackParamList & screen props
│   ├── firebase-auth.d.ts    # Khai báo kiểu bổ trợ cho getReactNativePersistence
│   └── index.ts              # Re-export các kiểu dữ liệu
├── services/
│   ├── firebase.ts           # Khởi tạo Firebase App, Auth (AsyncStorage) và Realtime Database
│   ├── authService.ts        # Đăng ký, đăng nhập, đăng xuất, theo dõi auth state, dịch mã lỗi
│   ├── userService.ts        # Lắng nghe danh bạ, thiết lập Presence (Online/Offline)
│   ├── chatService.ts        # Lắng nghe tin nhắn, gửi tin nhắn (atomic update), gửi vị trí, markAsRead
│   ├── conversationService.ts# Lắng nghe danh sách cuộc trò chuyện theo thời gian thực
│   └── notificationService.ts# Quản lý danh sách thông báo mẫu
├── navigation/
│   ├── AuthStack.tsx         # Stack điều hướng Đăng nhập / Đăng ký
│   ├── MainTabs.tsx          # Bottom Tabs (Đoạn chat, Danh bạ, Thông báo, Cài đặt)
│   └── RootNavigator.tsx     # Điều hướng gốc (chuyển đổi AuthStack <-> MainTabs theo auth state)
├── screens/
│   ├── LoginScreen.tsx       # Màn hình Đăng nhập
│   ├── RegisterScreen.tsx    # Màn hình Đăng ký
│   ├── HomeScreen.tsx        # Màn hình Danh sách đoạn chat
│   ├── ContactsScreen.tsx    # Màn hình Danh bạ người dùng
│   ├── ChatScreen.tsx        # Màn hình Nhắn tin 1-1 & Gửi vị trí
│   ├── NotificationsScreen.tsx# Màn hình Thông báo
│   └── SettingsScreen.tsx    # Màn hình Cài đặt & Đăng xuất
├── components/
│   ├── Avatar.tsx            # Avatar tròn hiển thị ký tự đầu kèm màu ngẫu nhiên
│   ├── OnlineDot.tsx         # Chấm trạng thái Online/Offline
│   ├── MessageBubble.tsx     # Bong bóng tin nhắn văn bản
│   ├── LocationBubble.tsx    # Bong bóng tin nhắn vị trí GPS (mở Google Maps)
│   ├── ConversationItem.tsx  # Item cuộc trò chuyện ở màn Home
│   └── UserItem.tsx          # Item người dùng ở màn Danh bạ
├── hooks/
│   ├── useAuth.ts            # Hook theo dõi phiên đăng nhập & kích hoạt Presence
│   └── useLocationPermission.ts # Hook xin quyền vị trí & lấy tọa độ GPS
└── utils/
    ├── formatTime.ts         # Định dạng thời gian (HH:mm, Hôm qua, dd/MM)
    ├── validators.ts         # Kiểm tra tính hợp lệ của email, mật khẩu
    └── removeVietnameseTones.ts # Bỏ dấu tiếng Việt để tìm kiếm
```

---

## 🛠️ Cài Đặt & Khởi Chạy Ứng Dụng

### 1. Cài đặt các gói phụ thuộc
Tại thư mục gốc của dự án:
```bash
npm install
```

### 2. Cấu hình thông tin Firebase
Mở file [src/services/firebase.ts](file:///d:/TH_APP-21.10/src/services/firebase.ts) và thay thế object `firebaseConfig` bằng cấu hình lấy từ **Firebase Console > Project Settings > General > Your apps**:

```ts
const firebaseConfig = {
  apiKey: "AIzaSyYOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:android:abcdef123456"
};
```

### 3. Cấu hình Luật bảo mật Firebase Realtime Database
Tại Firebase Console, vào **Realtime Database > Rules** và dán đoạn luật sau:

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "chats": {
      "$chatId": {
        ".read": "auth != null && $chatId.contains(auth.uid)",
        ".write": "auth != null && $chatId.contains(auth.uid)"
      }
    },
    "userChats": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        "$peerId": {
          ".write": "auth != null && (auth.uid === $uid || auth.uid === $peerId)"
        }
      }
    }
  }
}
```

### 4. Khởi chạy Metro Bundler
```bash
npm start
```

### 5. Chạy ứng dụng trên Android
Khởi động máy ảo Android hoặc kết nối thiết bị thật qua USB Debugging, sau đó chạy:
```bash
npm run android
```

### 6. Chạy ứng dụng trên iOS (Chỉ dành cho macOS)
```bash
cd ios && pod install && cd ..
npm run ios
```

---

## 🧪 Kịch Bản Kiểm Thử Nhanh (2 Thiết Bị / Máy Ảo)

1. **Chuẩn bị 2 tài khoản:**
   - **Thiết bị 1:** Đăng ký tài khoản `user1@gmail.com` ("Nguyễn Văn A").
   - **Thiết bị 2:** Đăng ký tài khoản `user2@gmail.com` ("Trần Thị B").
2. **Kiểm tra Presence:** Cả 2 máy vào tab **Danh bạ** sẽ thấy người kia hiển thị chấm xanh **Online**.
3. **Nhắn tin 1-1:**
   - Thiết bị 1 bấm vào "Trần Thị B" để mở màn hình chat và gửi tin `"Xin chào!"`.
   - Thiết bị 2 nhận được tin nhắn tức thì bên trái màn hình.
4. **Kiểm tra Unread Badge:**
   - Thiết bị 2 ở tab **Đoạn chat (Home)**.
   - Thiết bị 1 gửi 2 tin nhắn -> Thiết bị 2 hiển thị badge đỏ số **2**.
   - Thiết bị 2 mở cuộc trò chuyện -> Badge tự động biến mất (trở về 0).
5. **Gửi vị trí GPS:**
   - Trong màn hình chat, bấm nút 📍.
   - Đồng ý cấp quyền vị trí khi popup xuất hiện.
   - Tin nhắn vị trí xuất hiện kèm tọa độ, bấm vào để mở bản đồ Google Maps.
6. **Kiểm tra Offline & Thoát:**
   - Thiết bị 2 vào tab **Cài đặt** -> chọn **Đăng xuất**.
   - Thiết bị 1 lập tức thấy trạng thái của "Trần Thị B" chuyển sang chấm xám **Ngoại tuyến**.

---

## 🔍 Kiểm Tra Kiểu Dữ Liệu TypeScript

Dự án tuân thủ nghiêm ngặt chuẩn TypeScript strict. Kiểm tra không có bất kỳ lỗi biên dịch nào:
```bash
npx tsc --noEmit
```
*(Lệnh chạy và thoát sạch với mã 0, không có lỗi)*
