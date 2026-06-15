import { Platform } from 'react-native';

type NavigationBarPlatform = typeof Platform.OS;

interface NavigationBarInsetInput {
  readonly platform: NavigationBarPlatform;
  readonly safeAreaBottom: number;
  readonly windowHeight: number;
  readonly screenHeight: number;
  readonly statusBarHeight: number;
  readonly assumeAndroidNavigationBarVisible?: boolean | undefined;
}

interface FormBottomPaddingInput {
  readonly basePadding?: number | undefined;
  readonly navBarInset?: number | undefined;
  readonly minimumBasePadding?: number | undefined;
}

const ANDROID_THREE_BUTTON_NAV_BAR_INSET = 48;

export const getNavigationBarInset = ({
  platform,
  safeAreaBottom,
  windowHeight,
  screenHeight,
  statusBarHeight,
  assumeAndroidNavigationBarVisible = true,
}: NavigationBarInsetInput): number => {
  if (safeAreaBottom > 0) {
    return safeAreaBottom;
  }

  if (platform !== 'android') {
    return 0;
  }

  // Android บาง dev build ไม่ส่ง bottom safe-area แม้ system navigation bar ยังใช้พื้นที่จออยู่
  const measuredInset = Math.max(0, screenHeight - windowHeight - statusBarHeight);

  if (measuredInset > 0) {
    return measuredInset;
  }

  /**
   * ใน Android edge-to-edge บางเครื่อง window height จะรวมพื้นที่ navigation bar
   * ทำให้สูตรวัด inset ได้ 0 ทั้งที่ three-button nav ยัง overlay อยู่ด้านล่าง
   */
  return assumeAndroidNavigationBarVisible ? ANDROID_THREE_BUTTON_NAV_BAR_INSET : 0;
};

export const getFormBasePadding = ({
  basePadding,
  minimumBasePadding = 32,
}: Omit<FormBottomPaddingInput, 'navBarInset'>): number =>
  typeof basePadding === 'number' ? Math.max(basePadding, minimumBasePadding) : minimumBasePadding;

export const getFormBottomPadding = ({
  basePadding,
  navBarInset = 0,
  minimumBasePadding,
}: FormBottomPaddingInput): number =>
  getFormBasePadding({ basePadding, minimumBasePadding }) + navBarInset;
