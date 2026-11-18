# Ứng Dụng Chat Realtime Đa Năng (React Native CLI + Firebase + Cloudinary)
## Báo Cáo & Tài Liệu Dự Án — Bài Thực Hành 5

Ứng dụng nhắn tin trò chuyện thời gian thực hoàn chỉnh phát triển tiếp nối từ **Bài thực hành 4** lên **Bài thực hành 5**, sử dụng nền tảng **React Native CLI** (không Expo), viết 100% bằng **TypeScript** ở chế độ nghiêm ngặt (`"strict": true`, không dùng `any`), kết nối trực tiếp với **Firebase Realtime Database (Modular SDK v9+)** và lưu trữ đa phương tiện qua **Cloudinary REST API (Unsigned Preset)**.

---

## 📱 Các Tính Năng Đã Triển Khai Hoàn Thiện

### PHẦN A – BẮT BUỘC (8 điểm)

#### 1. Trạng thái trong cuộc trò chuyện (1.5đ)
- **Đang soạn tin (Typing Indicator):** Khi đối phương đang gõ, thanh tiêu đề phòng chat lập tức hiển thị `"đang soạn tin..."`. Trạng thái tự động tắt sau 3 giây không gõ (debounce), khi bấm nút gửi tin hoặc khi người dùng rời màn hình chat.
- **Trạng thái Đã gửi / Đã xem (Delivery & Seen Status):** Tin nhắn cuối cùng do mình gửi hiển thị thời gian thực trạng thái `"✓ Đã gửi"` hoặc `"✓✓ Đã xem Lúc HH:mm"` (dựa vào `readStatus/{convId}/{uid}` của người nhận).
- **Hoạt động X phút trước (Smart Last Seen):** Khi đối phương ngoại tuyến, thanh tiêu đề hiển thị thân thiện: `"Hoạt động vừa xong"`, `"Hoạt động X phút trước"`, `"Hoạt động X giờ trước"`, hoặc ngày cụ thể thay vì chỉ hiển thị chữ "offline".
- **onDisconnect() an toàn:** Sử dụng `onDisconnect()` ở cả trạng thái online (`.info/connected`) và trạng thái đang gõ (`typing/{convId}/{uid}`) để không bao giờ bị kẹt trạng thái khi ứng dụng bị tắt đột ngột hoặc mất kết nối mạng.

#### 2. Thu hồi và tương tác với tin nhắn (1.5đ)
- **Menu tương tác tin nhắn (Message Action Modal):** Nhấn giữ một tin nhắn bất kỳ để mở menu gồm:
  - Thả cảm xúc với 5 emoji tiêu chuẩn: 👍, ❤️, 😂, 😮, 😢.
  - Sao chép nội dung tin nhắn (`@react-native-clipboard/clipboard`).
  - Trả lời tin nhắn (Reply / Quote).
  - Thu hồi tin nhắn (chỉ hiển thị đối với tin nhắn do chính mình gửi).
- **Thu hồi tin nhắn (Recall):** Đánh dấu `recalled: true` (không xóa node trên database). Tin nhắn đã thu hồi lập tức hiển thị `"Tin nhắn đã được thu hồi"` trên máy của tất cả thành viên.
- **Đồng bộ tin cuối ở màn hình Home:** Nếu tin cuối cùng của cuộc trò chuyện bị thu hồi, dòng xem trước (`lastMessage`) ở màn hình Home cũng lập tức đổi thành `"Tin nhắn đã được thu hồi"`.
- **Hiển thị cảm xúc (Reactions):** Cảm xúc hiển thị ngay dưới bong bóng tin nhắn kèm số lượng (ví dụ: `❤️ 2`), làm nổi bật cảm xúc do chính mình thả.

