import { createElement } from 'react';

import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import useValidatedInput from '../src/console/hooks/useValidation';

function renderHookTest<TResult>(callback: () => TResult) {
  const values: { current: TResult } = { current: null! };

  const TestComponent = function () {
    values.current = callback();

    return null;
  };

  return {
    rerender: () => {
      act(() => {
        render(createElement(TestComponent));
      });
    },
    result: () => values.current
  };
}

describe('useValidatedInput', () => {
  it('initializes with undefined validation state', () => {
    const { rerender, result } = renderHookTest(() => useValidatedInput());
    rerender();

    expect(result().validated).toBeUndefined();
  });

  it('validates input without callbacks', () => {
    const { rerender, result } = renderHookTest(() => useValidatedInput());
    rerender();

    act(() => {
      result().validateInput('test');
    });

    expect(result().validated).toBe('test');
  });

  it('handles empty input when validateEmpty is true', () => {
    const mockCallback = vi.fn().mockReturnValue('Error message');
    const { rerender, result } = renderHookTest(() => useValidatedInput());
    rerender();

    act(() => {
      result().validateInput('', [mockCallback], true);
    });

    expect(mockCallback).toHaveBeenCalledWith('');
    expect(result().validated).toBe('Error message');
  });

  it('skips validation for empty input when validateEmpty is false', () => {
    const mockCallback = vi.fn().mockReturnValue('Error message');
    const { rerender, result } = renderHookTest(() => useValidatedInput());
    rerender();

    act(() => {
      result().validateInput('', [mockCallback], false);
    });

    expect(mockCallback).not.toHaveBeenCalled();
    expect(result().validated).toBeUndefined();
  });

  it('returns first error from callbacks', () => {
    const callbacks = [vi.fn().mockReturnValue('First error'), vi.fn().mockReturnValue('Second error')];
    const { rerender, result } = renderHookTest(() => useValidatedInput());
    rerender();

    act(() => {
      result().validateInput('test', callbacks);
    });

    expect(result().validated).toBe('First error');
  });

  it('sets validated to undefined when all callbacks pass', () => {
    const callbacks = [
      vi.fn().mockReturnValue(false),
      vi.fn().mockReturnValue(null),
      vi.fn().mockReturnValue(undefined)
    ];
    const { rerender, result } = renderHookTest(() => useValidatedInput());
    rerender();

    act(() => {
      result().validateInput('test', callbacks);
    });

    expect(result().validated).toBeUndefined();
  });

  it('handles mixed callback results', () => {
    const callbacks = [
      vi.fn().mockReturnValue(false),
      vi.fn().mockReturnValue('Error message'),
      vi.fn().mockReturnValue(null)
    ];
    const { rerender, result } = renderHookTest(() => useValidatedInput());
    rerender();

    act(() => {
      result().validateInput('test', callbacks);
    });

    expect(result().validated).toBe('Error message');
  });

  it('handles undefined callbacks array', () => {
    const { rerender, result } = renderHookTest(() => useValidatedInput());
    rerender();

    act(() => {
      result().validateInput('test', undefined);
    });

    expect(result().validated).toBe('test');
  });

  it('validates with empty callbacks array', () => {
    const { rerender, result } = renderHookTest(() => useValidatedInput());
    rerender();

    act(() => {
      result().validateInput('test', []);
    });

    expect(result().validated).toBeUndefined();
  });
});
