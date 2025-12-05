import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRootNavigationState, Redirect } from "expo-router";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  color: string;
}) {
  return <MaterialIcons size={26} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const rootNavigationState = useRootNavigationState();

  if (!rootNavigationState?.key) {
    return null;
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: "#16AD78",
        headerShown: false,
        tabBarStyle: { height: 64, paddingBottom: 10 },
        tabBarLabelStyle: { fontSize: 12, fontFamily: "Kanit" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "หน้าหลัก",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "ประวัติ",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="history" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "ตั้งค่า",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
