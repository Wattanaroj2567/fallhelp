/**
 * FormLayout.tsx
 *
 * คอมโพเนนต์เลย์เอาต์สำเร็จรูปสำหรับหน้าฟอร์มกรอกข้อมูล
 * ใช้เป็นมาตรฐานกลางทั่วทั้งแอปเพื่อให้พฤติกรรมหลบคีย์บอร์ดเสถียรและเหมือนกัน 100%
 */

import React from 'react';
import { type ViewStyle } from 'react-native';
import { type KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScreenWrapper } from './ScreenWrapper';
import { getFormBasePadding } from '../utils/navigationBarInset';

interface FormLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  paddingBottom?: number;
  extraScrollHeight?: number;
  contentContainerStyle?: ViewStyle;
  scrollViewProps?: React.ComponentProps<typeof KeyboardAwareScrollView>;
  scrollViewRef?: React.RefObject<KeyboardAwareScrollView | null>;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  header,
  paddingBottom,
  extraScrollHeight = 80,
  contentContainerStyle,
  scrollViewProps,
  scrollViewRef,
}) => {
  const { paddingBottom: contentPaddingBottom, ...restContentContainerStyle } =
    contentContainerStyle ?? {};

  /**
   * ฟอร์มยาวต้องกัน system navigation bar ที่ระดับ viewport ของ ScrollView
   * ไม่ใช่แค่ padding ท้าย content เพราะ Android edge-to-edge ยังให้ viewport ยาวลงหลังปุ่มระบบ
   */
  const finalPaddingBottom = getFormBasePadding({
    basePadding:
      paddingBottom ??
      (typeof contentPaddingBottom === 'number' ? contentPaddingBottom : undefined),
  });

  return (
    <ScreenWrapper
      useSafeArea={true}
      useScrollView={true}
      reserveBottomInset
      // เราจัดการระยะห่างด้านล่างเองผ่าน padding เพื่อความแม่นยำในทุกขนาดหน้าจอ
      edges={['top', 'left', 'right']}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingBottom: finalPaddingBottom,
        flexGrow: 1, // ช่วยให้เนื้อหาในหน้าจอที่ยาวสามารถกระจายตัวได้สวยงาม (เช่น ใช้ justify-between)
        ...restContentContainerStyle,
      }}
      scrollViewProps={{
        bounces: false,
        overScrollMode: 'never',
        showsVerticalScrollIndicator: true,
        keyboardShouldPersistTaps: 'handled',
        enableOnAndroid: true,
        enableAutomaticScroll: true,
        extraScrollHeight: extraScrollHeight,
        ...scrollViewProps,
      }}
      {...(scrollViewRef !== undefined ? { scrollViewRef } : {})}
      header={header}
    >
      {children}
    </ScreenWrapper>
  );
};
