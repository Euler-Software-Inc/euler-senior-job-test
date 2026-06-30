import { describe, expect, it } from 'vitest'

// A trivial test so `npm test` is green out of the box and the test runner is
// known to work. Replace/extend with the real access-control tests for Task 1c
// (see access-control.example.test.ts for the intended shape).
describe('smoke', () => {
  it('runs the test runner', () => {
    expect(1 + 1).toBe(2)
  })
})
