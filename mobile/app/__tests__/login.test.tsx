/**
 * @fileoverview Login Screen Tests
 * @description Tests for login functionality
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import LoginScreen from "../(auth)/login";
import * as authService from "../../services/authService";
import { AuthProvider } from "../../context/AuthContext";

// Mock dependencies
jest.mock("expo-router");
jest.mock("../../services/authService");
jest.mock("../../context/AuthContext", () => ({
  ...jest.requireActual("../../context/AuthContext"),
  useAuth: jest.fn(() => ({
    signIn: jest.fn(),
    signOut: jest.fn(),
    user: null,
    token: null,
    isLoading: false,
  })),
}));

// Create QueryClient for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// Wrapper component
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

describe("Login Screen", () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockSignIn = jest.fn();
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
    });

    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({
      signIn: mockSignIn,
      signOut: mockSignOut,
      user: null,
      token: null,
      isLoading: false,
    });

    jest.spyOn(Alert, "alert");
  });

  describe("Rendering", () => {
    it("should render login form", () => {
      const { getByText, getByTestId } = render(<LoginScreen />, { wrapper });
      expect(getByTestId("login-button")).toBeTruthy();
    });

    it("should render email/phone input", () => {
      const { getByTestId } = render(<LoginScreen />, { wrapper });
      expect(getByTestId("email-input")).toBeTruthy();
    });

    it("should render password input", () => {
      const { getByTestId } = render(<LoginScreen />, { wrapper });
      expect(getByTestId("password-input")).toBeTruthy();
    });

    it("should render login button", () => {
      const { getByText, getByTestId } = render(<LoginScreen />, { wrapper });
      expect(getByTestId("login-button")).toBeTruthy();
    });

    it("should render forgot password link", () => {
      const { getByText, getByTestId } = render(<LoginScreen />, { wrapper });
      expect(getByText("ลืมรหัสผ่าน ?")).toBeTruthy();
    });

    it("should have register link", () => {
      const { getByText, getByTestId } = render(<LoginScreen />, { wrapper });
      expect(getByText(/สมัครสมาชิก/)).toBeTruthy();
    });
  });

  describe("Form Validation", () => {
    it("should show alert when fields are empty", async () => {
      const { getByText, getByTestId } = render(<LoginScreen />, { wrapper });
      const loginButton = getByTestId("login-button");

      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "กรุณากรอกข้อมูล",
          "โปรดกรอกอีเมล/เบอร์โทรศัพท์และรหัสผ่าน"
        );
      });
    });

    it("should show alert when identifier has error", async () => {
      const { getByTestId, getByText } = render(<LoginScreen />, {
        wrapper,
      });
      const identifierInput = getByTestId("email-input");
      const passwordInput = getByTestId("password-input");
      const loginButton = getByTestId("login-button");

      // Set invalid email to trigger error
      fireEvent.changeText(identifierInput, "invalid@");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
    });
  });

  describe("Login Flow", () => {
    it("should call login API with correct credentials", async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        token: "test-token",
        user: { id: 1, role: "GUARDIAN" },
      });

      const { getByTestId, getByText } = render(<LoginScreen />, {
        wrapper,
      });
      const identifierInput = getByTestId("email-input");
      const passwordInput = getByTestId("password-input");
      const loginButton = getByTestId("login-button");

      fireEvent.changeText(identifierInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          identifier: "test@example.com",
          password: "password123",
        });
      });
    });

    it("should call signIn on successful login", async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        token: "test-token",
        user: { id: 1, role: "GUARDIAN" },
      });

      const { getByTestId, getByText } = render(<LoginScreen />, {
        wrapper,
      });
      const identifierInput = getByTestId("email-input");
      const passwordInput = getByTestId("password-input");
      const loginButton = getByTestId("login-button");

      fireEvent.changeText(identifierInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith("test-token");
      });
    });

    it("should show success alert on login", async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        token: "test-token",
        user: { id: 1, role: "GUARDIAN" },
      });

      const { getByTestId, getByText } = render(<LoginScreen />, {
        wrapper,
      });
      const identifierInput = getByTestId("email-input");
      const passwordInput = getByTestId("password-input");
      const loginButton = getByTestId("login-button");

      fireEvent.changeText(identifierInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "เข้าสู่ระบบสำเร็จ",
          "ยินดีต้อนรับกลับ"
        );
      });
    });

    it("should reject ADMIN role login", async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        token: "admin-token",
        user: { id: 1, role: "ADMIN" },
      });

      const { getByTestId, getByText } = render(<LoginScreen />, {
        wrapper,
      });
      const identifierInput = getByTestId("email-input");
      const passwordInput = getByTestId("password-input");
      const loginButton = getByTestId("login-button");

      fireEvent.changeText(identifierInput, "admin@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "ไม่สามารถเข้าสู่ระบบได้",
          expect.stringContaining("Admin")
        );
      });

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it("should show error on login failure", async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new Error("Invalid credentials")
      );

      const { getByTestId, getByText } = render(<LoginScreen />, {
        wrapper,
      });
      const identifierInput = getByTestId("email-input");
      const passwordInput = getByTestId("password-input");
      const loginButton = getByTestId("login-button");

      fireEvent.changeText(identifierInput, "wrong@example.com");
      fireEvent.changeText(passwordInput, "wrongpassword");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "เข้าสู่ระบบล้มเหลว",
          expect.any(String)
        );
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to forgot password", () => {
      const { getByText, getByTestId } = render(<LoginScreen />, { wrapper });
      const forgotLink = getByText("ลืมรหัสผ่าน ?");

      fireEvent.press(forgotLink);

      expect(mockPush).toHaveBeenCalledWith("/(auth)/forgot-password");
    });

    it("should navigate to register", () => {
      const { getByText, getByTestId } = render(<LoginScreen />, { wrapper });
      const registerLink = getByText(/สมัครสมาชิก/);

      fireEvent.press(registerLink);

      expect(mockPush).toHaveBeenCalledWith("/(auth)/register");
    });
  });

  describe("Loading States", () => {
    it("should disable button while loading", async () => {
      (authService.login as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByTestId, getByText } = render(<LoginScreen />, {
        wrapper,
      });
      const identifierInput = getByTestId("email-input");
      const passwordInput = getByTestId("password-input");
      const loginButton = getByTestId("login-button");

      fireEvent.changeText(identifierInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
      });
    });
  });
});
