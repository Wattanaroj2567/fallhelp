import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listContacts } from "@/services/emergencyContactService";
import { useCurrentElder } from "@/hooks/useCurrentElder";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import Logger from "@/utils/logger";

export default function EmergencyCallScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch Current Elder (Centralized Hook)
  const { data: currentElder, isLoading: isEldersLoading } = useCurrentElder();

  const currentElderId = currentElder?.id;
  const isOwner = currentElder?.accessLevel === 'OWNER' || currentElder?.accessLevel === 'EDITOR';

  // Fetch Contacts
  const { data: contacts, isLoading: isContactsLoading, refetch: refetchContacts } = useQuery({
    queryKey: ["emergencyContacts", currentElderId],
    queryFn: () => listContacts(currentElderId!),
    enabled: !!currentElderId,
  });

  useFocusEffect(
    useCallback(() => {
      if (currentElderId) {
        refetchContacts();
      }
      // Also ensure permissions are up to date
      queryClient.invalidateQueries({ queryKey: ["userElders"] });
    }, [currentElderId, refetchContacts, queryClient])
  );

  const isLoading = isEldersLoading || (!!currentElderId && isContactsLoading);

  const topContacts = contacts ? contacts.slice(0, 3) : [];

  const handleCall = async (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("ไม่สามารถโทรออกได้", "อุปกรณ์นี้ไม่รองรับการโทรออก");
      }
    } catch (error) {
      Logger.error("Call error:", error);
      Alert.alert("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการโทรออก");
    }
  };

  return (
    <ScreenWrapper useScrollView={false}>
      <ScreenHeader
        title="โทรฉุกเฉิน"
        onBack={() => router.back()}
        rightElement={
          isOwner ? (
            <TouchableOpacity
              className="p-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => router.push("/(features)/(emergency)")}
              activeOpacity={0.8}
            >
              <MaterialIcons name="settings" size={24} color="#374151" />
            </TouchableOpacity>
          ) : (
            // Placeholder to prevent layout shift if loading or not owner
            <View style={{ width: 40 }} />
          )
        }
      />

      <View className="flex-1 px-5 pt-4 pb-2">
        {/* Info banner - Compact */}
        <View className="bg-red-50 px-4 py-3 rounded-xl mb-6 flex-row items-center gap-3 border border-red-100">
          <MaterialIcons name="info" size={20} color="#EF4444" />
          <Text className="flex-1 text-red-600 font-kanit text-sm leading-5">
            กดที่รายชื่อเพื่อโทรออกทันที
          </Text>
        </View>

        <Text className="text-lg font-bold text-gray-800 font-kanit mb-4">
          รายการผู้ติดต่อฉุกเฉิน
        </Text>

        <View className="flex-1 justify-center gap-5">
          {isLoading ? (
            <View className="items-center">
              <ActivityIndicator size="large" color="#16AD78" />
              <Text className="text-gray-400 font-kanit mt-3">กำลังโหลด...</Text>
            </View>
          ) : topContacts && topContacts.length > 0 ? (
            <>
              {topContacts.map((item, index) => (
                <View key={item.id} className="flex-1 max-h-28">
                  <TouchableOpacity
                    onPress={() => handleCall(item.phone)}
                    className="flex-1 bg-white px-5 rounded-2xl border border-gray-100 shadow-sm flex-row items-center justify-between active:bg-gray-50"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center border border-red-100">
                        <Text className="text-xl font-bold text-red-500 font-kanit">
                          {index + 1}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-lg font-bold text-gray-800 font-kanit">
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 font-kanit text-sm">
                          {item.relationship} • {item.phone}
                        </Text>
                      </View>
                    </View>
                    <View className="w-11 h-11 rounded-full bg-green-500 items-center justify-center shadow-sm">
                      <MaterialIcons name="phone" size={24} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
              {/* Fill remaining space if less than 3 contacts */}
              {[...Array(3 - topContacts.length)].map((_, i) => (
                <View key={`empty-${i}`} className="flex-1 max-h-28 opacity-0" />
              ))}
            </>
          ) : (
            <View className="items-center py-8">
              <MaterialIcons name="contact-phone" size={56} color="#E5E7EB" />
              <Text className="text-gray-500 font-kanit mt-3 text-center text-base">
                ไม่มีผู้ติดต่อฉุกเฉิน
              </Text>

              {/* Add Contact Button - Hide if Read Only */}
              {isOwner && (
                <TouchableOpacity
                  onPress={() => router.push("/(features)/(emergency)")}
                  className="mt-4 bg-blue-500 px-6 py-3 rounded-full"
                  activeOpacity={0.85}
                >
                  <Text className="text-white font-kanit text-base">
                    เพิ่มผู้ติดต่อ
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Emergency Services (1669 only) - Fixed Bottom */}
      <View className="bg-white border-t border-gray-100 p-5 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Text className="text-base font-bold text-gray-800 font-kanit mb-3">
          เบอร์โทรฉุกเฉินสาธารณะ
        </Text>
        <TouchableOpacity
          onPress={() => handleCall("1669")}
          className="bg-red-500 p-4 rounded-2xl shadow-md flex-row items-center justify-between active:bg-red-600"
          activeOpacity={0.85}
        >
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <MaterialIcons name="local-hospital" size={24} color="white" />
            </View>
            <View>
              <Text className="text-lg font-bold text-white font-kanit">
                1669
              </Text>
              <Text className="text-white/80 font-kanit text-xs">
                เจ็บป่วยฉุกเฉิน
              </Text>
            </View>
          </View>
          <MaterialIcons name="phone-in-talk" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
