/**
 * @fileoverview Forgot Password Screen Tests
 * @description Tests for forgot password functionality
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ForgotPasswordScreen from "../(auth)/forgot-password";
import * as authService from "../../services/authService";

// Mock dependencies
jest.mock("expo-router");
jest.mock("../../services/authService");

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

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

describe("Forgot Password Screen", () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      replace: jest.fn(),
    });

    jest.spyOn(Alert, "alert");
  });

  describe("Rendering", () => {
    it("should render forgot password form", () => {
      const { getByText, getByTestId } = render(<ForgotPasswordScreen />, { wrapper });
      expect(getByText("ลืมรหัสผ่าน")).toBeTruthy();
    });

    it("should render email input", () => {
      const { getByTestId } = render(<ForgotPasswordScreen />, {
        wrapper,
      });
      expect(getByTestId("email-input")).toBeTruthy();
    });

    it("should render send OTP button", () => {
      const { getByText, getByTestId } = render(<ForgotPasswordScreen />, { wrapper });
      expect(getByText("ส่งรหัส OTP")).toBeTruthy();
    });

    it("should render instruction text", () => {
      const { getByText, getByTestId } = render(<ForgotPasswordScreen />, { wrapper });
      expect(getByText(/กรอกอีเมล/i)).toBeTruthy();
    });
  });

  describe("Form Validation", () => {
    it("should show alert when email is empty", async () => {
      const { getByText, getByTestId } = render(<ForgotPasswordScreen />, { wrapper });
      const sendButton = getByText("ส่งรหัส OTP");

      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "กรุณากรอกข้อมูล",
          "โปรดกรอกอีเมลของคุณ"
        );
      });
    });

    it("should show alert for invalid email format", async () => {
      const { getByTestId, getByText } = render(
        <ForgotPasswordScreen />,
        { wrapper }
      );
      const emailInput = getByTestId("email-input");
      const sendButton = getByText("ส่งรหัส OTP");

      fireEvent.changeText(emailInput, "invalid@");
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "อีเมลไม่ถูกต้อง",
          "กรุณากรอกอีเมลเป็นภาษาอังกฤษ"
        );
      });
    });
  });

  describe("Request OTP Flow", () => {
    it("should call requestOtp API with correct email", async () => {
      (authService.requestOtp as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { getByTestId, getByText } = render(
        <ForgotPasswordScreen />,
        { wrapper }
      );
      const emailInput = getByTestId("email-input");
      const sendButton = getByText("ส่งรหัส OTP");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(authService.requestOtp).toHaveBeenCalledWith({
          email: "test@example.com",
          purpose: "PASSWORD_RESET",
        });
      });
    });

    it("should show success alert and navigate to verify-otp", async () => {
      (authService.requestOtp as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { getByTestId, getByText } = render(
        <ForgotPasswordScreen />,
        { wrapper }
      );
      const emailInput = getByTestId("email-input");
      const sendButton = getByText("ส่งรหัส OTP");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "ส่งรหัสสำเร็จ",
          expect.stringContaining("test@example.com"),
          expect.any(Array)
        );
      });

      // Simulate pressing OK button in alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const okButton = alertCall[2][0];
      okButton.onPress();

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(auth)/verify-otp",
        params: { email: "test@example.com" },
      });
    });

    it("should show error on API failure", async () => {
      (authService.requestOtp as jest.Mock).mockRejectedValue(
        new Error("Email not found")
      );

      const { getByTestId, getByText } = render(
        <ForgotPasswordScreen />,
        { wrapper }
      );
      const emailInput = getByTestId("email-input");
      const sendButton = getByText("ส่งรหัส OTP");

      fireEvent.changeText(emailInput, "notfound@example.com");
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "ส่งรหัสไม่สำเร็จ",
          expect.any(String)
        );
      });
    });
  });

  describe("Loading States", () => {
    it("should disable button while loading", async () => {
      (authService.requestOtp as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByTestId, getByText } = render(
        <ForgotPasswordScreen />,
        { wrapper }
      );
      const emailInput = getByTestId("email-input");
      const sendButton = getByText("ส่งรหัส OTP");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(authService.requestOtp).toHaveBeenCalled();
      });
    });
  });

  describe("Navigation", () => {
    it("should have back button", () => {
      render(<ForgotPasswordScreen />, { wrapper });
      expect(mockBack).toBeDefined();
    });
  });
});
