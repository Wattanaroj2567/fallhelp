# 🎯 Test Strategy: Complete Screen Coverage

**Date**: December 10, 2025  
**Project**: FallHelp Mobile Application  
**Objective**: Comprehensive test coverage for all 33 screens

---

## 📊 Current Status

**Tested**: 0/33 screens (0%)  
**Strategy**: Prioritized phased implementation

---

## 🗂️ Screen Inventory & Test Priority

### Priority 1: Critical User Flows ⭐⭐⭐ (Must Have)

#### Authentication Screens (6 screens)

| Screen             | Path                         | Complexity | Test Focus                                             |
| ------------------ | ---------------------------- | ---------- | ------------------------------------------------------ |
| ✅ Login           | `(auth)/login.tsx`           | Medium     | Form validation, API calls, role check, navigation     |
| ✅ Register        | `(auth)/register.tsx`        | High       | Multi-field validation, gender picker, API integration |
| ✅ Forgot Password | `(auth)/forgot-password.tsx` | Low        | Email validation, OTP request                          |
| ⬜ Verify OTP      | `(auth)/verify-otp.tsx`      | Medium     | 6-digit OTP input, timer, resend logic                 |
| ✅ Reset Password  | `(auth)/reset-password.tsx`  | Medium     | Password validation, match checking                    |
| ⬜ Success Screen  | `(auth)/success.tsx`         | Low        | Display success message, auto-redirect                 |

**Why Priority 1**: Authentication is the entry point - must work flawlessly

#### Setup Flow (4 screens)

| Screen                    | Path                               | Complexity | Test Focus                                    |
| ------------------------- | ---------------------------------- | ---------- | --------------------------------------------- |
| ⬜ Step 1: Elder Info     | `(setup)/step1-elder-info.tsx`     | High       | Complex form, date picker, validation, scroll |
| ⬜ Step 2: Device Pairing | `(setup)/step2-device-pairing.tsx` | High       | BLE scanning, pairing logic, error handling   |
| ⬜ Step 3: WiFi Setup     | `(setup)/step3-wifi-setup.tsx`     | High       | WiFi list, password input, connection         |
| ⬜ Saved Success          | `(setup)/saved-success.tsx`        | Low        | Success display, navigation to home           |

**Why Priority 1**: First-time user experience - critical for onboarding

#### Main Tabs (3 screens)

| Screen       | Path                  | Complexity | Test Focus                                   |
| ------------ | --------------------- | ---------- | -------------------------------------------- |
| ⬜ Dashboard | `(tabs)/index.tsx`    | High       | Event display, real-time updates, navigation |
| ⬜ History   | `(tabs)/history.tsx`  | Medium     | Event list, filtering, pagination            |
| ⬜ Settings  | `(tabs)/settings.tsx` | Medium     | Navigation to sub-screens, logout            |

**Why Priority 1**: Core app functionality used daily

---

### Priority 2: Feature Screens ⭐⭐ (Should Have)

#### Elder Management (2 screens)

| Screen           | Path                           | Complexity | Test Focus                     |
| ---------------- | ------------------------------ | ---------- | ------------------------------ |
| ⬜ Elder Profile | `(features)/(elder)/index.tsx` | Medium     | Display elder info, navigation |
| ⬜ Edit Elder    | `(features)/(elder)/edit.tsx`  | High       | Form validation, update API    |

#### Emergency Contacts (4 screens)

| Screen            | Path                               | Complexity | Test Focus                        |
| ----------------- | ---------------------------------- | ---------- | --------------------------------- |
| ⬜ Contact List   | `(features)/(emergency)/index.tsx` | Medium     | List display, delete, navigation  |
| ⬜ Add Contact    | `(features)/(emergency)/add.tsx`   | Medium     | Form validation, phone validation |
| ⬜ Edit Contact   | `(features)/(emergency)/edit.tsx`  | Medium     | Load data, update API             |
| ⬜ Emergency Call | `(features)/(emergency)/call.tsx`  | High       | Call logic, emergency handling    |

#### Device Management (2 screens)

| Screen            | Path                                  | Complexity | Test Focus            |
| ----------------- | ------------------------------------- | ---------- | --------------------- |
| ⬜ Device Pairing | `(features)/(device)/pairing.tsx`     | High       | BLE scanning, pairing |
| ⬜ WiFi Config    | `(features)/(device)/wifi-config.tsx` | High       | WiFi reconfiguration  |

#### Monitoring (2 screens)

| Screen            | Path                                         | Complexity | Test Focus                     |
| ----------------- | -------------------------------------------- | ---------- | ------------------------------ |
| ⬜ Notifications  | `(features)/(monitoring)/notifications.tsx`  | Medium     | Push notification list         |
| ⬜ Report Summary | `(features)/(monitoring)/report-summary.tsx` | High       | Statistics, charts, date range |

