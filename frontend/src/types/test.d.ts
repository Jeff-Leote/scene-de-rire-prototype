declare module '@testing-library/react' {
  import { ReactElement } from 'react';

  export function render(ui: ReactElement, options?: any): any;
  export const screen: {
    getByText: (text: string | RegExp) => HTMLElement;
    getByPlaceholderText: (text: string) => HTMLElement;
    queryByText: (text: string | RegExp) => HTMLElement | null;
  };
  export const fireEvent: {
    click: (element: HTMLElement) => void;
    change: (element: HTMLElement, options: any) => void;
  };
  export function waitFor(callback: () => void | Promise<void>): Promise<void>;
  export function renderHook<T>(hook: () => T): { result: { current: T } };
}

declare module '@testing-library/jest-dom' {
  export function toBeInTheDocument(): void;
  export function toHaveValue(value: string): void;
  export function toBeDisabled(): void;
  export function toHaveClass(className: string): void;
}

declare module '@testing-library/user-event' {
  export function click(element: HTMLElement): Promise<void>;
  export function type(element: HTMLElement, text: string): Promise<void>;
}

declare module 'vitest/globals' {
  export const describe: any;
  export const it: any;
  export const expect: any;
  export const beforeEach: any;
  export const afterEach: any;
  export const beforeAll: any;
  export const afterAll: any;
  export const vi: any;
}

declare module 'dompurify' {
  const DOMPurify: {
    sanitize: (input: string, config?: any) => string;
  };
  export default DOMPurify;
}

declare module 'js-cookie' {
  const Cookies: {
    set: (name: string, value: string, options?: any) => void;
    get: (name: string) => string | undefined;
    remove: (name: string, options?: any) => void;
  };
  export default Cookies;
}
