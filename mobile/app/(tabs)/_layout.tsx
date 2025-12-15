import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bounceable } from '@/components/Bounceable';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, descriptors, navigation }) => {
        return (
          <View className="bg-white border-t border-gray-200">
            <SafeAreaView edges={['bottom', 'left', 'right']}>
              {/* ✅ ปรับความสูงลดลง: h-20 -> h-16 (64px) 
                  เพื่อให้ขอบด้านบนขยับลงมา ดูไม่เทอะทะ
              */}
              <View className="flex-row h-17 items-center justify-around px-2">
                {state.routes.map((route, index) => {
                  const { options } = descriptors[route.key];
                  const label =
                    options.tabBarLabel !== undefined
                      ? options.tabBarLabel
                      : options.title !== undefined
                        ? options.title
                        : route.name;

                  const isFocused = state.index === index;

                  const onPress = () => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name, route.params);
                    }
                  };

                  const onLongPress = () => {
                    navigation.emit({
                      type: 'tabLongPress',
                      target: route.key,
                    });
                  };

                  return (
                    <Bounceable
                      key={index}
                      accessibilityRole="button"
                      accessibilityState={isFocused ? { selected: true } : {}}
                      accessibilityLabel={options.tabBarAccessibilityLabel}
                      testID={options.tabBarButtonTestID}
                      onPress={onPress}
                      onLongPress={onLongPress}
                      className="flex-1 items-center justify-center pt-2"
                      scale={0.9}
                    >
                      {/* 💊 Pill Shape
                          - ปรับความสูง: h-8 -> h-9 (36px) เพื่อรองรับไอคอนที่ใหญ่ขึ้น
                          - ปรับความกว้าง: w-16 -> w-14 (56px) ให้ดูกระชับขึ้นเล็กน้อย
                      */}
                      <View
                        className={`h-9 w-14 items-center justify-center rounded-full mb-1 ${
                          isFocused ? 'bg-[#E3F9F1]' : 'bg-transparent'
                        }`}
                      >
                        {options.tabBarIcon &&
                          options.tabBarIcon({
                            focused: isFocused,
                            color: isFocused ? '#16AD78' : '#9CA3AF',
                            size: 28, // ✅ ปรับขนาดไอคอนให้ใหญ่ขึ้น: 24 -> 28
                          })}
                      </View>

                      <Text
                        className={`text-[10px] font-kanit font-medium pb-1 ${
                          isFocused ? 'text-[#16AD78] font-bold' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {label as string}
                      </Text>
                    </Bounceable>
                  );
                })}
              </View>
            </SafeAreaView>
          </View>
        );
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'หน้าหลัก',
          tabBarLabel: 'หน้าหลัก',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'ประวัติ',
          tabBarLabel: 'ประวัติ',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'ตั้งค่า',
          tabBarLabel: 'ตั้งค่า',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
