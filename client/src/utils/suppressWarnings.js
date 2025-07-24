// Suppress development warnings in production
if (import.meta.env.PROD) {
  // Suppress React DevTools warning
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    if (message.includes('Download the React DevTools')) {
      return; // Suppress this specific warning
    }
    originalConsoleLog.apply(console, args);
  };

  // Suppress other development warnings
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('otp-credentials') || 
        message.includes('Unrecognized feature')) {
      return; // Suppress these warnings
    }
    originalConsoleWarn.apply(console, args);
  };
}
