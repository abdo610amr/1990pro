export {};

declare global {
  interface Window {
    posDesktop?: {
      isElectron: boolean;
      openExternal: (url: string) => Promise<void>;
      print: () => Promise<boolean>;
      platform: () => Promise<{
        platform: string;
        isElectron: boolean;
        isDev: boolean;
      }>;
    };
  }
}
