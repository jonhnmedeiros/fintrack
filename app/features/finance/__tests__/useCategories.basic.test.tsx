import { renderHook, act } from '@testing-library/react'
import { TestQueryClientWrapper } from './test-utils'
import { useCategories } from '@/features/finance/hooks/useCategories'
import * as React from 'react'

describe('useCategories hook (basic)', () => {
  it('should be defined', () => {
    expect(useCategories).toBeDefined()
  })

  it('should return an object from useQuery', () => {
    function wrapper({ children }: { children: React.ReactNode }) {
      return <TestQueryClientWrapper>{children}</TestQueryClientWrapper>
    }

    const { result } = renderHook(() => useCategories(), { wrapper })
    
    // useQuery should return an object with these properties
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isSuccess')
    expect(result.current).toHaveProperty('isError')
  })
})