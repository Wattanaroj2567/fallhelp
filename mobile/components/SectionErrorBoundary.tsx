import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Logger from '@/utils/logger';

interface Props {
  children: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * SectionErrorBoundary - Catches errors in major app sections
 * Allows rest of app to function while showing section-specific error
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    Logger.debug(`[SectionErrorBoundary:${this.props.sectionName}] Error:`, error.message);
  }

  handleGoBack = async () => {
    try {
      // Check if we can go back safely
      // If router.canGoBack() is false or router.back() fails, replace to home
      try {
        if (router.canGoBack?.()) {
          router.back();
          return;
        }
      } catch (_e) {
        Logger.debug('router.back() not available, using replace()');
      }

      // Fallback: Go to home tab
      router.replace('/(tabs)');
    } catch (e) {
      Logger.error('Failed to navigate back:', e);
      // Last resort: Reset error state
      this.setState({ hasError: false, error: null });
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
          <View className="flex-1 justify-center items-center px-8">
            <MaterialIcons name="warning" size={64} color="#F59E0B" />

            <Text className="font-kanit text-xl font-bold text-gray-900 mt-6 text-center">
              {this.props.sectionName || 'ส่วนนี้'}เกิดข้อผิดพลาด
            </Text>

            <Text className="font-kanit text-base text-gray-600 mt-2 text-center">
              ส่วนอื่นของแอปยังใช้งานได้ปกติ
            </Text>

            <View className="mt-8 w-full gap-3">
              <TouchableOpacity
                onPress={this.handleReset}
                className="bg-[#16AD78] rounded-2xl py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="font-kanit text-white text-lg font-semibold">ลองอีกครั้ง</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.handleGoBack}
                className="bg-gray-200 rounded-2xl py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="font-kanit text-gray-700 text-lg font-semibold">กลับหน้าหลัก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
