import { getFormBasePadding, getFormBottomPadding } from '../utils/navigationBarInset';
import { useNavBarInset } from './useNavBarInset';

interface UseFormBottomPaddingOptions {
  readonly basePadding?: number | undefined;
}

export const useFormBottomPadding = ({ basePadding }: UseFormBottomPaddingOptions = {}): number => {
  const navBarInset = useNavBarInset();

  return getFormBottomPadding({
    basePadding,
    navBarInset,
  });
};

export const useFormBasePadding = ({ basePadding }: UseFormBottomPaddingOptions = {}): number =>
  getFormBasePadding({ basePadding });
