declare global {
  interface Window {
    __pwaInstallPrompt: Event | null;
  }
  /** Build-time git SHA injected by vite.config.ts. Used by the version
   *  badge in MainLayout for incident-triage screenshots. */
  const __APP_VERSION__: string;
}

declare module '*.glb' {
  const src: string;
  export default src;
}

declare module 'meshline' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- third-party module with no upstream types; constructors take heterogeneous geometry args
  export const MeshLineGeometry: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- third-party module with no upstream types
  export const MeshLineMaterial: any;
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSX element augmentation for r3f extend(); typing requires three.js Object3D shape Type
    meshLineGeometry: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
    meshLineMaterial: any;
  }
}

export {};
