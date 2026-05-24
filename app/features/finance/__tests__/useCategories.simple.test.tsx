import { renderHook, act } from '@testing-library/react'
import { useCategories } from '@/features/finance/hooks/useCategories'

describe('useCategories hook (simple)', () => {
  it('should be defined', () => {
    expect(useCategories).toBeDefined()
  })
})