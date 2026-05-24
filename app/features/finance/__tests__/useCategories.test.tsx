import { renderHook, act } from '@testing-library/react'
import { TestQueryClientWrapper } from './test-utils'
import { useCategories, useCreateCategory, useDeleteCategory } from '@/features/finance/hooks/useCategories'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import * as React from 'react'

// Mock API handlers
const handlers = [
  rest.get('/api/categories', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', name: 'Salary', type: 'INCOME', userId: 'test-user-id' },
        { id: '2', name: 'Groceries', type: 'EXPENSE', userId: 'test-user-id' }
      ])
    )
  }),
  rest.post('/api/categories', async (req, res, ctx) => {
    const body = await req.json()
    return res(
      ctx.json({ ...body, id: '3', userId: 'test-user-id' })
    )
  }),
  rest.delete('/api/categories/:id', (req, res, ctx) => {
    return res(ctx.status(204))
  })
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Wrapper for our hooks that provides necessary providers
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <TestQueryClientWrapper>
      {children}
    </TestQueryClientWrapper>
  )
}

describe('useCategories hook', () => {
  it('should fetch categories', async () => {
    const wrapper = createWrapper()
    const { result, waitForNextUpdate } = renderHook(() => useCategories(), { wrapper })
    
    await waitForNextUpdate()
    
    expect(result.isSuccess).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(result.data[0].name).toBe('Salary')
    expect(result.data[1].name).toBe('Groceries')
  })

  it('should create a category', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useCreateCategory(), { wrapper })
    
    await act(async () => {
      result.mutate({ name: 'Bonus', type: 'INCOME' })
    })
    
    expect(result.isSuccess).toBe(true)
    expect(result.data?.name).toBe('Bonus')
  })

  it('should delete a category', async () => {
    const wrapper = createWrapper()
    const { result: deleteResult } = renderHook(() => useDeleteCategory(), { wrapper })
    
    await act(async () => {
      deleteResult.mutate('1')
    })
    
    expect(deleteResult.isSuccess).toBe(true)
  })
})