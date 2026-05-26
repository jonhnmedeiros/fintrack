import { createFileRoute } from '@tanstack/react-router'

export function CreateAPIFileRoute(path: string) {
  return (methods: Record<string, (opts: { request: Request; params: Record<string, string> }) => Promise<Response>>) => ({
    path,
    methods,
  })
}

export { createFileRoute as Route }
