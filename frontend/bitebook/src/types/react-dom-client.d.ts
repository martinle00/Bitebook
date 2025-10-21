// Minimal declaration to satisfy TypeScript for react-dom/client in this workspace
// Prefer installing @types/react-dom in devDependencies for full types.
declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): any;
}
