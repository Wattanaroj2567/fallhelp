/**
 * useNavBarInset.ts
 *
 * Hook สำหรับคืนค่า bottom safe-area inset ให้ layout ที่จัดการขอบล่างเอง
 *
 * สิ่งที่เกิดขึ้นในไฟล์นี้:
 * - อ่านค่า bottom inset จาก safe area
 * - คืนค่าให้ screen หรือ component ใช้เพิ่ม padding ด้านล่างเอง
 * - ใช้กับ layout ที่ไม่ได้ให้ SafeAreaView จัดการ bottom edge โดยตรง
 */

import { Dimensions, Platform, StatusBar, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getNavigationBarInset } from '../utils/navigationBarInset';

interface UseNavBarInsetOptions {
  readonly assumeAndroidNavigationBarVisible?: boolean | undefined;
}

export const useNavBarInset = ({
  assumeAndroidNavigationBarVisible,
}: UseNavBarInsetOptions = {}): number => {
  // ใช้ในหน้าที่ต้องจัด padding bottom เอง เช่น camera, tab bar หรือ layout เฉพาะทาง
  const { bottom } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const screenHeight = Dimensions.get('screen').height;
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return getNavigationBarInset({
    platform: Platform.OS,
    safeAreaBottom: bottom,
    windowHeight,
    screenHeight,
    statusBarHeight,
    assumeAndroidNavigationBarVisible,
  });
};
