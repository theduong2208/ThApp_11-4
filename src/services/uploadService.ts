// Cấu hình Cloudinary (Dùng Unsigned Upload Preset - Không lưu API Secret trong mã nguồn)
export const CLOUDINARY_CONFIG = {
  cloudName: 'dmczxtz9x',
  uploadPreset: 'chat_unsigned',
};

export interface UploadResult {
  url: string;
  width?: number;
  height?: number;
}

// Tải ảnh lên Cloudinary qua REST API bằng Unsigned Preset
export async function uploadImageToCloudinary(
  imageUri: string,
  fileName?: string
): Promise<UploadResult> {
  const cleanName = fileName || `photo_${Date.now()}.jpg`;
  const extension = cleanName.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

  const data = new FormData();
  data.append('file', {
    uri: imageUri,
    type: mimeType,
    name: cleanName,
  } as unknown as Blob);
  data.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: data,
    });

    const result = (await response.json()) as {
      secure_url?: string;
      url?: string;
      width?: number;
      height?: number;
      error?: { message: string };
    };

    if (result.error) {
      throw new Error(result.error.message);
    }

    const secureUrl = result.secure_url || result.url;
    if (!secureUrl) {
      throw new Error('Không nhận được URL ảnh từ máy chủ Cloudinary.');
    }

    return {
      url: secureUrl,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.warn('Lỗi tải ảnh lên Cloudinary:', error);
    throw error;
  }
}

