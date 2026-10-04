// Native Tactile Haptics Engine for Mobile APK
export function triggerHaptic(type = 'light') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;
  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(18);
        break;
      case 'success':
        navigator.vibrate([10, 30, 15]);
        break;
      case 'selection':
        navigator.vibrate(8);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch (e) {
    // silently ignore if not supported
  }
}
