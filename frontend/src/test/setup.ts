import '@testing-library/jest-dom'

// Mock des variables d'environnement
if (typeof global !== 'undefined') {
  (global as any).VITE_API_URL = 'http://localhost:5000'
}

// Mock de localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null
}
if (typeof global !== 'undefined') {
  global.localStorage = localStorageMock
}

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null
}
if (typeof global !== 'undefined') {
  global.sessionStorage = sessionStorageMock
}

// Mock de fetch
if (typeof global !== 'undefined') {
  global.fetch = () => Promise.resolve({} as Response)
}

// Mock de window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })
}

// Mock de ResizeObserver
if (typeof global !== 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Mock de IntersectionObserver
if (typeof global !== 'undefined') {
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    root: Element | null = null
    rootMargin: string = ''
    thresholds: ReadonlyArray<number> = []
    takeRecords(): IntersectionObserverEntry[] { return [] }
  }
}

// Mock de URL.createObjectURL
if (typeof global !== 'undefined') {
  global.URL.createObjectURL = () => 'mocked-url'
  global.URL.revokeObjectURL = () => {}
}

// Mock de DOMPurify
const mockDOMPurify = {
  sanitize: (input: string, config?: any) => {
    if (config && config.ALLOWED_TAGS && config.ALLOWED_TAGS.length === 0) {
      return input.replace(/<[^>]*>/g, '')
    }
    return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
  }
}

// Mock de js-cookie
const mockJsCookie = {
  set: () => {},
  get: () => 'test-csrf-token'
}

// Mock des modules avec vi.mock
if (typeof global !== 'undefined') {
  // Mock DOMPurify
  const originalRequire = (global as any).require
  if (originalRequire) {
    (global as any).require = (id: string) => {
      if (id === 'dompurify') {
        return mockDOMPurify
      }
      if (id === 'js-cookie') {
        return mockJsCookie
      }
      return originalRequire(id)
    }
  }
  
  // Mock pour les imports ES6
  (global as any).dompurify = mockDOMPurify
  ;(global as any).jsCookie = mockJsCookie
}
