import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { ref, set, update, serverTimestamp } from 'firebase/database';
import { auth, db } from './firebase';

// Đăng ký tài khoản mới và lưu thông tin người dùng vào Realtime Database
export async function register(
  name: string,
  email: string,
  pass: string
): Promise<User> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  // 1. Tạo tài khoản trên Firebase Authentication
  const credential = await createUserWithEmailAndPassword(
    auth,
    trimmedEmail,
    pass
  );

  const user = credential.user;

  // 2. Cập nhật tên hiển thị trong Auth Profile
  await updateProfile(user, { displayName: trimmedName });

  // 3. Ghi dữ liệu vào Realtime Database /users/{uid}
  try {
    await set(ref(db, `users/${user.uid}`), {
      uid: user.uid,
      name: trimmedName,
      email: trimmedEmail,
      online: true,
      lastSeen: serverTimestamp(),
    });
  } catch (dbError) {
    console.warn('Lỗi ghi thông tin người dùng vào Realtime Database:', dbError);
    // Không ném lỗi ra ngoài vì tài khoản Auth đã được tạo thành công
  }

  return user;
}

// Đăng nhập tài khoản
export async function login(email: string, pass: string): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email.trim(), pass);
}

// Đăng xuất: đặt online = false trước khi signOut
export async function logout(): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (currentUid) {
    try {
      await update(ref(db, `users/${currentUid}`), {
        online: false,
        lastSeen: serverTimestamp(),
      });
    } catch {
      // Bỏ qua lỗi mạng nếu có để tiếp tục signOut
    }
  }
  await signOut(auth);
}

// Lắng nghe thay đổi trạng thái phiên đăng nhập
export function subscribeAuth(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

// Lấy thông tin user hiện tại
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Chuyển mã lỗi Firebase thành thông báo tiếng Việt
export function getAuthErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const errCode = (error as { code: string }).code;
    switch (errCode) {
      case 'auth/invalid-credential':
        return 'Email hoặc mật khẩu không chính xác.';
      case 'auth/user-not-found':
        return 'Tài khoản không tồn tại trên hệ thống.';
      case 'auth/wrong-password':
        return 'Mật khẩu không chính xác.';
      case 'auth/email-already-in-use':
        return 'Email này đã được sử dụng bởi tài khoản khác.';
      case 'auth/invalid-email':
        return 'Địa chỉ email không đúng định dạng.';
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu (yêu cầu tối thiểu 6 ký tự).';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng, vui lòng kiểm tra Internet.';
      case 'auth/too-many-requests':
        return 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.';
      default:
        return `Đã xảy ra lỗi (${errCode}). Vui lòng thử lại.`;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
}
