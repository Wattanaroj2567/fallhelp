import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";
import { WizardLayout } from "../WizardLayout";

// Simple string mocks for external dependencies only
jest.mock("@expo/vector-icons", () => ({
    Ionicons: "Ionicons",
    MaterialIcons: "MaterialIcons",
}));

jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 44, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: "SafeAreaView",
}));

jest.mock("react-native-keyboard-aware-scroll-view", () => ({
    KeyboardAwareScrollView: "KeyboardAwareScrollView",
}));

// Don't mock ScreenHeader and ScreenWrapper - let WizardLayout use real components
// This allows title prop to be rendered correctly

describe("WizardLayout Component", () => {
    const defaultProps = {
        currentStep: 1 as const,
        title: "ข้อมูลผู้สูงอายุ",
        onBack: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // ✅ Test Group 1: Basic Rendering
    // ==========================================

    describe("Rendering", () => {
        it("should render children content", () => {
            render(
                <WizardLayout {...defaultProps}>
                    <Text testID="child-content">Form Content</Text>
                </WizardLayout>
            );

            expect(screen.getByTestId("child-content")).toBeTruthy();
            expect(screen.getByText("Form Content")).toBeTruthy();
        });

        it("should render with valid props", () => {
            const { root } = render(
                <WizardLayout {...defaultProps}>
                    <Text>Content</Text>
                </WizardLayout>
            );

            expect(root).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 2: Progress Bar Steps
    // ==========================================

    describe("Progress Bar Steps", () => {
        it("should show step 1 label", () => {
            render(
                <WizardLayout {...defaultProps} currentStep={1}>
                    <Text>Step 1 Content</Text>
                </WizardLayout>
            );

            expect(screen.getByText(/กรอกข้อมูล/)).toBeTruthy();
        });

        it("should show step 2 content", () => {
            render(
                <WizardLayout {...defaultProps} currentStep={2} title="ติดตั้งอุปกรณ์">
                    <Text>Step 2 Content</Text>
                </WizardLayout>
            );

            expect(screen.getByText("Step 2 Content")).toBeTruthy();
        });

        it("should show step 3 content", () => {
            render(
                <WizardLayout {...defaultProps} currentStep={3} title="ตั้งค่า WiFi">
                    <Text>Step 3 Content</Text>
                </WizardLayout>
            );

            expect(screen.getByText("Step 3 Content")).toBeTruthy();
        });

        it("should render all step labels", () => {
            render(
                <WizardLayout {...defaultProps}>
                    <Text>Content</Text>
                </WizardLayout>
            );

            // Use getAllByText as labels may match multiple elements
            expect(screen.getAllByText(/ผู้สูงอายุ/).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/ติดตั้งอุปกรณ์/).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/WiFi/).length).toBeGreaterThan(0);
        });
    });

    // ==========================================
    // ✅ Test Group 3: Transparent Mode
    // ==========================================

    describe("Transparent Mode", () => {
        it("should support transparent mode", () => {
            const { root } = render(
                <WizardLayout {...defaultProps} transparent={true}>
                    <Text>Camera Content</Text>
                </WizardLayout>
            );

            expect(root).toBeTruthy();
            expect(screen.getByText("Camera Content")).toBeTruthy();
        });

        it("should render children in transparent mode", () => {
            render(
                <WizardLayout {...defaultProps} transparent={true}>
                    <Text testID="transparent-content">Overlay Content</Text>
                </WizardLayout>
            );

            expect(screen.getByTestId("transparent-content")).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 4: Real-world Use Cases
    // ==========================================

    describe("Real-world Use Cases", () => {
        it("should work as Step 1 Elder Info screen", () => {
            render(
                <WizardLayout
                    currentStep={1}
                    title="ข้อมูลผู้สูงอายุ"
                    onBack={jest.fn()}
                >
                    <Text>Elder Form</Text>
                </WizardLayout>
            );

            expect(screen.getByText("Elder Form")).toBeTruthy();
        });

        it("should work as Step 2 Device Pairing screen", () => {
            render(
                <WizardLayout
                    currentStep={2}
                    title="ติดตั้งอุปกรณ์"
                    onBack={jest.fn()}
                    transparent={true}
                >
                    <Text>Camera View</Text>
                </WizardLayout>
            );

            expect(screen.getByText("Camera View")).toBeTruthy();
        });

        it("should work as Step 3 WiFi Setup screen", () => {
            render(
                <WizardLayout
                    currentStep={3}
                    title="ตั้งค่า WiFi"
                    onBack={jest.fn()}
                >
                    <Text>WiFi Form</Text>
                </WizardLayout>
            );

            expect(screen.getByText("WiFi Form")).toBeTruthy();
        });
    });
});