#### 3. Gửi hình ảnh & Tải lên đám mây (2đ)
- **Chọn ảnh đa phương tiện:** Nút **📷** cung cấp 2 lựa chọn: **Chụp ảnh mới** (Camera) hoặc **Chọn từ thư viện** (`react-native-image-picker`). Tự động xin quyền `CAMERA` trên Android và thông báo rõ ràng nếu người dùng từ chối.
- **Tối ưu kích thước & Cloudinary:** Tự động thu nhỏ ảnh (cạnh dài $\le 1024$px, chất lượng 0.8) trước khi tải lên Cloudinary bằng **Unsigned Upload Preset** qua REST API (không lưu API Secret trong mã nguồn). Database chỉ lưu URL ảnh an toàn.
- **Bong bóng tạm (Optimistic UI):** Trong lúc ảnh đang được tải lên, giao diện hiển thị bong bóng tạm thời kèm vòng quay loading. Nếu xảy ra lỗi mạng sẽ hiển thị thông báo lỗi và nút **"Thử lại"**.
- **Xem ảnh toàn màn hình:** Nhấn vào ảnh bất kỳ trong cuộc trò chuyện để mở màn hình [ImageViewerScreen](file:///d:/TH_APP-21.10/src/screens/ImageViewerScreen.tsx) nền tối kèm nút đóng tiện lợi.
- **Xem trước tại màn hình Home:** Tin cuối là ảnh hiển thị `"📷 Hình ảnh"`, tin cuối là vị trí hiển thị `"📍 Vị trí"`.

#### 4. Trò chuyện nhóm (Group Chat - 2đ)
- **Màn hình Tạo nhóm** ([CreateGroupScreen](file:///d:/TH_APP-21.10/src/screens/CreateGroupScreen.tsx)): Ô nhập tên nhóm và danh sách thành viên từ Danh bạ có checkbox chọn nhiều người (ràng buộc tối thiểu 2 người ngoài bản thân mới cho phép tạo).
- **Giao diện phòng chat nhóm:** Tin nhắn của thành viên khác hiển thị rõ tên người gửi phía trên bong bóng. Thanh tiêu đề hiển thị tên nhóm và **số lượng thành viên đang online**.
- **Màn hình Home đa năng:** Danh sách hiển thị đồng thời cả chat 1-1 và chat nhóm, sắp xếp theo tương tác mới nhất. Mỗi thành viên có số tin chưa đọc riêng biệt.
- **Đầy đủ định dạng:** Phòng chat nhóm hỗ trợ tin văn bản, tin chia sẻ vị trí bản đồ và tin hình ảnh.

#### 5. Màn hình Thông báo dùng dữ liệu thật (1đ)
- **Ghi thông báo tự động vào `notifications/{uid}`:**
  1. Khi có tin nhắn mới mà người dùng đang không ở trong phòng chat đó.
  2. Khi người dùng được thêm vào một nhóm chat mới.
  3. Khi có người khác thả cảm xúc vào tin nhắn của mình.
- **Huy hiệu chưa đọc (Badge):** Tab Thông báo ở thanh điều hướng dưới chân màn hình có badge đỏ cập nhật số thông báo chưa đọc theo thời gian thực.
- **Điều hướng thông minh:** Chạm vào thông báo sẽ tự động đánh dấu đã đọc và mở đúng cuộc trò chuyện tương ứng (1-1 hoặc Nhóm).
- **Đánh dấu tất cả đã đọc:** Có nút `"Đọc tất cả"` ở góc trên màn hình thông báo.

---

### PHẦN B – YÊU CẦU KỸ THUẬT (Bắt buộc)
- **Atomic Multi-Path Update:** Ghi tin nhắn mới, cập nhật `lastMessage`, thời gian `updatedAt`, và tăng số chưa đọc cho mọi thành viên khác bằng `increment(1)` chỉ trong **1 lệnh `update(ref(db), updates)` duy nhất**.
- **Luật bảo mật (Security Rules) chặt chẽ:** Đã viết và triển khai trực tiếp lên Firebase Realtime Database:
  - Chỉ thành viên mới có quyền đọc và gửi tin nhắn trong cuộc trò chuyện.
  - Chỉ người gửi mới được quyền thu hồi tin nhắn của chính mình.
  - Mỗi người chỉ được ghi trạng thái đang gõ (`typing`) và cảm xúc (`reactions`) của chính bản thân.
- **Phân trang tin nhắn (Pagination):** Lần đầu mở chat tải 20 tin mới nhất (`limitToLast(20)`). Kéo lên đầu danh sách bấm tải thêm 20 tin cũ hơn bằng `endBefore()` mà danh sách không bị nhảy giật.
- **Kiến trúc dịch vụ sạch (Service Layer):** Toàn bộ mã Firebase và Cloudinary được đóng gói vào thư mục `src/services/`.
- **Hủy Listener (Memory Leak Prevention):** Toàn bộ listener `onValue` đều được dọn dẹp trong hàm cleanup `return () => unsub()` của `useEffect`.
- **Bảo mật Cloudinary:** Tuyệt đối không lưu API Secret trong ứng dụng client, chỉ sử dụng Unsigned Preset.

---

### PHẦN C – TÍNH NĂNG NÂNG CAO (+2 điểm)
1. **Quản trị nhóm** ([GroupSettingsScreen](file:///d:/TH_APP-21.10/src/screens/GroupSettingsScreen.tsx)): Đổi tên nhóm, thêm thành viên mới từ danh bạ, rời nhóm (tự động phát sinh tin hệ thống *"A đã rời khỏi nhóm"*).
2. **Trả lời tin nhắn cụ thể (Reply / Quote):** Trả lời tin nhắn kèm thanh trích dẫn; chạm vào phần trích dẫn sẽ tự động cuộn đến tin gốc.
3. **Hồ sơ cá nhân** ([SettingsScreen](file:///d:/TH_APP-21.10/src/screens/SettingsScreen.tsx)): Cho phép đổi họ tên hiển thị và cập nhật ảnh đại diện (chụp ảnh/chọn từ thư viện tải lên Cloudinary), tự động đồng bộ ảnh và tên mới ở Danh bạ, Home và Chat.
4. **Tìm kiếm nội dung tin nhắn trong cuộc trò chuyện:** Nút 🔍 trên thanh header của màn Chat giúp lọc nhanh các tin nhắn chứa từ khóa.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
src/
├── types/
│   ├── models.ts             # Kiểu dữ liệu AppUser, Message, Conversation, NotificationItem, Reaction
│   ├── navigation.ts         # Khai báo RootStackParamList, MainTabParamList & kiểu Screen Props
│   ├── firebase-auth.d.ts    # Module augmentation cho getReactNativePersistence
│   └── index.ts              # Re-export các kiểu dữ liệu
├── services/
│   ├── firebase.ts           # Cấu hình Firebase App, Auth và Realtime Database
│   ├── authService.ts        # Đăng ký, đăng nhập, đăng xuất, cập nhật hồ sơ cá nhân
│   ├── userService.ts        # Lắng nghe danh bạ người dùng, quản lý Presence (Online/Offline)
│   ├── chatService.ts        # Gửi tin nhắn (atomic update), thu hồi tin, thả cảm xúc, typing, readStatus
│   ├── groupService.ts       # Tạo nhóm, đổi tên nhóm, thêm thành viên, rời nhóm
│   ├── conversationService.ts# Lắng nghe danh sách cuộc trò chuyện thời gian thực
│   ├── uploadService.ts      # Tải ảnh lên Cloudinary qua REST API (Unsigned Preset)
│   └── notificationService.ts# Lắng nghe & cập nhật thông báo thời gian thực
├── navigation/
│   ├── AuthStack.tsx         # Stack Đăng nhập / Đăng ký
│   ├── MainTabs.tsx          # Tab Đoạn chat, Danh bạ, Thông báo (có badge), Cài đặt
│   └── RootNavigator.tsx     # Điều hướng gốc (chứa Main, Chat, CreateGroup, GroupSettings, ImageViewer)
├── screens/
│   ├── LoginScreen.tsx       # Màn hình Đăng nhập
│   ├── RegisterScreen.tsx    # Màn hình Đăng ký
│   ├── HomeScreen.tsx        # Danh sách cuộc trò chuyện (1-1 & nhóm), nút tạo nhóm
│   ├── ContactsScreen.tsx    # Danh bạ người dùng & tìm kiếm
│   ├── ChatScreen.tsx        # Màn hình Chat đa năng (Text, Image, Location, Reply, Recall, Reaction, Search)
│   ├── CreateGroupScreen.tsx # Màn hình Tạo nhóm chat mới
│   ├── GroupSettingsScreen.tsx# Quản trị nhóm (Đổi tên, Thêm người, Rời nhóm)
│   ├── ImageViewerScreen.tsx # Xem ảnh toàn màn hình
│   ├── NotificationsScreen.tsx# Danh sách thông báo thật (mở đúng cuộc trò chuyện khi chạm)
│   └── SettingsScreen.tsx    # Cập nhật hồ sơ cá nhân (họ tên, avatar) & Đăng xuất
├── components/
│   ├── Avatar.tsx            # Avatar tròn hiển thị ảnh hoặc chữ cái đầu kèm màu ngẫu nhiên
│   ├── OnlineDot.tsx         # Chấm trạng thái Online/Offline
│   ├── MessageBubble.tsx     # Bong bóng tin nhắn (Text, Image, Location, System, Recall, Reaction, Reply)
│   ├── MessageActionModal.tsx# Menu tương tác tin nhắn (Emoji picker, Reply, Copy, Recall)
│   ├── LocationBubble.tsx    # Bong bóng vị trí GPS (xem map thu nhỏ & mở Google Maps)
│   ├── ConversationItem.tsx  # Item cuộc trò chuyện ở màn Home (Badge unread, icon nhóm)
│   └── UserItem.tsx          # Item người dùng ở Danh bạ (hỗ trợ checkbox khi chọn tạo nhóm)
├── hooks/
│   ├── useAuth.ts            # Theo dõi phiên đăng nhập & kích hoạt Presence tự động
│   └── useLocationPermission.ts # Xin quyền GPS & lấy tọa độ vị trí hiện tại
└── utils/
    ├── formatTime.ts         # Định dạng thời gian (HH:mm, Hôm qua, formatLastSeen)
    ├── validators.ts         # Kiểm tra tính hợp lệ email, mật khẩu
    └── removeVietnameseTones.ts # Chuẩn hóa tiếng Việt không dấu cho tìm kiếm
```

---

## ⚙️ Cấu Trúc Dữ Liệu Firebase Realtime Database

```
conversations/{convId}:
  { id, type: "direct" | "group", name, members: { [uid]: true }, createdBy, createdAt }

messages/{convId}/{msgId}:
  { id, convId, senderId, senderName, type: "text" | "image" | "location" | "system",
    text, imageUrl, latitude, longitude, createdAt, recalled: boolean,
    reactions: { [uid]: "❤️" }, replyTo: { id, senderName, text } }

userChats/{uid}/{convId}:
  { convId, type, name, lastMessage, lastMessageType, lastSenderId, updatedAt, unread, members }

typing/{convId}/{uid}:
  true | false

readStatus/{convId}/{uid}:
  timestamp (thời điểm đọc tin cuối)

notifications/{uid}/{id}:
  { id, type: "new_message" | "added_to_group" | "reaction",
    convId, fromUid, fromName, text, createdAt, read: boolean }
```

---

## 🔒 Luật Bảo Mật (Database Security Rules)

File [database.rules.json](file:///d:/TH_APP-21.10/database.rules.json) đã được cấu hình và triển khai trực tiếp:

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "conversations": {
      "$convId": {
        ".read": "auth != null && (data.child('members/' + auth.uid).exists() || !data.exists() || $convId.contains(auth.uid))",
        ".write": "auth != null && (!data.exists() || data.child('members/' + auth.uid).exists() || data.child('createdBy').val() === auth.uid || $convId.contains(auth.uid))"
      }
    },
    "messages": {
      "$convId": {
        ".read": "auth != null && (root.child('conversations/' + $convId + '/members/' + auth.uid).exists() || $convId.contains(auth.uid))",
        "$msgId": {
          ".write": "auth != null && (root.child('conversations/' + $convId + '/members/' + auth.uid).exists() || !root.child('conversations/' + $convId).exists() || $convId.contains(auth.uid)) && ((!data.exists() && (newData.child('senderId').val() === auth.uid || newData.child('senderName').val() === 'Hệ thống')) || (data.exists() && data.child('senderId').val() === auth.uid))",
          "reactions": {
            "$reactionUid": {
              ".write": "auth != null && auth.uid === $reactionUid && (root.child('conversations/' + $convId + '/members/' + auth.uid).exists() || $convId.contains(auth.uid))"
            }
          }
        }
      }
    },
    "userChats": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        "$convId": {
          ".write": "auth != null && (auth.uid === $uid || root.child('conversations/' + $convId + '/members/' + auth.uid).exists() || !root.child('conversations/' + $convId).exists() || $convId.contains(auth.uid))"
        }
      }
    },
    "typing": {
      "$convId": {
        ".read": "auth != null && (root.child('conversations/' + $convId + '/members/' + auth.uid).exists() || $convId.contains(auth.uid))",
        "$uid": {
          ".write": "auth != null && auth.uid === $uid"
        }
      }
    },
    "readStatus": {
      "$convId": {
        ".read": "auth != null && (root.child('conversations/' + $convId + '/members/' + auth.uid).exists() || $convId.contains(auth.uid))",
        "$uid": {
          ".write": "auth != null && auth.uid === $uid"
        }
      }
    },
    "notifications": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        "$notiId": {
          ".write": "auth != null"
        }
      }
    }
  }
}
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Cấu hình Cloudinary (Tùy chọn)
Trong [src/services/uploadService.ts](file:///d:/TH_APP-21.10/src/services/uploadService.ts), điền thông tin Unsigned Preset của bạn:
```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: 'dphamchat',         // Thay bằng Cloud Name của bạn
  uploadPreset: 'chat_unsigned',   // Thay bằng Unsigned Upload Preset của bạn
};
```

### 3. Khởi chạy Metro Bundler
```bash
npm start
# Hoặc xóa cache sạch sẽ:
npm start -- --reset-cache
```

### 4. Chạy ứng dụng trên Android
Khởi động máy ảo Android hoặc cắm điện thoại thật (bật USB Debugging), sau đó chạy:
```bash
npm run android
```

### 5. Kiểm tra tính tương thích TypeScript
Dự án không có bất kỳ lỗi biên dịch nào (`strict: true`):
```bash
npx tsc --noEmit
```
*(Kết quả: Exit code 0, không có lỗi).*
