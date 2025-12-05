import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Logger from '@/utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class CustomErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Logger.error('Uncaught Error in Component Tree:', { error, errorInfo });

  }

  handleClearAndReload = async () => {
    try {
      // Clear all stored data
      const SecureStore = await import('expo-secure-store');
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('setup_step');
      await SecureStore.deleteItemAsync('setup_elderId');
      await SecureStore.deleteItemAsync('setup_deviceId');

      // Reset state and reload
      this.setState({ hasError: false, error: null });

      // Reload in development
      if (__DEV__) {
        const DevSettings = require('react-native').DevSettings;
        DevSettings.reload();
      }
    } catch (e) {
      Logger.error('Failed to clear and reload:', e);
      // Fallback: just reset state
      this.setState({ hasError: false, error: null });
    }
  };

  handleReload = () => {
    if (__DEV__) {
      const DevSettings = require('react-native').DevSettings;
      DevSettings.reload();
    } else {
      this.setState({ hasError: false, error: null });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
          <View className="flex-1 justify-center items-center px-6">
            <MaterialIcons name="error-outline" size={80} color="#EF4444" />

            <Text className="font-kanit text-2xl font-bold text-gray-900 mt-6 text-center">
              เกิดข้อผิดพลาด
            </Text>

            <Text className="font-kanit text-base text-gray-600 mt-2 text-center">
              แอปพลิเคชันเกิดข้อผิดพลาดที่ไม่คาดคิด
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView className="mt-4 max-h-40 w-full bg-gray-100 rounded-lg p-4">
                <Text className="font-mono text-xs text-red-600">
                  {this.state.error.toString()}
                </Text>
              </ScrollView>
            )}

            <View className="mt-8 w-full gap-3">
              <TouchableOpacity
                onPress={this.handleClearAndReload}
                className="bg-[#16AD78] rounded-2xl py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="font-kanit text-white text-lg font-semibold">
                  ล้างข้อมูลและเริ่มใหม่
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.handleReload}
                className="bg-gray-200 rounded-2xl py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="font-kanit text-gray-700 text-lg font-semibold">
                  โหลดใหม่
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="font-kanit text-sm text-gray-500 mt-6 text-center">
              หากปัญหายังคงเกิดขึ้น กรุณาติดต่อทีมสนับสนุน
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