---

### Priority 3: User Management ⭐ (Nice to Have)

#### Profile Management (5 screens)

| Screen             | Path                                              | Complexity | Test Focus                     |
| ------------------ | ------------------------------------------------- | ---------- | ------------------------------ |
| ⬜ Profile View    | `(features)/(user)/(profile)/index.tsx`           | Low        | Display user info              |
| ⬜ Edit Info       | `(features)/(user)/(profile)/edit-info.tsx`       | Medium     | Form validation                |
| ⬜ Change Email    | `(features)/(user)/(profile)/change-email.tsx`    | Medium     | Email validation, verification |
| ⬜ Change Phone    | `(features)/(user)/(profile)/edit-phone.tsx`      | Medium     | Phone validation               |
| ⬜ Change Password | `(features)/(user)/(profile)/change-password.tsx` | Medium     | Password validation, match     |

#### Member Management (3 screens)

| Screen           | Path                                  | Complexity | Test Focus             |
| ---------------- | ------------------------------------- | ---------- | ---------------------- |
| ⬜ Members List  | `(features)/(user)/members.tsx`       | Low        | Display members        |
| ⬜ Invite Member | `(features)/(user)/invite-member.tsx` | Medium     | Email/phone validation |
| ⬜ Feedback      | `(features)/(user)/feedback.tsx`      | Low        | Text input, submission |

#### Other (2 screens)

| Screen         | Path                      | Complexity | Test Focus                  |
| -------------- | ------------------------- | ---------- | --------------------------- |
| ⬜ Empty State | `(setup)/empty-state.tsx` | Low        | Display message, navigation |
| ⬜ Modal       | `app/modal.tsx`           | Low        | Modal display logic         |

---

## 🎯 Testing Approach by Screen Type

### 1. Form Screens (High Priority)

**Examples**: Login, Register, Elder Info, Emergency Contact Add/Edit

**Test Strategy**:

- ✅ Rendering with all form fields
- ✅ Input validation (required, format, length)
- ✅ Error message display
- ✅ Successful submission flow
- ✅ API error handling
- ✅ Loading states
- ✅ Navigation after success

**Sample Test Structure**:

```typescript
describe("ScreenName", () => {
  describe("Rendering", () => {
    it("should render all form fields");
    it("should render submit button");
  });

  describe("Validation", () => {
    it("should show error for empty required fields");
    it("should validate email format");
    it("should validate phone format");
  });

  describe("Submission", () => {
    it("should call API with correct data");
    it("should navigate on success");
    it("should show error on API failure");
  });

  describe("Loading States", () => {
    it("should disable button while loading");
    it("should show loading indicator");
  });
});
```

### 2. List Screens (Medium Priority)

**Examples**: History, Emergency Contacts, Members

**Test Strategy**:

- ✅ Rendering empty state
- ✅ Rendering with data
- ✅ Navigation to detail/edit
- ✅ Delete functionality
- ✅ Pull to refresh
- ✅ Pagination (if applicable)

**Sample Test Structure**:

```typescript
describe("ListScreen", () => {
  describe("Empty State", () => {
    it("should show empty message when no data");
  });

  describe("With Data", () => {
    it("should render list items");
    it("should navigate to detail on press");
  });

  describe("Actions", () => {
    it("should delete item on delete press");
    it("should refresh on pull down");
  });
});
```

### 3. Display Screens (Low Priority)

**Examples**: Dashboard, Elder Profile, Report Summary

**Test Strategy**:

- ✅ Rendering with data
- ✅ Loading states
- ✅ Error states
- ✅ Navigation actions
- ✅ Real-time updates (if applicable)

**Sample Test Structure**:

```typescript
describe("DisplayScreen", () => {
  describe("Loading", () => {
    it("should show loading indicator");
  });

  describe("With Data", () => {
    it("should display all information correctly");
    it("should format data properly");
  });

  describe("Error State", () => {
    it("should show error message on API failure");
  });
});
```

### 4. Complex Interaction Screens (Highest Priority)

**Examples**: Device Pairing, WiFi Setup, Emergency Call

**Test Strategy**:

- ✅ Multi-step flows
- ✅ State management
- ✅ Error recovery
- ✅ Timeout handling
- ✅ Permission requests
- ✅ Native module mocking

**Sample Test Structure**:

```typescript
describe("ComplexScreen", () => {
  describe("Step 1: Scanning", () => {
    it("should start scan on mount");
    it("should display found devices");
    it("should handle scan errors");
  });

  describe("Step 2: Connection", () => {
    it("should connect to selected device");
    it("should show progress indicator");
    it("should handle connection failure");
  });

  describe("Step 3: Verification", () => {
    it("should verify connection");
    it("should navigate on success");
  });
});
```

---

## 📋 Implementation Plan

### Phase 4: Priority 1 Screens (13 screens)

