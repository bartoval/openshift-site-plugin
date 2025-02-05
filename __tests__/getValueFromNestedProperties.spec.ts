import { describe, it, expect } from 'vitest';

import { getValueFromNestedProperty } from '../src/console/core/utils/getValueFromNestedProperty';

describe('getValueFromNestedProperty', () => {
  interface TestLevel2 {
    level3: string;
    nullValue: null;
  }

  interface TestLevel1 {
    level2: TestLevel2;
    arrayValue: string[];
  }

  interface TestObject {
    level1: TestLevel1;
    emptyObject: Record<string, never>;
    nullLevel: null;
  }

  const testObject: TestObject = {
    level1: {
      level2: {
        level3: 'test value',
        nullValue: null
      },
      arrayValue: ['item1', 'item2']
    },
    emptyObject: {},
    nullLevel: null
  };

  it('returns value from single level property', () => {
    const result = getValueFromNestedProperty<TestObject, keyof TestObject>(testObject, ['level1']);
    expect(result).toEqual(testObject.level1);
  });

  it('returns value from nested property', () => {
    const value = getValueFromNestedProperty(testObject, ['level1'] as const);
    if (value && typeof value === 'object') {
      const level2Value = getValueFromNestedProperty(value as TestLevel1, ['level2'] as const);
      if (level2Value && typeof level2Value === 'object') {
        const level3Value = getValueFromNestedProperty(level2Value as TestLevel2, ['level3'] as const);
        expect(level3Value).toBe('test value');
      }
    }
  });

  it('returns undefined for empty keys array', () => {
    const result = getValueFromNestedProperty(testObject, [] as Array<keyof TestObject>);
    expect(result).toBeUndefined();
  });

  it('returns undefined when encountering null in path', () => {
    const result = getValueFromNestedProperty<TestObject, keyof TestObject>(testObject, ['nullLevel']);
    expect(result).toBeNull();
  });

  it('returns array value correctly', () => {
    const value = getValueFromNestedProperty(testObject, ['level1'] as const);
    if (value && typeof value === 'object') {
      const arrayValue = getValueFromNestedProperty(value as TestLevel1, ['arrayValue'] as const);
      expect(arrayValue).toEqual(['item1', 'item2']);
    }
  });

  it('handles empty object in path', () => {
    const result = getValueFromNestedProperty<TestObject, keyof TestObject>(testObject, ['emptyObject']);
    expect(result).toEqual({});
  });

  it('returns null value correctly', () => {
    const value = getValueFromNestedProperty(testObject, ['level1'] as const);
    if (value && typeof value === 'object') {
      const level2Value = getValueFromNestedProperty(value as TestLevel1, ['level2'] as const);
      if (level2Value && typeof level2Value === 'object') {
        const nullValue = getValueFromNestedProperty(level2Value as TestLevel2, ['nullValue'] as const);
        expect(nullValue).toBeNull();
      }
    }
  });

  it('maintains type safety with valid paths', () => {
    interface TypedLevel2 {
      c: number;
    }

    interface TypedLevel1 {
      b: TypedLevel2;
    }

    interface TypedObject {
      a: TypedLevel1;
    }

    const typedObject: TypedObject = {
      a: {
        b: {
          c: 42
        }
      }
    };

    const aValue = getValueFromNestedProperty(typedObject, ['a'] as const);
    if (aValue && typeof aValue === 'object') {
      const bValue = getValueFromNestedProperty(aValue as TypedLevel1, ['b'] as const);
      if (bValue && typeof bValue === 'object') {
        const cValue = getValueFromNestedProperty(bValue as TypedLevel2, ['c'] as const);
        expect(cValue).toBe(42);
      }
    }
  });
});
