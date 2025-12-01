import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserElders } from '@/services/userService';
import { updateElder } from '@/services/elderService';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 14;
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -8;

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Edit Elder Profile Screen
// ==========================================
export default function EditElderInfo() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());

  // Date parts for manual input
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [diseases, setDiseases] = useState('');
  const [notes, setNotes] = useState('');

  // Focus State
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [heightFocused, setHeightFocused] = useState(false);
  const [weightFocused, setWeightFocused] = useState(false);
  const [diseasesFocused, setDiseasesFocused] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);

  // Animation Hooks
  const useInputAnimation = (focused: boolean, value: string) => {
    const progress = useDerivedValue(
      () => withTiming(focused || !!value ? 1 : 0, { duration: 200 }),
      [focused, value]
    );

    const containerStyle = useAnimatedStyle(() => ({
      top: interpolate(progress.value, [0, 1], [LABEL_TOP_START, LABEL_TOP_END]),
      backgroundColor: progress.value > 0.5 ? '#FFFFFF' : 'transparent',
      paddingHorizontal: 4,
      zIndex: 1,
    }));

    const textStyle = useAnimatedStyle(() => ({
      fontSize: interpolate(progress.value, [0, 1], [LABEL_FONT_LARGE, LABEL_FONT_SMALL]),
      color: focused ? '#16AD78' : '#9CA3AF',
    }));

    return { containerStyle, textStyle };
  };

  const firstNameAnim = useInputAnimation(firstNameFocused, firstName);
  const lastNameAnim = useInputAnimation(lastNameFocused, lastName);
  const heightAnim = useInputAnimation(heightFocused, height);
  const weightAnim = useInputAnimation(weightFocused, weight);
  const diseasesAnim = useInputAnimation(diseasesFocused, diseases);
  const notesAnim = useInputAnimation(notesFocused, notes);

  // ==========================================
  // ⚙️ LAYER: Logic (Data Fetching)
  // Purpose: Fetch current elder data
  // ==========================================
  const { data: elder, isLoading: isFetching } = useQuery({
    queryKey: ['userElders'],
    queryFn: async () => {
      const elders = await getUserElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
  });

  // ==========================================
  // 🧩 LAYER: Logic (Side Effects)
  // Purpose: Populate form when data is loaded
  // ==========================================
  useEffect(() => {
    if (elder) {
      setFirstName(elder.firstName || '');
      setLastName(elder.lastName || '');
      setGender(elder.gender as 'MALE' | 'FEMALE' | 'OTHER' || 'MALE');

      if (elder.dateOfBirth) {
        const date = new Date(elder.dateOfBirth);
        setDateOfBirth(date);
        setDay(date.getDate().toString());
        setMonth((date.getMonth() + 1).toString());
        setYear((date.getFullYear() + 543).toString());
      }

      setHeight(elder.height ? elder.height.toString() : '');
      setWeight(elder.weight ? elder.weight.toString() : '');
      setDiseases(elder.diseases ? elder.diseases.join(', ') : '');
      setNotes(elder.notes || '');
    }
  }, [elder]);

  // Logic to update Date object when inputs change
  useEffect(() => {
    if (day && month && year) {
      const yearAD = parseInt(year) - 543;
      const date = new Date(yearAD, parseInt(month) - 1, parseInt(day));
      setDateOfBirth(date);
    }
  }, [day, month, year]);

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Update elder profile
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!elder?.id) throw new Error('No elder ID');
      return await updateElder(elder.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userElders'] });
      Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      console.error('Update failed:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อและนามสกุล');
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      dateOfBirth: dateOfBirth.toISOString(),
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      diseases: diseases ? diseases.split(',').map(d => d.trim()).filter(d => d) : [],
      notes: notes.trim() || undefined
    };

    updateMutation.mutate(payload);
  };

  if (isFetching) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#16AD78" />
      </SafeAreaView>
    );
  }

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render the form UI
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100 flex-row items-center justify-between bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600' }} className="text-gray-900">
          แก้ไขข้อมูลผู้สูงอายุ
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color="#16AD78" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '600' }} className="text-[#16AD78]">
              บันทึก
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View className="p-6">
            {/* Name Fields */}
            <View className="flex-row mb-6">
              <View className="flex-1 mr-2">
                <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                  <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, firstNameAnim.containerStyle]}>
                    <Animated.Text className="font-kanit" style={[firstNameAnim.textStyle]}>ชื่อ</Animated.Text>
                  </Animated.View>
                  <TextInput
                    className={`font-kanit h-[60px] rounded-2xl px-4 border ${firstNameFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                    style={{
                      fontFamily: 'Kanit',
                      height: 60,
                      paddingTop: 18,
                      paddingBottom: 18,
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    }}
                    placeholderTextColor="#9CA3AF"
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setFirstNameFocused(true)}
                    onBlur={() => setFirstNameFocused(false)}
                  />
                </View>
              </View>
              <View className="flex-1 ml-2">
                <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                  <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, lastNameAnim.containerStyle]}>
                    <Animated.Text className="font-kanit" style={[lastNameAnim.textStyle]}>นามสกุล</Animated.Text>
                  </Animated.View>
                  <TextInput
                    className={`font-kanit h-[60px] rounded-2xl px-4 border ${lastNameFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                    style={{
                      fontFamily: 'Kanit',
                      height: 60,
                      paddingTop: 18,
                      paddingBottom: 18,
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    }}
                    placeholderTextColor="#9CA3AF"
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setLastNameFocused(true)}
                    onBlur={() => setLastNameFocused(false)}
                  />
                </View>
              </View>
            </View>

            {/* Gender Selection */}
            <View className="mb-6">
              <Text style={{ fontSize: 14 }} className="font-kanit text-gray-700 mb-2">
                เพศ <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row space-x-2">
                {[
                  { label: 'ชาย', value: 'MALE' },
                  { label: 'หญิง', value: 'FEMALE' },
                  { label: 'อื่นๆ', value: 'OTHER' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setGender(option.value as any)}
                    className={`flex-1 rounded-2xl py-3 border-2 mx-1 ${gender === option.value
                      ? 'bg-green-50 border-[#16AD78]'
                      : 'bg-white border-gray-200'
                      }`}
                  >
                    <Text
                      className={`font-kanit text-center font-medium ${gender === option.value ? 'text-[#16AD78]' : 'text-gray-600'
                        }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date of Birth (Manual Input) */}
            <View className="mb-6">
              <Text style={{ fontSize: 14 }} className="font-kanit text-gray-700 mb-2">
                วัน/เดือน/ปีเกิด
              </Text>
              <View className="flex-row space-x-2">
                <TextInput
                  className="font-kanit bg-white rounded-2xl px-4 text-gray-900 border border-gray-200 flex-1 mr-2"
                  style={{ height: 60, paddingTop: 18, paddingBottom: 18, textAlignVertical: 'center', includeFontPadding: false }}
                  placeholder="วัน"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={2}
                  value={day}
                  onChangeText={setDay}
                />
                <TextInput
                  className="font-kanit bg-white rounded-2xl px-4 text-gray-900 border border-gray-200 flex-1 mx-2"
                  style={{ height: 60, paddingTop: 18, paddingBottom: 18, textAlignVertical: 'center', includeFontPadding: false }}
                  placeholder="เดือน"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={2}
                  value={month}
                  onChangeText={setMonth}
                />
                <TextInput
                  className="font-kanit bg-white rounded-2xl px-4 text-gray-900 border border-gray-200 flex-1 ml-2"
                  style={{ height: 60, paddingTop: 18, paddingBottom: 18, textAlignVertical: 'center', includeFontPadding: false }}
                  placeholder="ปี พ.ศ."
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={4}
                  value={year}
                  onChangeText={setYear}
                />
              </View>
            </View>

            {/* Height & Weight */}
            <View className="flex-row mb-6">
              <View className="flex-1 mr-2">
                <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                  <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, heightAnim.containerStyle]}>
                    <Animated.Text className="font-kanit" style={[heightAnim.textStyle]}>ส่วนสูง (cm)</Animated.Text>
                  </Animated.View>
                  <TextInput
                    className={`font-kanit h-[60px] rounded-2xl px-4 border ${heightFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                    style={{
                      fontFamily: 'Kanit',
                      height: 60,
                      paddingTop: 18,
                      paddingBottom: 18,
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    }}
                    placeholderTextColor="#9CA3AF"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    onFocus={() => setHeightFocused(true)}
                    onBlur={() => setHeightFocused(false)}
                  />
                </View>
              </View>
              <View className="flex-1 ml-2">
                <View style={{ height: INPUT_HEIGHT, position: 'relative' }}>
                  <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, weightAnim.containerStyle]}>
                    <Animated.Text className="font-kanit" style={[weightAnim.textStyle]}>น้ำหนัก (kg)</Animated.Text>
                  </Animated.View>
                  <TextInput
                    className={`font-kanit h-[60px] rounded-2xl px-4 border ${weightFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                    style={{
                      fontFamily: 'Kanit',
                      height: 60,
                      paddingTop: 18,
                      paddingBottom: 18,
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    }}
                    placeholderTextColor="#9CA3AF"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    onFocus={() => setWeightFocused(true)}
                    onBlur={() => setWeightFocused(false)}
                  />
                </View>
              </View>
            </View>

            {/* Diseases */}
            <View className="mb-6">
              <View style={{ minHeight: 100, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, diseasesAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[diseasesAnim.textStyle]}>โรคประจำตัว หรือ เคยป่วย (ถ้ามี)</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit rounded-2xl px-4 py-3 border ${diseasesFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    minHeight: 100,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'top',
                    includeFontPadding: false,
                  }}
                  placeholderTextColor="#9CA3AF"
                  value={diseases}
                  onChangeText={setDiseases}
                  multiline
                  numberOfLines={2}
                  onFocus={() => setDiseasesFocused(true)}
                  onBlur={() => setDiseasesFocused(false)}
                />
              </View>
              <Text style={{ fontSize: 12 }} className="font-kanit text-gray-500 mt-1">
                หากมีหลายโรค ให้คั่นด้วยเครื่องหมายจุลภาค (,)
              </Text>
            </View>

            {/* Notes */}
            <View className="mb-6">
              <View style={{ minHeight: 100, position: 'relative' }}>
                <Animated.View style={[{ position: 'absolute', left: 16, zIndex: 1 }, notesAnim.containerStyle]}>
                  <Animated.Text className="font-kanit" style={[notesAnim.textStyle]}>ที่อยู่ / หมายเหตุ</Animated.Text>
                </Animated.View>
                <TextInput
                  className={`font-kanit rounded-2xl px-4 py-3 border ${notesFocused ? 'border-[#16AD78]' : 'border-gray-200'} bg-white text-gray-900 text-[16px]`}
                  style={{
                    fontFamily: 'Kanit',
                    minHeight: 100,
                    paddingTop: 18,
                    paddingBottom: 18,
                    textAlignVertical: 'top',
                    includeFontPadding: false,
                  }}
                  placeholderTextColor="#9CA3AF"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  onFocus={() => setNotesFocused(true)}
                  onBlur={() => setNotesFocused(false)}
                />
              </View>
            </View>

            {/* Info Text */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 flex-row">
              <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
              <Text style={{ fontSize: 12 }} className="font-kanit text-blue-700 flex-1 ml-2">
                เพื่อให้เป็นข้อมูลส่วนตัวของคุณในการติดตามผู้สูงอายุและเพิ่มความปลอดภัย
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={updateMutation.isPending}
              className="bg-[#16AD78] rounded-2xl py-4 items-center mb-6"
              style={{ opacity: updateMutation.isPending ? 0.6 : 1 }}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600' }} className="font-kanit text-white">
                  บันทึกข้อมูล
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
