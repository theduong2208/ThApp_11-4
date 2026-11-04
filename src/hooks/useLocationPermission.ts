import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function useLocationPermission() {
  // Xin quyền truy cập vị trí trên Android và iOS
  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí',
            message:
              'Ứng dụng cần quyền vị trí để gửi tọa độ của bạn cho bạn bè.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Lỗi xin quyền vị trí:', err);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      return new Promise<boolean>((resolve) => {
        Geolocation.requestAuthorization(
          () => resolve(true),
          (error) => {
            console.warn('Lỗi xin quyền iOS:', error);
            resolve(false);
          }
        );
      });
    }
    return true;
  };

  // Lấy tọa độ GPS hiện tại
  const getCurrentLocation = async (): Promise<Coordinates | null> => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert(
        'Từ chối quyền vị trí',
        'Vui lòng cấp quyền truy cập vị trí trong cài đặt thiết bị để gửi tọa độ.'
      );
      return null;
    }

    return new Promise<Coordinates | null>((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let message = 'Không thể lấy vị trí hiện tại.';
          if (error.code === 1) message = 'Bạn đã từ chối cấp quyền vị trí.';
          else if (error.code === 2) message = 'Không tìm thấy tín hiệu GPS.';
          else if (error.code === 3) message = 'Hết thời gian chờ lấy vị trí.';

          Alert.alert('Lỗi vị trí', message);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  return { requestPermission, getCurrentLocation };
}

