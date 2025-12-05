// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock Expo modules that might cause issues
jest.mock("expo-font");
jest.mock("expo-asset");
