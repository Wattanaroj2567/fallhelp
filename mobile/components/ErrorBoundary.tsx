import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView className="flex-1 bg-white">
          <ScrollView contentContainerClassName="flex-grow justify-center items-center p-6">
            <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="alert-circle" size={64} color="#EF4444" />
            </View>

            <Text className="text-2xl font-bold text-gray-900 mb-2 font-kanit">
              เกิดข้อผิดพลาด
            </Text>

            <Text className="text-base text-gray-600 text-center mb-8 font-kanit">
              ขออภัย ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
            </Text>

            {__DEV__ && this.state.error && (
              <View className="w-full bg-gray-100 p-4 rounded-xl mb-6">
                <Text className="text-xs text-red-600 font-mono mb-2">
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={this.handleReset}
              className="bg-red-500 py-3 px-8 rounded-xl shadow-lg active:bg-red-600"
            >
              <Text className="text-white font-bold font-kanit text-lg">
                ลองใหม่อีกครั้ง
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