**Timeline**: 2-3 days  
**Estimated Tests**: ~150-200 tests

#### Week 1: Authentication (6 screens)

- [x] Login ✅ (Already done - moved from here)
- [x] Register ✅ (Already done - moved from here)
- [x] Forgot Password ✅ (Already done - moved from here)
- [ ] Verify OTP
- [x] Reset Password ✅ (Already done - moved from here)
- [ ] Success Screen

#### Week 1: Setup Flow (4 screens)

- [ ] Step 1: Elder Info
- [ ] Step 2: Device Pairing
- [ ] Step 3: WiFi Setup
- [ ] Saved Success

#### Week 1: Main Tabs (3 screens)

- [ ] Dashboard
- [ ] History
- [ ] Settings

### Phase 5: Priority 2 Screens (10 screens)

**Timeline**: 2-3 days  
**Estimated Tests**: ~100-130 tests

#### Week 2: Elder & Emergency (6 screens)

- [ ] Elder Profile
- [ ] Edit Elder
- [ ] Emergency Contact List
- [ ] Add Emergency Contact
- [ ] Edit Emergency Contact
- [ ] Emergency Call

#### Week 2: Device & Monitoring (4 screens)

- [ ] Device Pairing (re-config)
- [ ] WiFi Config (re-config)
- [ ] Notifications
- [ ] Report Summary

### Phase 6: Priority 3 Screens (10 screens)

**Timeline**: 1-2 days  
**Estimated Tests**: ~70-90 tests

#### Week 3: Profile & Members (8 screens)

- [ ] Profile View
- [ ] Edit Info
- [ ] Change Email
- [ ] Change Phone
- [ ] Change Password
- [ ] Members List
- [ ] Invite Member
- [ ] Feedback

#### Week 3: Other (2 screens)

- [ ] Empty State
- [ ] Modal

---

## 🛠️ Testing Tools & Utilities

### Shared Test Utilities to Create

```typescript
// test-utils/screen-test-helpers.ts

export const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={AppTheme}>{component}</PaperProvider>
    </QueryClientProvider>
  );
};

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn(),
};

export const mockAuth = {
  signIn: jest.fn(),
  signOut: jest.fn(),
  isSignedIn: false,
  isLoading: false,
};

export const fillForm = (
  getByTestId: (id: string) => any,
  formData: Record<string, string>
) => {
  Object.entries(formData).forEach(([testId, value]) => {
    fireEvent.changeText(getByTestId(testId), value);
  });
};
```

### Mock Data Factories

```typescript
// test-utils/mock-data.ts

export const mockElderFactory = (overrides?: Partial<Elder>): Elder => ({
  id: "1",
  firstName: "สมชาย",
  lastName: "ใจดี",
  dateOfBirth: "1950-01-01",
  gender: "MALE",
  ...overrides,
});

export const mockEventFactory = (overrides?: Partial<Event>): Event => ({
  id: "1",
  type: "FALL",
  severity: "CRITICAL",
  timestamp: "2024-01-15T10:30:00Z",
  elderId: "elder-1",
  deviceId: "device-1",
  ...overrides,
});

export const mockEmergencyContactFactory = (
  overrides?: Partial<EmergencyContact>
): EmergencyContact => ({
  id: "1",
  name: "น้องสาว",
  phoneNumber: "0812345678",
  relationship: "SISTER",
  ...overrides,
});
```

---

## 📊 Success Metrics

| Metric              | Target       | Current   |
| ------------------- | ------------ | --------- |
| **Screen Coverage** | 33/33 (100%) | 0/33 (0%) |
| **Total Tests**     | ~320-420     | 103       |
| **Pass Rate**       | 100%         | 100%      |
| **Execution Time**  | < 30s        | ~2.5s     |

---

## 🚨 Testing Challenges & Solutions

### Challenge 1: Native Module Mocking

**Screens Affected**: Device Pairing, WiFi Setup, Emergency Call

**Solution**:

```typescript
// Mock react-native-ble-plx
jest.mock("react-native-ble-plx", () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    connectToDevice: jest.fn(),
  })),
}));

// Mock expo-network
jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    type: "WIFI",
    isConnected: true,
  }),
}));
```

### Challenge 2: Real-time Updates

**Screens Affected**: Dashboard, Notifications

**Solution**:

```typescript
// Use React Query's test utilities
import { waitFor } from "@testing-library/react-native";

it("should update on new event", async () => {
  const { getByText } = renderScreen();

  // Trigger refetch
  act(() => {
    queryClient.setQueryData(["events"], newEventData);
  });

  await waitFor(() => {
    expect(getByText("New Event")).toBeTruthy();
  });
});
```

### Challenge 3: Complex Forms

**Screens Affected**: Elder Info, Register, Edit Elder

**Solution**:

