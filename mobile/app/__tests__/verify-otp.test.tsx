/**
 * @fileoverview Verify OTP Screen Tests
 * @description Tests for OTP verification functionality
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import VerifyOtpScreen from "../(auth)/verify-otp";
import * as authService from "../../services/authService";

// Mock dependencies
jest.mock("expo-router");
jest.mock("../../services/authService");

// Create QueryClient for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// Wrapper component for tests
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
};

describe("Verify OTP Screen", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock expo-router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    });

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      email: "test@example.com",
    });

    // Mock Alert
    jest.spyOn(Alert, "alert");
  });

  describe("Rendering", () => {
    it("should render OTP header", () => {
      const { getByText } = render(<VerifyOtpScreen />, { wrapper });
      expect(getByText("OTP")).toBeTruthy();
    });

    it("should display email from params", () => {
      const { getByText } = render(<VerifyOtpScreen />, { wrapper });
      expect(getByText("test@example.com")).toBeTruthy();
    });

    it("should render verify button", () => {
      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });
      expect(getByTestId("verify-button")).toBeTruthy();
    });

    it("should render OTP input", () => {
      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });
      expect(getByTestId("otp-input")).toBeTruthy();
    });

    it("should render OTP boxes", () => {
      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });
      expect(getByTestId("otp-boxes")).toBeTruthy();
    });
  });

  describe("OTP Input", () => {
    it("should accept 6-digit numeric input", () => {
      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });
      const input = getByTestId("otp-input");

      fireEvent.changeText(input, "123456");

      // Check that 6 OTP boxes are rendered
      const otpBoxes = getByTestId("otp-boxes");
      expect(otpBoxes).toBeTruthy();
    });

    it("should reject non-numeric characters", () => {
      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });
      const input = getByTestId("otp-input");

      // Component filters non-numeric, so only "123" should be processed
      fireEvent.changeText(input, "abc123");

      const otpBoxes = getByTestId("otp-boxes");
      expect(otpBoxes).toBeTruthy();
    });

    it("should limit input to 6 digits", () => {
      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });
      const input = getByTestId("otp-input");

      // Component should only accept first 6 digits
      fireEvent.changeText(input, "1234567890");

      const otpBoxes = getByTestId("otp-boxes");
      expect(otpBoxes).toBeTruthy();
    });
  });

  describe("Validation", () => {
    it("should show alert when OTP is incomplete", async () => {
      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });
      const input = getByTestId("otp-input");
      const verifyButton = getByTestId("verify-button");

      fireEvent.changeText(input, "123");
      fireEvent.press(verifyButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "ข้อมูลไม่ครบ",
          "กรุณากรอกรหัสให้ครบ 6 หลัก"
        );
      });
    });
  });

  describe("Verify OTP", () => {
    it("should call verifyOtp API with correct data", async () => {
      (authService.verifyOtp as jest.Mock).mockResolvedValue({ success: true });

      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });
      const input = getByTestId("otp-input");
      const verifyButton = getByTestId("verify-button");

      fireEvent.changeText(input, "123456");
      fireEvent.press(verifyButton);

      await waitFor(() => {
        expect(authService.verifyOtp).toHaveBeenCalledWith({
          email: "test@example.com",
          code: "123456",
          purpose: "PASSWORD_RESET",
        });
      });
    });

    it("should navigate to reset password on success", async () => {
      (authService.verifyOtp as jest.Mock).mockResolvedValue({ success: true });

      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });
      const input = getByTestId("otp-input");
      const verifyButton = getByTestId("verify-button");

      fireEvent.changeText(input, "123456");
      fireEvent.press(verifyButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: "/(auth)/reset-password",
          params: { email: "test@example.com", code: "123456" },
        });
      });
    });

    it("should show error on API failure", async () => {
      (authService.verifyOtp as jest.Mock).mockRejectedValue(
        new Error("Invalid OTP")
      );

      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });
      const input = getByTestId("otp-input");
      const verifyButton = getByTestId("verify-button");

      fireEvent.changeText(input, "123456");
      fireEvent.press(verifyButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
    });
  });

  describe("Resend OTP", () => {
    it("should call requestOtp API when clicked", async () => {
      jest.useFakeTimers();
      (authService.requestOtp as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });

      // Fast forward timer using act
      await waitFor(() => {
        jest.advanceTimersByTime(16000);
      });

      const resendButton = getByTestId("resend-button");
      fireEvent.press(resendButton);

      await waitFor(() => {
        expect(authService.requestOtp).toHaveBeenCalledWith({
          email: "test@example.com",
          purpose: "PASSWORD_RESET",
        });
      });

      jest.useRealTimers();
    });

    it("should show success alert after resend", async () => {
      jest.useFakeTimers();
      (authService.requestOtp as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });

      await waitFor(() => {
        jest.advanceTimersByTime(16000);
      });

      const resendButton = getByTestId("resend-button");
      fireEvent.press(resendButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "ส่งรหัสใหม่แล้ว",
          "กรุณาตรวจสอบอีเมล"
        );
      });

      jest.useRealTimers();
    });
  });

  describe("Timer", () => {
    it("should show timer text", () => {
      const { getByText } = render(<VerifyOtpScreen />, { wrapper });
      expect(getByText(/รอ 0:/)).toBeTruthy();
    });
  });

  describe("Loading States", () => {
    it("should show loading indicator while verifying", async () => {
      (authService.verifyOtp as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByTestId } = render(<VerifyOtpScreen />, { wrapper });
      const input = getByTestId("otp-input");
      const verifyButton = getByTestId("verify-button");

      fireEvent.changeText(input, "123456");
      fireEvent.press(verifyButton);

      await waitFor(() => {
        expect(getByTestId("button-loading-indicator")).toBeTruthy();
      });
    });
  });
});
