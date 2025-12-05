import { router } from 'expo-router';
import Logger from '@/utils/logger';

/**
 * Safe router that uses the global router object instead of hooks
 * This avoids navigation context issues during initial render
 */
export const useSafeRouter = () => {
  return {
    push: (route: any) => {
      try {
        router.push(route);
      } catch (e) {
        Logger.warn('Navigation failed (push):', e);
      }
    },
    
    replace: (route: any) => {
      try {
        router.replace(route);
      } catch (e) {
        Logger.warn('Navigation failed (replace):', e);
      }
    },
    
    back: () => {
      try {
        router.back();
      } catch (e) {
        Logger.warn('Navigation failed (back):', e);
      }
    },
    
    canGoBack: () => {
      try {
        return router.canGoBack();
      } catch (e) {
        return false;
      }
    },
    
    dismiss: () => {
      try {
        router.dismiss();
      } catch (e) {
        Logger.warn('Navigation failed (dismiss):', e);
      }
    },
  };
};

export default useSafeRouter;
