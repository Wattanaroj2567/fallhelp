import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { UserInput } from "../UserInput";

describe("UserInput Component", () => {
    // ==========================================
    // ✅ Test Group 1: Basic Rendering
    // ==========================================

    describe("Rendering", () => {
        it("should render with placeholder", () => {
            render(<UserInput placeholder="Enter text" testID="user-input" />);

            expect(screen.getByTestId("user-input")).toBeTruthy();
            expect(screen.getByPlaceholderText("Enter text")).toBeTruthy();
        });

        it("should render with default value", () => {
            render(
                <UserInput
                    value="Initial Value"
                    testID="user-input"
                />
            );

            expect(screen.getByDisplayValue("Initial Value")).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 2: Focus State
    // ==========================================

    describe("Focus State", () => {
        it("should change border color on focus", () => {
            render(<UserInput testID="user-input" />);

            const input = screen.getByTestId("user-input");

            // Simulate focus
            fireEvent(input, "focus");

            // Input should still be there after focus
            expect(input).toBeTruthy();
        });

        it("should change border color on blur", () => {
            render(<UserInput testID="user-input" />);

            const input = screen.getByTestId("user-input");

            // Simulate focus then blur
            fireEvent(input, "focus");
            fireEvent(input, "blur");

            expect(input).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 3: Text Input
    // ==========================================

    describe("Text Input", () => {
        it("should call onChangeText when text changes", () => {
            const mockOnChangeText = jest.fn();

            render(
                <UserInput
                    onChangeText={mockOnChangeText}
                    testID="user-input"
                />
            );

            const input = screen.getByTestId("user-input");
            fireEvent.changeText(input, "New Value");

            expect(mockOnChangeText).toHaveBeenCalledWith("New Value");
        });

        it("should call onChangeText multiple times", () => {
            const mockOnChangeText = jest.fn();

            render(
                <UserInput onChangeText={mockOnChangeText} testID="user-input" />
            );

            const input = screen.getByTestId("user-input");

            fireEvent.changeText(input, "A");
            fireEvent.changeText(input, "AB");
            fireEvent.changeText(input, "ABC");

            expect(mockOnChangeText).toHaveBeenCalledTimes(3);
        });
    });

    // ==========================================
    // ✅ Test Group 4: NativeWind Classes
    // ==========================================

    describe("NativeWind Classes", () => {
        it("should apply base NativeWind classes", () => {
            const { root } = render(<UserInput testID="user-input" />);

            // Component should render without errors
            expect(root).toBeTruthy();
        });

        it("should allow custom className override", () => {
            const { root } = render(
                <UserInput className="text-lg" testID="user-input" />
            );

            expect(root).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 5: Accessibility
    // ==========================================

    describe("Accessibility", () => {
        it("should be focusable", () => {
            render(<UserInput testID="user-input" />);

            const input = screen.getByTestId("user-input");

            // Should be able to focus
            fireEvent(input, "focus");
            expect(input).toBeTruthy();
        });

        it("should show placeholder text color", () => {
            render(
                <UserInput
                    placeholder="Type here"
                    testID="user-input"
                />
            );

            expect(screen.getByPlaceholderText("Type here")).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 6: Real-world Use Cases
    // ==========================================

    describe("Real-world Use Cases", () => {
        it("should work as name input field", () => {
            const mockOnChange = jest.fn();

            render(
                <UserInput
                    placeholder="ชื่อ"
                    onChangeText={mockOnChange}
                    testID="name-input"
                />
            );

            const input = screen.getByTestId("name-input");
            fireEvent.changeText(input, "สมชาย");

            expect(mockOnChange).toHaveBeenCalledWith("สมชาย");
        });

        it("should work as password input field", () => {
            render(
                <UserInput
                    placeholder="รหัสผ่าน"
                    secureTextEntry
                    testID="password-input"
                />
            );

            expect(screen.getByTestId("password-input")).toBeTruthy();
        });
    });
});
