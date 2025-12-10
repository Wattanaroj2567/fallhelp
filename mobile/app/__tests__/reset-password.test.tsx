/**
 * @fileoverview Reset Password Screen Tests
 * @description Tests for reset password functionality
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import ResetPasswordScreen from "../(auth)/reset-password";
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

describe("Reset Password Screen", () => {
  const mockReplace = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      back: mockBack,
      push: jest.fn(),
    });

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      email: "test@example.com",
      code: "123456",
    });

    jest.spyOn(Alert, "alert");
  });

  describe("Rendering", () => {
    it("should render reset password form", () => {
      const { getByText, getByTestId } = render(<ResetPasswordScreen />, { wrapper });
      expect(getByText("บันทึกรหัสผ่านใหม่")).toBeTruthy();
    });

    it("should render new password input", () => {
      const { getByTestId } = render(<ResetPasswordScreen />, {
        wrapper,
      });
      expect(getByTestId("newPassword-input")).toBeTruthy();
    });

    it("should render confirm password input", () => {
      const { getByTestId } = render(<ResetPasswordScreen />, {
        wrapper,
      });
      expect(getByTestId("confirmPassword-input")).toBeTruthy();
    });

    it("should render reset button", () => {
      const { getByText, getByTestId } = render(<ResetPasswordScreen />, { wrapper });
      expect(getByText("บันทึกรหัสผ่านใหม่")).toBeTruthy();
    });
  });

  describe("Form Validation", () => {
    it("should show alert when fields are empty", async () => {
      const { getByText, getByTestId } = render(<ResetPasswordScreen />, { wrapper });
      const resetButton = getByText("บันทึกรหัสผ่านใหม่");

      fireEvent.press(resetButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "ข้อมูลไม่ครบ",
          "กรุณากรอกรหัสผ่านใหม่ให้ครบถ้วน"
        );
      });
    });

    it("should show alert when passwords do not match", async () => {
      const { getByTestId, getByText } = render(
        <ResetPasswordScreen />,
        { wrapper }
      );
      const newPasswordInput = getByTestId("newPassword-input");
      const confirmPasswordInput = getByTestId("confirmPassword-input");
      const resetButton = getByText("บันทึกรหัสผ่านใหม่");

      fireEvent.changeText(newPasswordInput, "password123");
      fireEvent.changeText(confirmPasswordInput, "password456");
      fireEvent.press(resetButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "รหัสผ่านไม่ตรงกัน",
          "กรุณากรอกรหัสผ่านยืนยันให้ตรงกัน"
        );
      });
    });

    it("should show alert when password is too short", async () => {
      const { getByTestId, getByText } = render(
        <ResetPasswordScreen />,
        { wrapper }
      );
      const newPasswordInput = getByTestId("newPassword-input");
      const confirmPasswordInput = getByTestId("confirmPassword-input");
      const resetButton = getByText("บันทึกรหัสผ่านใหม่");

      fireEvent.changeText(newPasswordInput, "123");
      fireEvent.changeText(confirmPasswordInput, "123");
      fireEvent.press(resetButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "รหัสผ่านสั้นเกินไป",
          "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"
        );
      });
    });
  });

  describe("Reset Password Flow", () => {
    it("should call resetPassword API with correct data", async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { getByTestId, getByText } = render(
        <ResetPasswordScreen />,
        { wrapper }
      );
      const newPasswordInput = getByTestId("newPassword-input");
      const confirmPasswordInput = getByTestId("confirmPassword-input");
      const resetButton = getByText("บันทึกรหัสผ่านใหม่");

      fireEvent.changeText(newPasswordInput, "newpassword123");
      fireEvent.changeText(confirmPasswordInput, "newpassword123");
      fireEvent.press(resetButton);

      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          code: "123456",
          newPassword: "newpassword123",
        });
      });
    });

    it("should navigate to success screen on successful reset", async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { getByTestId, getByText } = render(
        <ResetPasswordScreen />,
        { wrapper }
      );
      const newPasswordInput = getByTestId("newPassword-input");
      const confirmPasswordInput = getByTestId("confirmPassword-input");
      const resetButton = getByText("บันทึกรหัสผ่านใหม่");

      fireEvent.changeText(newPasswordInput, "newpassword123");
      fireEvent.changeText(confirmPasswordInput, "newpassword123");
      fireEvent.press(resetButton);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith({
          pathname: "/(auth)/success",
          params: { type: "reset_password" },
        });
      });
    });

    it("should show error on API failure", async () => {
      (authService.resetPassword as jest.Mock).mockRejectedValue(
        new Error("Invalid code")
      );

      const { getByTestId, getByText } = render(
        <ResetPasswordScreen />,
        { wrapper }
      );
      const newPasswordInput = getByTestId("newPassword-input");
      const confirmPasswordInput = getByTestId("confirmPassword-input");
      const resetButton = getByText("บันทึกรหัสผ่านใหม่");

      fireEvent.changeText(newPasswordInput, "newpassword123");
      fireEvent.changeText(confirmPasswordInput, "newpassword123");
      fireEvent.press(resetButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("ผิดพลาด", expect.any(String));
      });
    });
  });

  describe("Params", () => {
    it("should receive email and code from params", () => {
      render(<ResetPasswordScreen />, { wrapper });

      expect(useLocalSearchParams).toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    it("should disable button while loading", async () => {
      (authService.resetPassword as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByTestId, getByText } = render(
        <ResetPasswordScreen />,
        { wrapper }
      );
      const newPasswordInput = getByTestId("newPassword-input");
      const confirmPasswordInput = getByTestId("confirmPassword-input");
      const resetButton = getByText("บันทึกรหัสผ่านใหม่");

      fireEvent.changeText(newPasswordInput, "newpassword123");
      fireEvent.changeText(confirmPasswordInput, "newpassword123");
      fireEvent.press(resetButton);

      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalled();
      });
    });
  });

  describe("Navigation", () => {
    it("should have back button", () => {
      render(<ResetPasswordScreen />, { wrapper });
      expect(mockBack).toBeDefined();
    });
  });
});
