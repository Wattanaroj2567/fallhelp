/**
 * AppScreenHeader.tsx
 *
 * Header กลางของแอปสำหรับแสดงชื่อหน้า ปุ่มย้อนกลับ และ action ด้านขวา
 *
 * สิ่งที่เกิดขึ้นในไฟล์นี้:
 * - จัดตำแหน่ง header ให้รองรับ safe area ด้านบน
 * - แสดงปุ่มย้อนกลับเมื่อมี onBack ส่งเข้ามา
 * - เปิดช่อง rightElement สำหรับปุ่มหรือเมนูของแต่ละหน้า
 * - รองรับ header แบบพื้นหลังปกติหรือโปร่งใส
 */

import React from 'react';
import { View, Keyboard } from 'react-native';
import { MaterialSymbol } from './MaterialSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KanitText from './KanitText';
import { Bounceable } from './Bounceable';

interface AppScreenHeaderProps {
  title: string;
  onBack?: (() => void) | undefined;
  rightElement?: React.ReactNode;
  transparent?: boolean;
  backgroundColor?: string;
  noSafeArea?: boolean;
  style?: object;
}

const HEADER_ROW_HEIGHT = 56;
const HEADER_ACTION_SIZE = 44;

export const AppScreenHeader: React.FC<AppScreenHeaderProps> = ({
  title,
  onBack,
  rightElement,
  transparent = false,
  backgroundColor,
  noSafeArea = false,
  style,
}) => {
  // ใช้ safe area เพื่อดัน header ไม่ให้ชนขอบจอบนหรือ notch
  const insets = useSafeAreaInsets();

  return (
    <View
      className={!noSafeArea ? 'rounded-b-[28px]' : ''}
      style={[
        {
          paddingTop: noSafeArea ? 0 : insets.top,
          backgroundColor:
            transparent && !noSafeArea
              ? 'rgba(0, 0, 0, 0.3)'
              : backgroundColor || (!noSafeArea ? 'white' : undefined),
        },
        style,
      ]}
    >
      {/* ใช้ระยะขอบแนวนอนเดียวกับหน้าจอหลัก เพื่อให้ title และ action จัดแนวตรงกัน */}
      <View
        className="flex-row items-center justify-between px-6"
        style={{ height: HEADER_ROW_HEIGHT }}
      >
        {onBack ? (
          <Bounceable
            testID="back-button"
            onPress={() => {
              Keyboard.dismiss();
              onBack();
            }}
            className="-ml-2 items-center justify-center"
            style={{ width: HEADER_ACTION_SIZE, height: HEADER_ACTION_SIZE }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            scale={0.9}
            debounceTime={0}
          >
            <MaterialSymbol name="arrow_back" size={28} color={transparent ? 'white' : '#374151'} />
          </Bounceable>
        ) : (
          <View style={{ width: HEADER_ACTION_SIZE, height: HEADER_ACTION_SIZE }} />
        )}

        <KanitText
          className={`text-xl ${transparent ? 'text-white' : 'text-gray-900'} text-center flex-1`}
          numberOfLines={1}
        >
          {title}
        </KanitText>

        {/* rightElement ใช้สำหรับ action เฉพาะหน้าจอ เช่น ปุ่มเพิ่มหรือปุ่มตั้งค่า */}
        {rightElement ? (
          <View
            className="flex-row items-center justify-center"
            style={{ minWidth: HEADER_ACTION_SIZE, minHeight: HEADER_ACTION_SIZE }}
          >
            {rightElement}
          </View>
        ) : (
          <View style={{ width: HEADER_ACTION_SIZE, height: HEADER_ACTION_SIZE }} />
        )}
      </View>
    </View>
  );
};
