import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TouchableHighlight, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { getProfile, updateProfile, deleteAccount, getUserElders } from '@/services/userService';
import Logger from '@/utils/logger';
import * as ImagePicker from 'expo-image-picker';
import { ProfileSkeleton } from '@/components/skeletons';
import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Bounceable } from '@/components/Bounceable';

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: User Profile Screen
// ==========================================
export default function Profile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch user profile
  // ==========================================
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
  });

  // Fetch Current Elder Access Level
  const { data: elders } = useQuery({
    queryKey: ['userElders'],
    queryFn: getUserElders,
  });
  const currentElder = elders?.[0];
  const isOwner = currentElder?.accessLevel === 'OWNER' || currentElder?.accessLevel === 'EDITOR';

  // Reset error state when profile image changes
  React.useEffect(() => {
    setImageError(false);
  }, [profile?.profileImage]);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutations)
  // Purpose: Update profile image
  // ==========================================
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      // Alert.alert('สำเร็จ', 'อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว');
    },
    onError: (error) => {
      Logger.error('Error updating profile image:', error);
      // Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตรูปโปรไฟล์ได้');
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle profile image change
  // ==========================================
  const handleChangeProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ขออนุญาต', 'กรุณาอนุญาตให้เข้าถึงคลังรูปภาพ');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Optimize size
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        try {
          const asset = result.assets[0];

          if (!asset.base64) {
            throw new Error('Could not get image data');
          }

          // Create Base64 string
          const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
          const base64Image = `data:${mimeType};base64,${asset.base64}`;

          // Upload to Backend
          // Note: We do NOT log the base64 string to keep terminal clean
          Logger.info('Uploading profile image (Base64)...');
          await updateProfileMutation.mutateAsync({ profileImage: base64Image });

        } catch (error) {
          Logger.error('Error uploading image:', error);
          Alert.alert('ผิดพลาด', 'ไม่สามารถอัปโหลดรูปภาพได้');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      Logger.error('Error picking image:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
        <View className="flex-1 justify-center items-center px-6">
          <MaterialIcons name="account-circle" size={64} color="#D1D5DB" />
          <Text style={{ fontSize: 18 }} className="font-kanit text-gray-700 mt-4 text-center">
            ไม่พบข้อมูลโปรไฟล์
          </Text>
          <TouchableHighlight
            onPress={() => refetch()}
            className="mt-4 p-3 rounded-lg"
            underlayColor="#E5E7EB"
            style={{ backgroundColor: "#E5E7EB" }}
          >
            <Text className="font-kanit">ลองใหม่</Text>
          </TouchableHighlight>
        </View>
      </SafeAreaView>
    );
  }



  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render profile details
  // ==========================================
  return (
    <ScreenWrapper edges={['top', 'left', 'right']} useScrollView={false}>
      {/* Header */}
      <ScreenHeader title="ข้อมูลส่วนตัว" onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#16AD78']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture - Tappable */}
        <View className="items-center mb-8 mt-4">
          <Bounceable
            onPress={handleChangeProfileImage}
            disabled={uploading}
            className="relative"
            scale={0.9}
          >
            <View className="w-28 h-28 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
              {uploading ? (
                <ActivityIndicator size="large" color="#16AD78" />
              ) : profile.profileImage && !imageError ? (
                <Image
                  key={profile.profileImage} // Force re-render when URL changes
                  source={{ uri: profile.profileImage }}
                  className="w-full h-full"
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={200}
                  onError={(e: any) => {
                    Logger.error('Image Load Error:', e.nativeEvent.error);
                    setImageError(true);
                  }}
                />
              ) : (
                <MaterialIcons name="person" size={56} color="#9CA3AF" />
              )}
            </View>
            {/* Camera icon overlay */}
            <View className="absolute bottom-0 right-0 bg-[#16AD78] w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <MaterialIcons name="photo-camera" size={18} color="white" />
            </View>
          </Bounceable>
        </View>

        {/* Profile Fields - Box with Border */}
        <View className="bg-white rounded-[24px] shadow-lg shadow-black/15 android:elevation-10 mb-4">
          <View className="rounded-[24px] overflow-hidden border border-gray-100">
            {/* Name & Gender Group */}
            <TouchableHighlight
              onPress={() => router.push('/(features)/(user)/(profile)/edit-info')}
              className="border-b border-gray-100"
              underlayColor="#E5E7EB"
              style={{ backgroundColor: 'white' }}
            >
              <View className="flex-row items-center justify-between p-5">
                <View className="flex-1">
                  {/* Name */}
                  <View className="mb-3">
                    <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                      ชื่อ-นามสกุล
                    </Text>
                    <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </Text>
                  </View>

                  {/* Gender */}
                  <View>
                    <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                      เพศ
                    </Text>
                    <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                      {profile.gender === 'MALE'
                        ? 'ชาย'
                        : profile.gender === 'FEMALE'
                          ? 'หญิง'
                          : profile.gender === 'OTHER'
                            ? 'อื่นๆ'
                            : 'ไม่ระบุ'}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-gray-400">
                  แก้ไข
                </Text>
              </View>
            </TouchableHighlight>

            {/* Phone */}
            <TouchableHighlight
              onPress={() => router.push('/(features)/(user)/(profile)/edit-phone')}
              className="border-b border-gray-100"
              underlayColor="#E5E7EB"
              style={{ backgroundColor: 'white' }}
            >
              <View className="flex-row items-center justify-between p-5">
                <View className="flex-1">
                  <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                    เบอร์โทรศัพท์
                  </Text>
                  <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                    {profile.phone || 'ไม่ระบุ'}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-gray-400">
                  แก้ไข
                </Text>
              </View>
            </TouchableHighlight>

            {/* Email */}
            <TouchableHighlight
              onPress={() => router.push('/(features)/(user)/(profile)/change-email')}
              className="border-b border-gray-100"
              underlayColor="#E5E7EB"
              style={{ backgroundColor: 'white' }}
            >
              <View className="flex-row items-center justify-between p-5">
                <View className="flex-1">
                  <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                    อีเมล
                  </Text>
                  <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                    {profile.email}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-gray-400">
                  แก้ไข
                </Text>
              </View>
            </TouchableHighlight>

            {/* Password */}
            <TouchableHighlight
              onPress={() => router.push('/(features)/(user)/(profile)/change-password')}
              className={isOwner ? "border-b border-gray-100" : ""}
              underlayColor="#E5E7EB"
              style={{ backgroundColor: 'white' }}
            >
              <View className="flex-row items-center justify-between p-5">
                <View className="flex-1">
                  <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                    รหัสผ่าน
                  </Text>
                  <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                    ••••••••
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="font-kanit text-gray-400">
                  เปลี่ยน
                </Text>
              </View>
            </TouchableHighlight>

            {/* Emergency Contacts - Only for Owner */}
            {isOwner && (
              <TouchableHighlight
                onPress={() => router.push('/(features)/(emergency)')}
                underlayColor="#E5E7EB"
                style={{ backgroundColor: 'white' }}
              >
                <View className="flex-row items-center justify-between p-5">
                  <View className="flex-1">
                    <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mb-1">
                      ผู้ติดต่อฉุกเฉิน
                    </Text>
                    <Text style={{ fontSize: 16 }} className="font-kanit text-gray-900">
                      จัดการรายชื่อ
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
                </View>
              </TouchableHighlight>
            )}
          </View>
        </View>

        {/* Role Badge */}
        <View className="bg-blue-50 rounded-2xl p-4 flex-row items-center mb-6">
          <MaterialIcons name="verified-user" size={20} color="#3B82F6" />
          <Text style={{ fontSize: 14 }} className="font-kanit text-blue-700 ml-2">
            บทบาท: {currentElder ? (currentElder.accessLevel === 'OWNER' ? 'ญาติผู้ดูแลหลัก' : 'ญาติผู้ดูแลเสริม') : (profile.role === 'CAREGIVER' ? 'ญาติผู้ดูแล' : profile.role)}
          </Text>
        </View>

        {/* Delete Account Button */}
        <PrimaryButton
          title="ลบบัญชีถาวร"
          variant="danger"
          onPress={() => {
            Alert.alert(
              'ยืนยันการลบบัญชี',
              'คุณแน่ใจหรือไม่ที่จะลบบัญชีถาวร? การกระทำนี้ไม่สามารถย้อนกลับได้',
              [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                  text: 'ยืนยันอีกครั้ง',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert(
                      'คำเตือนสุดท้าย',
                      'ข้อมูลทั้งหมดของคุณจะถูกลบถาวร รวมถึงข้อมูลผู้สูงอายุที่คุณดูแล คุณต้องการดำเนินการต่อหรือไม่?',
                      [
                        { text: 'ยกเลิก', style: 'cancel' },
                        {
                          text: 'ลบบัญชีถาวร',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await deleteAccount();
                              await SecureStore.deleteItemAsync('token');
                              queryClient.clear();
                              router.replace('/(auth)/login');
                              Alert.alert('สำเร็จ', 'ลบบัญชีเรียบร้อยแล้ว');
                            } catch (error: any) {
                              Alert.alert('ผิดพลาด', error.message || 'ไม่สามารถลบบัญชีได้');
                            }
                          },
                        },
                      ]
                    );
                  },
                },
              ]
            );
          }}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
