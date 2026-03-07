import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Hero from '@/components/Hero'

vi.mock('@/utils/image', () => ({
  buildImgSrc: (_: string, path: string) => path || '/placeholder.jpg',
  onImgErrorSwap: () => {}
}))

describe('Hero with initial data (Option B)', () => {
  it('uses React Query cache when [spectacles, upcoming] is present and renders slides without loading', async () => {
    const futureDate = '2026-06-15'
    const cacheUpcoming = [
      {
        id: 1,
        title: 'Spectacle depuis le cache',
        img: 'hero-test.jpg',
        date_spectacle: futureDate,
        heure_spectacle: '20:00:00',
        lieu: 'Lille',
        lien_spectacle: ''
      }
    ]
    const queryClient = new QueryClient()
    queryClient.setQueryData(['spectacles', 'upcoming'], cacheUpcoming)

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Hero />
        </QueryClientProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Spectacle depuis le cache')).toBeInTheDocument()
    })
    expect(screen.getByText('À venir')).toBeInTheDocument()
  })
})
