import {
  getFormBasePadding,
  getFormBottomPadding,
  getNavigationBarInset,
} from '../../utils/navigationBarInset';

describe('getNavigationBarInset', () => {
  it('uses safe-area bottom inset when available', () => {
    expect(
      getNavigationBarInset({
        platform: 'android',
        safeAreaBottom: 24,
        windowHeight: 760,
        screenHeight: 800,
        statusBarHeight: 24,
      }),
    ).toBe(24);
  });

  it('falls back to Android system navigation height when safe-area bottom is missing', () => {
    expect(
      getNavigationBarInset({
        platform: 'android',
        safeAreaBottom: 0,
        windowHeight: 720,
        screenHeight: 800,
        statusBarHeight: 24,
      }),
    ).toBe(56);
  });

  it('uses the Android three-button navigation fallback when edge-to-edge reports zero measured inset', () => {
    expect(
      getNavigationBarInset({
        platform: 'android',
        safeAreaBottom: 0,
        windowHeight: 800,
        screenHeight: 824,
        statusBarHeight: 24,
      }),
    ).toBe(48);
  });

  it('allows Android fullscreen surfaces to opt out of the zero-measure fallback', () => {
    expect(
      getNavigationBarInset({
        platform: 'android',
        safeAreaBottom: 0,
        windowHeight: 800,
        screenHeight: 824,
        statusBarHeight: 24,
        assumeAndroidNavigationBarVisible: false,
      }),
    ).toBe(0);
  });

  it('does not invent a bottom inset on iOS when safe-area bottom is zero', () => {
    expect(
      getNavigationBarInset({
        platform: 'ios',
        safeAreaBottom: 0,
        windowHeight: 760,
        screenHeight: 800,
        statusBarHeight: 0,
      }),
    ).toBe(0);
  });
});

describe('getFormBottomPadding', () => {
  it('resolves a standard minimum form base padding', () => {
    expect(getFormBasePadding({ basePadding: 24 })).toBe(32);
  });

  it('keeps larger form base padding unchanged', () => {
    expect(getFormBasePadding({ basePadding: 40 })).toBe(40);
  });

  it('adds navigation bar inset to a form base padding', () => {
    expect(getFormBottomPadding({ basePadding: 80, navBarInset: 56 })).toBe(136);
  });

  it('keeps the base padding unchanged when there is no navigation bar inset', () => {
    expect(getFormBottomPadding({ basePadding: 80, navBarInset: 0 })).toBe(80);
  });

  it('uses a standard minimum base padding when caller does not provide one', () => {
    expect(getFormBottomPadding({ navBarInset: 24 })).toBe(56);
  });
});
