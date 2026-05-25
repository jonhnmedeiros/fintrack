import { describe, it, expect } from 'vitest'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
    })

    it('should handle empty inputs', () => {
      expect(cn()).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('should format positive numbers', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('1.234')
      expect(result).toContain('56')
    })

    it('should format zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0')
    })
  })

  describe('formatPercent', () => {
    it('should format positive values', () => {
      expect(formatPercent(12.34)).toBe('+12.34%')
    })

    it('should format negative values', () => {
      expect(formatPercent(-5.5)).toBe('-5.50%')
    })
  })
})