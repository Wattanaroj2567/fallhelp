import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Logger from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * QueryErrorBoundary - Catches errors in React Query components
 * Provides retry functionality and user-friendly error messages
 */
export class QueryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    // Error already logged by parent ErrorBoundary
    Logger.debug('[QueryErrorBoundary] Caught error:', error.message);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 justify-center items-center p-6">
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />

          <Text className="font-kanit text-lg font-semibold text-gray-900 mt-4 text-center">
            เกิดข้อผิดพลาด
          </Text>

          <Text className="font-kanit text-sm text-gray-600 mt-2 text-center">
            ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง
          </Text>

          <TouchableOpacity
            onPress={this.handleRetry}
            className="mt-4 bg-[#16AD78] rounded-xl px-6 py-3"
            activeOpacity={0.8}
          >
            <Text className="font-kanit text-white font-semibold">ลองอีกครั้ง</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
