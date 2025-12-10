/**
 * @fileoverview Success Screen Tests
 * @description Tests for authentication success screen
 */

import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import SuccessScreen from "../(auth)/success";

// Mock dependencies
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    replace: mockReplace,
  })),
  useLocalSearchParams: jest.fn(() => ({ type: "register" })),
}));

jest.useFakeTimers();

describe("Success Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("Rendering - Register Success", () => {
    beforeEach(() => {
      const { useLocalSearchParams } = require("expo-router");
      useLocalSearchParams.mockReturnValue({ type: "register" });
    });

    it("should render success icon", () => {
      const { getByTestId } = render(<SuccessScreen />);
      expect(getByTestId("success-icon")).toBeTruthy();
    });

    it("should render register success title", () => {
      const { getByText } = render(<SuccessScreen />);
      expect(getByText("ลงทะเบียนสำเร็จ!")).toBeTruthy();
    });

    it("should render register success message", () => {
      const { getByText } = render(<SuccessScreen />);
      expect(getByText(/ยินดีต้อนรับสู่ FallHelp/i)).toBeTruthy();
      expect(getByText(/บัญชีของคุณถูกสร้างเรียบร้อยแล้ว/i)).toBeTruthy();
    });
  });

  describe("Rendering - Password Reset Success", () => {
    beforeEach(() => {
      const { useLocalSearchParams } = require("expo-router");
      useLocalSearchParams.mockReturnValue({ type: "reset_password" });
    });

    it("should render password reset success title", () => {
      const { getByText } = render(<SuccessScreen />);
      expect(getByText("ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว")).toBeTruthy();
    });

    it("should render password reset success message", () => {
      const { getByText } = render(<SuccessScreen />);
      expect(getByText(/รอสักครู่/i)).toBeTruthy();
      expect(getByText(/ระบบกำลังพาท่านไปหน้าเข้าสู่ระบบ/i)).toBeTruthy();
    });
  });

  describe("Auto Redirect - Register", () => {
    beforeEach(() => {
      const { useLocalSearchParams } = require("expo-router");
      useLocalSearchParams.mockReturnValue({ type: "register" });
    });

    it("should redirect to setup flow after 3 seconds", async () => {
      render(<SuccessScreen />);

      // Fast forward 3 seconds
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/(setup)/empty-state");
      });
    });

    it("should not redirect before 3 seconds", () => {
      render(<SuccessScreen />);

      jest.advanceTimersByTime(2000);

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe("Auto Redirect - Password Reset", () => {
    beforeEach(() => {
      const { useLocalSearchParams } = require("expo-router");
      useLocalSearchParams.mockReturnValue({ type: "reset_password" });
    });

    it("should redirect to login after 3 seconds", async () => {
      render(<SuccessScreen />);

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
      });
    });
  });

  describe("Cleanup", () => {
    it("should clear timeout on unmount", () => {
      const { unmount } = render(<SuccessScreen />);

      unmount();

      jest.advanceTimersByTime(3000);

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe("Visual Elements", () => {
    it("should use green color for success icon", () => {
      const { getByTestId } = render(<SuccessScreen />);
      const icon = getByTestId("success-icon");

      expect(icon.props.style).toMatchObject({
        backgroundColor: "#16AD78",
      });
    });

    it("should render check icon", () => {
      const { UNSAFE_getByType } = render(<SuccessScreen />);
      const icons = UNSAFE_getByType(
        require("@expo/vector-icons").MaterialIcons
      );

      expect(icons.props.name).toBe("check");
    });
  });
});
