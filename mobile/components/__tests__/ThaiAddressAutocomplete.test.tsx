import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react-native";
import { ThaiAddressAutocomplete } from "../ThaiAddressAutocomplete";

// Mock dependencies
jest.mock("@expo/vector-icons", () => ({
    MaterialIcons: "MaterialIcons",
}));

jest.mock("react-native-paper", () => ({
    useTheme: () => ({
        colors: {
            error: "#EF4444",
            primary: "#16AD78",
            onSurface: "#374151",
        },
    }),
}));

// Mock thailand-address.json with minimal data
jest.mock("@/assets/thailand-address.json", () => [
    {
        district: "บางรัก",
        amphoe: "บางรัก",
        province: "กรุงเทพมหานคร",
        zipcode: 10500,
    },
    {
        district: "สีลม",
        amphoe: "บางรัก",
        province: "กรุงเทพมหานคร",
        zipcode: 10500,
    },
    {
        district: "เมือง",
        amphoe: "เมือง",
        province: "เชียงใหม่",
        zipcode: 50000,
    },
]);

describe("ThaiAddressAutocomplete Component", () => {
    const defaultProps = {
        value: null,
        onChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // ==========================================
    // ✅ Test Group 1: Basic Rendering
    // ==========================================

    describe("Rendering", () => {
        it("should render placeholder when no value", () => {
            render(<ThaiAddressAutocomplete {...defaultProps} />);

            expect(
                screen.getByText(/ค้นหาที่อยู่โดยพิมพ์ตำบล/)
            ).toBeTruthy();
        });

        it("should render selected address when value is provided", () => {
            render(
                <ThaiAddressAutocomplete
                    {...defaultProps}
                    value={{
                        district: "บางรัก",
                        amphoe: "บางรัก",
                        province: "กรุงเทพมหานคร",
                        zipcode: "10500",
                    }}
                />
            );

            expect(screen.getByText(/บางรัก/)).toBeTruthy();
        });

        it("should render required indicator when isRequired=true", () => {
            render(
                <ThaiAddressAutocomplete {...defaultProps} isRequired={true} />
            );

            expect(screen.getByText("*")).toBeTruthy();
        });

        it("should render error message when error prop is provided", () => {
            render(
                <ThaiAddressAutocomplete
                    {...defaultProps}
                    error="กรุณาเลือกที่อยู่"
                />
            );

            expect(screen.getByText("กรุณาเลือกที่อยู่")).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 2: Modal Behavior
    // ==========================================

    describe("Modal Behavior", () => {
        it("should show modal on press", () => {
            render(<ThaiAddressAutocomplete {...defaultProps} />);

            const inputButton = screen.getByText(/ค้นหาที่อยู่โดยพิมพ์ตำบล/);
            fireEvent.press(inputButton);

            expect(screen.getByText("ค้นหาที่อยู่ของคุณ")).toBeTruthy();
        });

        it("should show search hint when query is less than 2 characters", () => {
            render(<ThaiAddressAutocomplete {...defaultProps} />);

            const inputButton = screen.getByText(/ค้นหาที่อยู่โดยพิมพ์ตำบล/);
            fireEvent.press(inputButton);

            expect(
                screen.getByText("พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา")
            ).toBeTruthy();
        });
    });

    // ==========================================
    // ✅ Test Group 3: Debounce Search
    // ==========================================

    describe("Debounce Search", () => {
        it("should debounce search input (300ms)", async () => {
            render(<ThaiAddressAutocomplete {...defaultProps} />);

            // Open modal
            const inputButton = screen.getByText(/ค้นหาที่อยู่โดยพิมพ์ตำบล/);
            fireEvent.press(inputButton);

            // Type in search
            const searchInput = screen.getByPlaceholderText(/ค้นหาที่อยู่โดยพิมพ์ตำบล/);
            fireEvent.changeText(searchInput, "บาง");

            // Results should not appear immediately (debounced)
            expect(screen.queryByText("บางรัก")).toBeFalsy();

            // Fast-forward 300ms
            await act(async () => {
                jest.advanceTimersByTime(300);
            });

            // Now results should appear (may have multiple matches)
            await waitFor(() => {
                expect(screen.getAllByText(/บางรัก/).length).toBeGreaterThan(0);
            });
        });
    });

    // ==========================================
    // ✅ Test Group 4: Address Selection
    // ==========================================

    describe("Address Selection", () => {
        it("should call onChange when address is selected", async () => {
            const mockOnChange = jest.fn();

            render(
                <ThaiAddressAutocomplete {...defaultProps} onChange={mockOnChange} />
            );

            // Open modal
            const inputButton = screen.getByText(/ค้นหาที่อยู่โดยพิมพ์ตำบล/);
            fireEvent.press(inputButton);

            // Type search query
            const searchInput = screen.getByPlaceholderText(/ค้นหาที่อยู่โดยพิมพ์ตำบล/);
            fireEvent.changeText(searchInput, "บาง");

            // Wait for debounce
            await act(async () => {
                jest.advanceTimersByTime(300);
            });

            // Select first result
            await waitFor(() => {
                const result = screen.getByText(/บางรัก » บางรัก/);
                fireEvent.press(result);
            });

            expect(mockOnChange).toHaveBeenCalledWith({
                district: "บางรัก",
                amphoe: "บางรัก",
                province: "กรุงเทพมหานคร",
                zipcode: "10500",
            });
        });
    });

    // ==========================================
    // ✅ Test Group 5: Empty State
    // ==========================================

    describe("Empty State", () => {
        it("should show empty state when no results found", async () => {
            render(<ThaiAddressAutocomplete {...defaultProps} />);

            // Open modal
            const inputButton = screen.getByText(/ค้นหาที่อยู่โดยพิมพ์ตำบล/);
            fireEvent.press(inputButton);

            // Type search query that won't match
            const searchInput = screen.getByPlaceholderText(/ค้นหาที่อยู่โดยพิมพ์ตำบล/);
            fireEvent.changeText(searchInput, "xyz");

            // Wait for debounce
            await act(async () => {
                jest.advanceTimersByTime(300);
            });

            // Should show empty state
            await waitFor(() => {
                expect(screen.getByText("ไม่พบที่อยู่ที่ค้นหา")).toBeTruthy();
            });
        });
    });

    // ==========================================
    // ✅ Test Group 6: Real-world Use Cases
    // ==========================================

    describe("Real-world Use Cases", () => {
        it("should work for elder address selection in Step 1", () => {
            const mockOnChange = jest.fn();

            render(
                <ThaiAddressAutocomplete
                    value={null}
                    onChange={mockOnChange}
                    isRequired={true}
                />
            );

            // Should render with required indicator
            expect(screen.getByText("*")).toBeTruthy();
            // Multiple text matches (label + placeholder) - use getAllByText
            expect(screen.getAllByText(/ค้นหาที่อยู่/).length).toBeGreaterThan(0);
        });

        it("should display previously selected address", () => {
            render(
                <ThaiAddressAutocomplete
                    value={{
                        district: "เมือง",
                        amphoe: "เมือง",
                        province: "เชียงใหม่",
                        zipcode: "50000",
                    }}
                    onChange={jest.fn()}
                />
            );

            expect(screen.getByText(/เมือง/)).toBeTruthy();
            expect(screen.getByText(/เชียงใหม่/)).toBeTruthy();
        });
    });
});
