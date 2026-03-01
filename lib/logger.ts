type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatMeta(meta: any) {
  try {
    return meta ? ` ${JSON.stringify(meta)}` : '';
  } catch (e) {
    return ' [unserializable-meta]';
  }
}

export const logger = {
  info: (msg: string, meta?: any) => {
    console.info(
      `[INFO] ${new Date().toISOString()} ${msg}${formatMeta(meta)}`,
    );
  },
  warn: (msg: string, meta?: any) => {
    console.warn(
      `[WARN] ${new Date().toISOString()} ${msg}${formatMeta(meta)}`,
    );
  },
  error: (msg: string, meta?: any) => {
    console.error(
      `[ERROR] ${new Date().toISOString()} ${msg}${formatMeta(meta)}`,
    );
  },
  debug: (msg: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        `[DEBUG] ${new Date().toISOString()} ${msg}${formatMeta(meta)}`,
      );
    }
  },
};

export default logger;
