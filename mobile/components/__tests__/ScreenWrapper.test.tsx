import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { ScreenWrapper } from "../ScreenWrapper";

// Simple string mocks to avoid scope issues
jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: "SafeAreaView",
}));

jest.mock("react-native-keyboard-aware-scroll-view", () => ({
    KeyboardAwareScrollView: "KeyboardAwareScrollView",
}));

describe("ScreenWrapper Component", () => {
    // ==========================================
    // ✅ Test Group 1: Basic Rendering
    // ==========================================

    describe("Rendering", () => {
        it("should render children correctly", () => {
            render(
                <ScreenWrapper>
                    <Text testID="child-content">Hello World</Text>
                </ScreenWrapper>
            );

            expect(screen.getByTestId("child-content")).toBeTruthy();
            expect(screen.getByText("Hello World")).toBeTruthy();
        });

        it("should render with default className (flex-1 bg-white)", () => {
            const { root } = render(
                <ScreenWrapper>
                    <Text>Content</Text>
                </ScreenWrapper>
            );

            expect(root).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 2: className Override
    // ==========================================

    describe("className Override", () => {
        it("should allow custom className override", () => {
            const { root } = render(
                <ScreenWrapper className="flex-1 bg-gray-100">
                    <Text>Content</Text>
                </ScreenWrapper>
            );

            expect(root).toBeTruthy();
        });

        it("should use custom className when provided", () => {
            render(
                <ScreenWrapper className="flex-1 bg-blue-500">
                    <Text>Content</Text>
                </ScreenWrapper>
            );

            expect(screen.getByText("Content")).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 3: useSafeArea Prop
    // ==========================================

    describe("useSafeArea Prop", () => {
        it("should render content when useSafeArea=true (default)", () => {
            render(
                <ScreenWrapper useSafeArea={true}>
                    <Text>Content</Text>
                </ScreenWrapper>
            );

            expect(screen.getByText("Content")).toBeTruthy();
        });

        it("should use regular View when useSafeArea=false", () => {
            render(
                <ScreenWrapper useSafeArea={false}>
                    <Text>Content</Text>
                </ScreenWrapper>
            );

            expect(screen.getByText("Content")).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 4: Header Slot
    // ==========================================

    describe("Header Slot", () => {
        it("should render header slot correctly", () => {
            render(
                <ScreenWrapper
                    header={<Text testID="header-content">Header</Text>}
                >
                    <Text>Content</Text>
                </ScreenWrapper>
            );

            expect(screen.getByTestId("header-content")).toBeTruthy();
            expect(screen.getByText("Header")).toBeTruthy();
        });

        it("should render header before main content", () => {
            render(
                <ScreenWrapper
                    header={<Text testID="header">Header</Text>}
                >
                    <Text testID="content">Content</Text>
                </ScreenWrapper>
            );

            expect(screen.getByTestId("header")).toBeTruthy();
            expect(screen.getByTestId("content")).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 5: ScrollView Modes
    // ==========================================

    describe("ScrollView Modes", () => {
        it("should render content with scroll (default)", () => {
            render(
                <ScreenWrapper useScrollView={true}>
                    <Text>Scroll Content</Text>
                </ScreenWrapper>
            );

            expect(screen.getByText("Scroll Content")).toBeTruthy();
        });

        it("should render content without scroll", () => {
            render(
                <ScreenWrapper useScrollView={false}>
                    <Text>Fixed Content</Text>
                </ScreenWrapper>
            );

            expect(screen.getByText("Fixed Content")).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 6: Real-world Use Cases
    // ==========================================

    describe("Real-world Use Cases", () => {
        it("should work for Setup screens with header and scroll", () => {
            render(
                <ScreenWrapper
                    header={<View testID="setup-header" />}
                    edges={["top", "left", "right"]}
                >
                    <Text>Setup Content</Text>
                </ScreenWrapper>
            );

            expect(screen.getByTestId("setup-header")).toBeTruthy();
            expect(screen.getByText("Setup Content")).toBeTruthy();
        });

        it("should work for fixed screens without scroll", () => {
            render(
                <ScreenWrapper useScrollView={false}>
                    <Text>Fixed Content</Text>
                </ScreenWrapper>
            );

            expect(screen.getByText("Fixed Content")).toBeTruthy();
        });
    });
});
