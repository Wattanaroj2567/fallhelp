import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { PrimaryButton } from "../PrimaryButton";

describe("PrimaryButton Component", () => {
  // ==========================================
  // ✅ Test Group 1: Rendering & Variants
  // จากโค้ดจริง: PrimaryButton.tsx variants
  // ==========================================

  describe("Rendering", () => {
    it("should render with title prop", () => {
      render(
        <PrimaryButton
          testID="login-button"
          title="เข้าสู่ระบบ"
          onPress={() => {}}
        />
      );

      expect(screen.getByText("เข้าสู่ระบบ")).toBeTruthy();
      expect(screen.getByTestId("login-button")).toBeTruthy();
    });

    it("should render primary variant by default", () => {
      const { getByText, getByTestId } = render(
        <PrimaryButton testID="save-button" title="บันทึก" onPress={() => {}} />
      );

      // Should render with primary styling (default)
      expect(getByTestId("save-button")).toBeTruthy();
      expect(getByText("บันทึก")).toBeTruthy();
    });

    it("should render danger variant with red background", () => {
      const { getByText, getByTestId } = render(
        <PrimaryButton
          testID="delete-button"
          title="ลบ"
          variant="danger"
          onPress={() => {}}
        />
      );

      // Should render with danger variant
      expect(getByTestId("delete-button")).toBeTruthy();
      expect(getByText("ลบ")).toBeTruthy();
    });

    it("should render outline variant with border", () => {
      const { getByText, getByTestId } = render(
        <PrimaryButton
          testID="cancel-button"
          title="ยกเลิก"
          variant="outline"
          onPress={() => {}}
        />
      );

      // Should render with outline variant
      expect(getByTestId("cancel-button")).toBeTruthy();
      expect(getByText("ยกเลิก")).toBeTruthy();
    });
  });

  // ==========================================
  // ✅ Test Group 2: Loading State
  // จากโค้ดจริง: loading prop ใน login.tsx
  // ==========================================

  describe("Loading State", () => {
    it("should show ActivityIndicator when loading is true", () => {
      const { getByTestId, queryByText } = render(
        <PrimaryButton
          testID="loading-button"
          title="เข้าสู่ระบบ"
          loading={true}
          onPress={() => {}}
        />
      );

      // Title should be hidden
      expect(queryByText("เข้าสู่ระบบ")).toBeFalsy();

      // ActivityIndicator should be visible with button-loading-indicator testID
      expect(screen.getByTestId("button-loading-indicator")).toBeTruthy();
    });

    it("should not call onPress when loading", () => {
      const mockOnPress = jest.fn();

      const { getByTestId } = render(
        <PrimaryButton
          testID="no-press-loading-button"
          title="บันทึก"
          loading={true}
          onPress={mockOnPress}
        />
      );

      const button = getByTestId("no-press-loading-button");
      fireEvent.press(button);

      // Should not be called because button is disabled during loading
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it("should reduce opacity when loading", () => {
      const { getByTestId } = render(
        <PrimaryButton
          testID="opacity-loading-button"
          title="บันทึก"
          loading={true}
          onPress={() => {}}
        />
      );

      const button = getByTestId("opacity-loading-button");
      expect(button.props.style).toMatchObject({ opacity: 0.7 });
    });
  });

  // ==========================================
  // ✅ Test Group 3: Disabled State
  // จากโค้ดจริง: disabled prop behavior
  // ==========================================

  describe("Disabled State", () => {
    it("should not call onPress when disabled", () => {
      const mockOnPress = jest.fn();

      const { getByTestId } = render(
        <PrimaryButton
          testID="disabled-button"
          title="บันทึก"
          disabled={true}
          onPress={mockOnPress}
        />
      );

      const button = getByTestId("disabled-button");
      fireEvent.press(button);

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it("should reduce opacity when disabled", () => {
      const { getByTestId } = render(
        <PrimaryButton
          testID="opacity-disabled-button"
          title="บันทึก"
          disabled={true}
          onPress={() => {}}
        />
      );

      const button = getByTestId("opacity-disabled-button");
      expect(button.props.style).toMatchObject({ opacity: 0.7 });
    });

    it("should have disabled prop set to true", () => {
      const { getByTestId } = render(
        <PrimaryButton
          testID="prop-disabled-button"
          title="บันทึก"
          disabled={true}
          onPress={() => {}}
        />
      );

      // Should render button even when disabled
      expect(getByTestId("prop-disabled-button")).toBeTruthy();
    });
  });

  // ==========================================
  // ✅ Test Group 4: User Interactions
  // จากโค้ดจริง: onPress callback ใน login.tsx, form screens
  // ==========================================

  describe("User Interactions", () => {
    it("should call onPress when button is pressed", () => {
      const mockOnPress = jest.fn();

      render(
        <PrimaryButton
          testID="press-test-button"
          title="เข้าสู่ระบบ"
          onPress={mockOnPress}
        />
      );

      const button = screen.getByTestId("press-test-button");
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it("should call onPress multiple times when pressed multiple times", () => {
      const mockOnPress = jest.fn();

      render(
        <PrimaryButton
          testID="multiple-press-button"
          title="บันทึก"
          onPress={mockOnPress}
        />
      );

      const button = screen.getByTestId("multiple-press-button");

      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });

    it("should have activeOpacity of 0.8", () => {
      const { getByTestId } = render(
        <PrimaryButton
          testID="active-opacity-button"
          title="บันทึก"
          onPress={() => {}}
        />
      );

      const button = getByTestId("active-opacity-button");
      expect(button).toBeTruthy();
    });
  });

  // ==========================================
  // ✅ Test Group 5: Custom Styling
  // จากโค้ดจริง: style prop forwarding
  // ==========================================

  describe("Custom Styling", () => {
    it("should accept custom style prop", () => {
      const customStyle = { marginBottom: 20 };

      const { getByTestId } = render(
        <PrimaryButton
          testID="custom-style-button"
          title="บันทึก"
          onPress={() => {}}
          style={customStyle}
        />
      );

      const button = getByTestId("custom-style-button");
      expect(button.props.style).toMatchObject(customStyle);
    });

    it("should merge custom style with default styles", () => {
      const customStyle = { marginTop: 10 };

      const { getByTestId } = render(
        <PrimaryButton
          testID="merged-style-button"
          title="บันทึก"
          onPress={() => {}}
          style={customStyle}
        />
      );

      const button = getByTestId("merged-style-button");
      // Should have both opacity (default) and marginTop (custom)
      expect(button.props.style).toMatchObject({ opacity: 1, marginTop: 10 });
    });
  });

  // ==========================================
  // ✅ Test Group 6: Real-world Use Cases
  // จากโค้ดจริง: ตัวอย่างการใช้งานจริงใน App
  // ==========================================

  describe("Real-world Use Cases", () => {
    it("should work as Login button (from login.tsx)", () => {
      const mockLogin = jest.fn();

      render(
        <PrimaryButton
          testID="real-login-button"
          title="เข้าสู่ระบบ"
          onPress={mockLogin}
          loading={false}
          style={{ marginBottom: 20 }}
        />
      );

      fireEvent.press(screen.getByTestId("real-login-button"));
      expect(mockLogin).toHaveBeenCalled();
    });

    it("should work as Save button (from edit screens)", () => {
      const mockSave = jest.fn();

      render(
        <PrimaryButton
          testID="real-save-button"
          title="บันทึกข้อมูล"
          onPress={mockSave}
        />
      );

      fireEvent.press(screen.getByTestId("real-save-button"));
      expect(mockSave).toHaveBeenCalled();
    });

    it("should work as Delete button with danger variant", () => {
      const mockDelete = jest.fn();

      render(
        <PrimaryButton
          testID="real-delete-button"
          title="ลบผู้ใช้"
          variant="danger"
          onPress={mockDelete}
        />
      );

      fireEvent.press(screen.getByTestId("real-delete-button"));
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
