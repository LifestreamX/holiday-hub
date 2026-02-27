import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.exports = window.exports || {};
              window.module = window.module || { exports: window.exports };
              window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
                isDisabled: true,
                supportsFiber: true,
                renderers: new Map(),
                inject: function() {},
                onCommitFiberRoot: function() {},
                onCommitFiberUnmount: function() {},
                onScheduleFiberRoot: function() {},
                checkDCE: function() {},
                injectIntoGlobalHook: function() {},
                supportsProfiling: false
              };
              Object.seal(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
