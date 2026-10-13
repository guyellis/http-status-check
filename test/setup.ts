/* eslint-disable no-console */
import { afterEach, beforeEach, expect, vi } from 'vitest';

const CONSOLE_METHODS = ['log', 'info', 'warn', 'error', 'debug', 'dir', 'trace'] as const;

type ConsoleMethod = (typeof CONSOLE_METHODS)[number];

interface GuardState {
  asserted: boolean;
  calls: unknown[][];
  spy: ReturnType<typeof vi.spyOn> | null;
}

const guards = new Map<ConsoleMethod, GuardState>();

for (const method of CONSOLE_METHODS) {
  guards.set(method, {
    asserted: false,
    calls: [],
    spy: null,
  });
}

function installGuard(method: ConsoleMethod) {
  const guard = guards.get(method)!;
  guard.asserted = false;
  guard.calls = [];

  const spy = vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
    guard.calls.push(args);
  });

  const originalRestore = spy.mockRestore.bind(spy);
  spy.mockRestore = () => {
    originalRestore();
    installGuard(method);
  };

  guard.spy = spy;
  return spy;
}

// Track when a console spy or console method is asserted against
type ExpectFn = (actual: unknown, ...args: unknown[]) => unknown;
const globalObj = globalThis as unknown as { expect?: ExpectFn };
const originalExpect = globalObj.expect ?? (expect as unknown as ExpectFn | undefined);
if (originalExpect) {
  const wrappedExpect = function (actual: unknown, ...args: unknown[]) {
    for (const [method, guard] of guards.entries()) {
      if (
        actual === console[method] ||
        actual === guard.spy ||
        actual === guard.spy?.mock ||
        actual === guard.spy?.mock?.calls
      ) {
        guard.asserted = true;
      }
    }
    return originalExpect(actual, ...args);
  };
  Object.assign(wrappedExpect, originalExpect);
  globalObj.expect = wrappedExpect as ExpectFn;
}

beforeEach(() => {
  for (const method of CONSOLE_METHODS) {
    installGuard(method);
  }
});

afterEach(() => {
  const unassertedErrors: string[] = [];

  for (const [method, guard] of guards.entries()) {
    const callCount = guard.calls.length;
    if (callCount > 0 && !guard.asserted) {
      const formattedCalls = guard.calls
        .map((c) =>
          c.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' '),
        )
        .join('\n');
      unassertedErrors.push(
        `console.${method} was called ${callCount} time(s) without being asserted:\n${formattedCalls}`,
      );
    }
  }

  // Clear guards for next test
  for (const method of CONSOLE_METHODS) {
    const guard = guards.get(method);
    if (guard?.spy) {
      guard.spy.mockClear();
      guard.calls = [];
      guard.asserted = false;
    }
  }

  if (unassertedErrors.length > 0) {
    throw new Error(
      `Console output detected during test without explicit assertion:\n${unassertedErrors.join(
        '\n\n',
      )}`,
    );
  }
});
