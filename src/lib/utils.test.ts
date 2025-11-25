import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
    it('should merge class names correctly', () => {
        expect(cn('c-red', 'c-blue')).toBe('c-red c-blue');
    });

    it('should handle conditional classes', () => {
        expect(cn('c-red', false && 'c-blue', 'c-green')).toBe('c-red c-green');
    });

    it('should merge tailwind classes correctly', () => {
        expect(cn('p-4', 'p-2')).toBe('p-2');
    });
});
