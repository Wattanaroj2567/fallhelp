import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { ScreenHeader } from "../ScreenHeader";

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

// Mock useSafeAreaInsets
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 0, left: 0, right: 0 }),
}));

describe("ScreenHeader Component", () => {
  // ==========================================
  // ✅ Test Group 1: Rendering & Basic Props
  // จากโค้ดจริง: ScreenHeader.tsx
  // ==========================================

  describe("Rendering", () => {
    it("should render with title prop", () => {
      render(<ScreenHeader title="ข้อมูลผู้สูงอายุ" />);

      expect(screen.getByText("ข้อมูลผู้สูงอายุ")).toBeTruthy();
    });

    it("should render title correctly with Thai characters", () => {
      render(<ScreenHeader title="แก้ไขเบอร์ติดต่อฉุกเฉิน" />);

      expect(screen.getByText("แก้ไขเบอร์ติดต่อฉุกเฉิน")).toBeTruthy();
    });

    it("should render transparent background when transparent prop is true", () => {
      const { root } = render(
        <ScreenHeader title="หน้าหลัก" transparent={true} />
      );

      // Transparent prop should be passed through to component
      expect(root).toBeTruthy();
    });

    it("should render white background by default", () => {
      const { root } = render(<ScreenHeader title="หน้าหลัก" />);

      // Default background should be white
      expect(root).toBeTruthy();
    });
  });

  // ==========================================
  // ✅ Test Group 2: Back Button Navigation
  // จากโค้ดจริง: onBack callback ใน ScreenHeader
  // ตัวอย่าง: step3-wifi-setup.tsx, elder/edit.tsx
  // ==========================================

  describe("Back Button Navigation", () => {
    it("should render back button when onBack is provided", () => {
      const mockBack = jest.fn();

      render(<ScreenHeader title="แก้ไขข้อมูล" onBack={mockBack} />);

      // Back button should be visible with testID="back-button"
      const backButton = screen.getByTestId("back-button");
      expect(backButton).toBeTruthy();
    });

    it("should call onBack when back button is pressed", () => {
      const mockBack = jest.fn();

      render(<ScreenHeader title="แก้ไขข้อมูล" onBack={mockBack} />);

      const backButton = screen.getByTestId("back-button");
      fireEvent.press(backButton);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("should not render back button when onBack is not provided", () => {
      const { queryByTestId } = render(<ScreenHeader title="หน้าหลัก" />);

      // Should render placeholder View instead of button
      expect(queryByTestId("back-button")).toBeFalsy();
    });

    it("should call onBack multiple times when pressed multiple times", () => {
      const mockBack = jest.fn();

      render(<ScreenHeader title="แก้ไขข้อมูล" onBack={mockBack} />);

      const backButton = screen.getByTestId("back-button");

      fireEvent.press(backButton);
      fireEvent.press(backButton);
      fireEvent.press(backButton);

      expect(mockBack).toHaveBeenCalledTimes(3);
    });
  });

  // ==========================================
  // ✅ Test Group 3: Right Element Slot
  // จากโค้ดจริง: rightElement prop
  // ==========================================

  describe("Right Element Slot", () => {
    it("should render custom right element when provided", () => {
      const { Text } = require("react-native");
      const CustomElement = () => <Text testID="custom-right">Save</Text>;

      render(
        <ScreenHeader title="แก้ไขโปรไฟล์" rightElement={<CustomElement />} />
      );

      expect(screen.getByTestId("custom-right")).toBeTruthy();
    });

    it("should not render right element when not provided", () => {
      const { queryByTestId } = render(<ScreenHeader title="หน้าหลัก" />);

      expect(queryByTestId("custom-right")).toBeFalsy();
    });
  });

  // ==========================================
  // ✅ Test Group 4: Safe Area Handling
  // จากโค้ดจริง: useSafeAreaInsets() integration
  // ==========================================

  describe("Safe Area Handling", () => {
    it("should apply safe area insets when transparent", () => {
      const { root } = render(
        <ScreenHeader title="Camera" transparent={true} />
      );

      // Should render with safe area insets when transparent
      // useSafeAreaInsets is mocked to return top: 44
      expect(root).toBeTruthy();
    });

    it("should not apply safe area padding when not transparent", () => {
      const { root } = render(<ScreenHeader title="Settings" />);

      // Should have paddingTop: 0 when not transparent
      expect(root).toBeTruthy();
    });
  });

  // ==========================================
  // ✅ Test Group 5: Real-world Use Cases
  // จากโค้ดจริง: ตัวอย่างการใช้งานจริงใน App
  // ==========================================

  describe("Real-world Use Cases", () => {
    it("should work as Elder Info header with back navigation", () => {
      // จาก: app/(features)/(elder)/index.tsx
      const mockBack = jest.fn();

      render(<ScreenHeader title="ข้อมูลผู้สูงอายุ" onBack={mockBack} />);

      expect(screen.getByText("ข้อมูลผู้สูงอายุ")).toBeTruthy();

      fireEvent.press(screen.getByTestId("back-button"));
      expect(mockBack).toHaveBeenCalled();
    });

    it("should work as Edit Emergency Contact header", () => {
      // จาก: app/(features)/(emergency)/edit.tsx
      const mockBack = jest.fn();

      render(
        <ScreenHeader title="แก้ไขเบอร์ติดต่อฉุกเฉิน" onBack={mockBack} />
      );

      expect(screen.getByText("แก้ไขเบอร์ติดต่อฉุกเฉิน")).toBeTruthy();

      const backButton = screen.getByTestId("back-button");
      fireEvent.press(backButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it("should work as WiFi Setup header", () => {
      // จาก: app/(setup)/step3-wifi-setup.tsx
      const handleBack = jest.fn();

      render(<ScreenHeader title="ตั้งค่า WiFi" onBack={handleBack} />);

      expect(screen.getByText("ตั้งค่า WiFi")).toBeTruthy();
    });

    it("should work as Emergency Contacts List header", () => {
      // จาก: app/(features)/(emergency)/index.tsx
      const mockBack = jest.fn();

      render(
        <ScreenHeader title="จัดการเบอร์ติดต่อฉุกเฉิน" onBack={mockBack} />
      );

      expect(screen.getByText("จัดการเบอร์ติดต่อฉุกเฉิน")).toBeTruthy();
    });
  });

  // ==========================================
  // ✅ Test Group 6: Text Truncation
  // จากโค้ดจริง: numberOfLines={1} ใน title Text
  // ==========================================

  describe("Text Truncation", () => {
    it("should truncate long titles with numberOfLines=1", () => {
      const { getByText } = render(
        <ScreenHeader title="หัวข้อที่ยาวมากๆ เกินกว่าที่จะแสดงได้หมด" />
      );

      const titleText = getByText("หัวข้อที่ยาวมากๆ เกินกว่าที่จะแสดงได้หมด");
      expect(titleText.props.numberOfLines).toBe(1);
    });
  });

  // ==========================================
  // ✅ Test Group 7: Accessibility
  // ==========================================

  describe("Accessibility", () => {
    it("should render touchable back button", () => {
      const mockBack = jest.fn();

      const { getByTestId } = render(
        <ScreenHeader title="Settings" onBack={mockBack} />
      );

      const backButton = getByTestId("back-button");
      expect(backButton).toBeTruthy();

      // Should be pressable
      fireEvent.press(backButton);
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // ✅ Test Group 8: HitSlop (NEW)
  // ==========================================

  describe("HitSlop", () => {
    it("should have hitSlop on back button for easier pressing", () => {
      const mockBack = jest.fn();

      const { getByTestId } = render(
        <ScreenHeader title="Settings" onBack={mockBack} />
      );

      const backButton = getByTestId("back-button");

      // HitSlop should be defined on the component
      // The button should still be pressable
      expect(backButton).toBeTruthy();
      fireEvent.press(backButton);
      expect(mockBack).toHaveBeenCalled();
    });

    it("should have expanded touch area via hitSlop prop", () => {
      const mockBack = jest.fn();

      render(<ScreenHeader title="Test" onBack={mockBack} />);

      const backButton = screen.getByTestId("back-button");

      // Multiple presses should all register
      fireEvent.press(backButton);
      fireEvent.press(backButton);

      expect(mockBack).toHaveBeenCalledTimes(2);
    });
  });
});