```typescript
// Use custom form helpers
const { fillForm, submitForm } = useFormTestHelpers();

it("should submit form with all fields", async () => {
  const { getByTestId } = renderScreen();

  fillForm({
    "firstName-input": "สมชาย",
    "lastName-input": "ใจดี",
    "birthDate-input": "1950-01-01",
  });

  await submitForm(getByTestId("submit-button"));

  expect(mockApi.createElder).toHaveBeenCalledWith({
    firstName: "สมชาย",
    lastName: "ใจดี",
    birthDate: "1950-01-01",
  });
});
```

---

## 🎯 Recommended Testing Order

### Start Here (Immediate Value)

1. ✅ **Dashboard** (`(tabs)/index.tsx`) - Most used screen
2. ✅ **History** (`(tabs)/history.tsx`) - Second most used
3. ✅ **Emergency Call** (`(features)/(emergency)/call.tsx`) - Critical safety feature

### Then (User Flows)

4. ✅ **Setup Flow** (3 screens) - Complete onboarding flow
5. ✅ **Emergency Contacts** (4 screens) - Safety critical
6. ✅ **Elder Management** (2 screens) - Core functionality

### Finally (Completeness)

7. ✅ **Profile Management** (5 screens)
8. ✅ **Member Management** (3 screens)
9. ✅ **Remaining screens** (simple screens)

---

## 📝 Test File Naming Convention

```
app/(auth)/login.tsx          → app/__tests__/login.test.tsx
app/(tabs)/index.tsx          → app/__tests__/dashboard.test.tsx
app/(features)/(elder)/index.tsx → app/__tests__/elder-profile.test.tsx
```

**Pattern**: `app/__tests__/[descriptive-name].test.tsx`

---

## 🎉 Benefits of Complete Coverage

1. **Confidence in Releases**

   - Can deploy knowing every screen is tested
   - Catch regressions before production

2. **Refactoring Safety**

   - Change code with confidence
   - Tests act as safety net

3. **Documentation**

   - Tests show how screens should behave
   - New team members can learn from tests

4. **Bug Prevention**

   - Catch issues during development
   - Reduce QA time

5. **Code Quality**
   - Forces better component design
   - Encourages separation of concerns

---

## 🚀 Next Steps

### Option A: Continue from Priority 1 (Recommended)

Start with most critical screens that users interact with daily

**Benefits**:

- Immediate value from testing critical paths
- Build momentum with important screens first
- Learn patterns before tackling complex screens

**Start with**: Dashboard, History, Setup Flow

### Option B: Complete by Feature Area

Test all related screens together

**Benefits**:

- Better context switching
- Reuse mocks and utilities within feature
- Complete feature coverage

**Start with**: Emergency Contact feature (4 screens)

### Option C: Easiest to Hardest

Start with simple screens to build confidence

**Benefits**:

- Quick wins
- Build testing patterns
- Gradual complexity increase

**Start with**: Success Screen, Empty State, Modal

---

## 💡 My Recommendation

**แนะนำแบบ Hybrid Approach**:

### Week 1 (Priority: Critical Flows)

1. Dashboard - Most used, high impact
2. History - Second most used
3. Verify OTP - Complete auth flow
4. Success Screen - Simple, quick win

**Estimated**: ~40-50 tests

### Week 2 (Priority: Safety Critical)

5. Emergency Call - Life safety feature
6. Emergency Contact List
7. Add Emergency Contact
8. Edit Emergency Contact

**Estimated**: ~40-50 tests

### Week 3 (Priority: Onboarding)

9. Step 1: Elder Info
10. Step 2: Device Pairing
11. Step 3: WiFi Setup
12. Saved Success

**Estimated**: ~50-60 tests

### Week 4+ (Priority: Completeness)

Continue with remaining screens in priority order

---

## 🎯 สรุป

**คุณคิดถูกแล้วครับ** ที่อยากให้เทสทุกหน้า เพราะ:

✅ **ทำได้**: มี 33 screens แต่หลายหน้าไม่ซับซ้อนมาก  
✅ **คุ้มค่า**: จะช่วยป้องกัน bugs ในระยะยาว  
✅ **เป็นมาตรฐาน**: Production app ควรมี test coverage ที่ดี

**แต่ต้องทำแบบ strategic** ไม่ใช่ทำทีเดียวทั้งหมด:

- เริ่มจาก critical screens ก่อน
- Build testing utilities ระหว่างทาง
- ทำทีละ feature area เพื่อ reuse mocks

**คำถาม**: คุณอยากเริ่มจาก approach ไหน?

1. **Dashboard + History** (User impact สูงสุด)
2. **Emergency features** (Safety critical)
3. **Setup flow** (Complete onboarding)
4. **ง่ายที่สุดก่อน** (Build confidence)

บอกมาได้เลยครับ ผมจะเริ่มสร้าง tests ให้ทันที! 🚀
