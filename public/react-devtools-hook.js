// Polyfills for Next.js browser environment
(function () {
  'use strict';

  // Create React DevTools hook stub
  if (typeof window !== 'undefined') {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ =
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {
        isDisabled: true,
        supportsFiber: true,
        renderers: new Map(),
        inject: function () {},
        onCommitFiberRoot: function () {},
        onCommitFiberUnmount: function () {},
        onScheduleFiberRoot: function () {},
        checkDCE: function () {},
        injectIntoGlobalHook: function () {},
      };
  }
})();
