declare module 'express-session' {
  interface SessionData {
    $$apiCallPermissionTime?: number;
  }
}

export {};
