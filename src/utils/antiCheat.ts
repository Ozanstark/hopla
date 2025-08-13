// Anti-cheat utilities
export const initAntiCheat = () => {
  // Disable common debugging shortcuts
  try {
    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });

    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Detect developer tools opening
    let devtools = {
      open: false,
      orientation: null as string | null
    };

    const threshold = 160;
    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          // Silently handle devtools detection
          window.location.reload();
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Disable common console methods that can be used for cheating
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'console', {
        value: {
          ...console,
          log: () => {},
          error: () => {},
          warn: () => {},
          info: () => {},
          debug: () => {},
          clear: () => {},
          table: () => {},
          dir: () => {},
          dirxml: () => {},
          trace: () => {},
          assert: () => {},
          count: () => {},
          countReset: () => {},
          group: () => {},
          groupCollapsed: () => {},
          groupEnd: () => {},
          time: () => {},
          timeEnd: () => {},
          timeLog: () => {},
          profile: () => {},
          profileEnd: () => {}
        },
        writable: false,
        configurable: false
      });
    }
  } catch (error) {
    // Silent error handling
  }
};

export const validateScore = (score: number): boolean => {
  // Server-side validation will be the source of truth
  // This is just a client-side check
  return typeof score === 'number' && score >= 0 && score <= 1000;
};