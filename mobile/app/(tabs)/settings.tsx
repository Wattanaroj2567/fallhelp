import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Settings Screen
// ==========================================
export default function SettingsScreen() {
  const router = useRouter();

  // ==========================================
  // ⚙️ LAYER: Logic (Context)
  // Purpose: Use global auth context
  // ==========================================
  const { signOut } = useAuth(); // <--- Use context

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Handle logout
  // ==========================================
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut(); // <--- Update state globally
    },
    // onSuccess is handled by AuthProvider's effect, redirecting automatically
    onError: () => {
      Alert.alert("ผิดพลาด", "ไม่สามารถออกจากระบบได้");
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle user actions
  // ==========================================
  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "ยืนยันการออกจากระบบของคุณหรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ใช่",
        style: "destructive",
        onPress: () => logoutMutation.mutate(),
      },
    ]);
  };

  const MenuItem = ({
    icon,
    title,
    onPress,
    isLast = false,
    isDanger = false,
  }: {
    icon: React.ComponentProps<typeof MaterialIcons>["name"];
    title: string;
    onPress: () => void;
    isLast?: boolean;
    isDanger?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between p-5 ${!isLast ? "border-b border-gray-100" : ""
        }`}
      activeOpacity={0.6}
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${isDanger ? "bg-red-50" : "bg-gray-50"
            }`}
        >
          <MaterialIcons
            name={icon}
            size={22}
            color={isDanger ? "#EF4444" : "#6B7280"}
          />
        </View>
        <Text
          style={{ fontSize: 16, fontWeight: "500" }}
          className={`font-kanit ml-3 ${isDanger ? "text-red-500" : "text-gray-900"
            }`}
        >
          {title}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render settings menu
  // ==========================================
  return (
    <ScreenWrapper
      edges={["top"]}
      useScrollView={false}
      style={{ backgroundColor: "#FFFFFF" }}
      header={<ScreenHeader title="ตั้งค่า" />}
    >
      <View className="flex-1 px-4 pt-4">
        {/* Settings Section */}
        <View className="bg-white rounded-3xl border border-gray-200 mx-6 mt-4 overflow-hidden">

          <MenuItem
            icon="people"
            title="จัดการสมาชิก"
            onPress={() => router.push("/(features)/(user)/members" as any)}
          />
          <MenuItem
            icon="chat-bubble"
            title="ส่งความคิดเห็น / แจ้งปัญหา"
            onPress={() => router.push("/(features)/(user)/feedback" as any)}
          />
          <MenuItem
            icon="logout"
            title="ออกจากระบบ"
            onPress={handleLogout}
            isLast={true}
            isDanger={true}
          />
        </View>

        {/* App Info */}
        <View className="mt-8 px-6 items-center">
          <View className="bg-gray-50 rounded-2xl py-4 px-6 items-center">
            <Text
              style={{ fontSize: 13, fontWeight: "600" }}
              className="font-kanit text-gray-700"
            >
              FallHelp v1.0.0
            </Text>
            <Text
              style={{ fontSize: 11 }}
              className="font-kanit text-gray-500 mt-1"
            >
              © 2025 Fall Detection System
            </Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
