import Toast from 'react-native-toast-message';

import {
  consumeQueuedSuccessToast,
  queueSuccessToastForNextScreen,
  showSuccessToast,
  showSuccessToastOnNextFrame,
} from '../../utils/toast';

const mockedToastShow = Toast.show as jest.Mock;

describe('toast helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedToastShow.mockClear();
    consumeQueuedSuccessToast();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows success toast immediately', () => {
    showSuccessToast('บันทึกสำเร็จ');

    expect(mockedToastShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        text1: 'บันทึกสำเร็จ',
        position: 'top',
      }),
    );
  });

  it('shows success toast on the next frame', () => {
    showSuccessToastOnNextFrame('เพิ่มผู้ติดต่อแล้ว');

    expect(mockedToastShow).not.toHaveBeenCalled();

    jest.advanceTimersByTime(16);
    expect(mockedToastShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        text1: 'เพิ่มผู้ติดต่อแล้ว',
        position: 'top',
      }),
    );
  });

  it('queues success toast for the next focused screen once', () => {
    queueSuccessToastForNextScreen('อัปเดตผู้ติดต่อแล้ว');

    expect(consumeQueuedSuccessToast()).toBe('อัปเดตผู้ติดต่อแล้ว');
    expect(consumeQueuedSuccessToast()).toBeNull();
  });
});
