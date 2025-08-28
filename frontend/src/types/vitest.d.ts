/// <reference types="vitest/globals" />

declare module 'vitest' {
  export const describe: typeof import('vitest/globals').describe
  export const it: typeof import('vitest/globals').it
  export const expect: typeof import('vitest/globals').expect
  export const beforeEach: typeof import('vitest/globals').beforeEach
  export const afterEach: typeof import('vitest/globals').afterEach
  export const beforeAll: typeof import('vitest/globals').beforeAll
  export const afterAll: typeof import('vitest/globals').afterAll
  export const vi: typeof import('vitest/globals').vi
}
