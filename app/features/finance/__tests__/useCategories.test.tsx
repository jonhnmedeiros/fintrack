import { renderHook, act, waitFor } from '@testing-library/react'
import { TestQueryClientWrapper } from './test-utils'
import { useCategories, useCreateCategory, useDeleteCategory } from '@/features/finance/hooks/useCategories'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import * as React from 'react'

const handlers = [
  http.get('/api/categories', () => {
    return HttpResponse.json([
      { id: '1', name: 'Salary', type: 'INCOME', userId: 'test-user-id' },
      { id: '2', name: 'Groceries', type: 'EXPENSE', userId: 'test-user-id' },
    ])
  }),
  http.post('/api/categories', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ ...body as object, id: '3', userId: 'test-user-id' })
  }),
  http.delete('/api/categories/:id', () => {
    return HttpResponse.json(null, { status: 204 })
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function wrapper({ children }: { children: React.ReactNode }) {
  return <TestQueryClientWrapper>{children}</TestQueryClientWrapper>
}

describe('useCategories hook', () => {
  it('should fetch categories', async () => {
    const { result } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const data = result.current.data as Array<{ name: string }>
    expect(data).toHaveLength(2)
    expect(data[0].name).toBe('Salary')
    expect(data[1].name).toBe('Groceries')
  })

  it('should create a category', async () => {
    const { result } = renderHook(() => useCreateCategory(), { wrapper })

    await act(async () => {
      result.current.mutate({ name: 'Bonus', type: 'INCOME' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect((result.current.data as { name: string })?.name).toBe('Bonus')
  })

  it('should delete a category', async () => {
    const { result } = renderHook(() => useDeleteCategory(), { wrapper })

    await act(async () => {
      result.current.mutate('1')
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })
})
