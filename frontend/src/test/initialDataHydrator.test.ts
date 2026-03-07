import { describe, it, expect, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { hydrateQueryClientFromInitialData, type InitialDataShape } from '@/components/InitialDataHydrator'

describe('InitialDataHydrator / hydrateQueryClientFromInitialData', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
  })

  it('fills cache with spectaclesUpcoming under key [spectacles, upcoming]', () => {
    const data: InitialDataShape = {
      spectaclesUpcoming: [{ id: 1, title: 'Show 1', date_spectacle: '2025-06-01' }]
    }
    hydrateQueryClientFromInitialData(queryClient, data)
    expect(queryClient.getQueryData(['spectacles', 'upcoming'])).toEqual(data.spectaclesUpcoming)
  })

  it('fills cache with all initial data keys when provided', () => {
    const data: InitialDataShape = {
      spectaclesUpcoming: [],
      artistFeatured: { id: 1, name: 'Artist' },
      venueImages: [{ id: 1, image_path: 'a.jpg' }],
      venueMain: { id: 1, image_path: 'main.jpg', is_main: true },
      spectaclesList: { spectacles: [], pagination: { page: 1, totalPages: 0 } },
      artistes: [{ id: 1, name: 'A' }],
      spectaclesAll: [{ id: 1, title: 'S1' }]
    }
    hydrateQueryClientFromInitialData(queryClient, data)
    expect(queryClient.getQueryData(['spectacles', 'upcoming'])).toEqual(data.spectaclesUpcoming)
    expect(queryClient.getQueryData(['artist', 'featured'])).toEqual(data.artistFeatured)
    expect(queryClient.getQueryData(['venue', 'images'])).toEqual(data.venueImages)
    expect(queryClient.getQueryData(['venue', 'main'])).toEqual(data.venueMain)
    expect(queryClient.getQueryData(['spectacles', 'list', '1', '9'])).toEqual(data.spectaclesList)
    expect(queryClient.getQueryData(['artistes'])).toEqual(data.artistes)
    expect(queryClient.getQueryData(['spectacles', 'all'])).toEqual(data.spectaclesAll)
  })

  it('does not set keys for undefined fields', () => {
    hydrateQueryClientFromInitialData(queryClient, {})
    expect(queryClient.getQueryData(['spectacles', 'upcoming'])).toBeUndefined()
    expect(queryClient.getQueryData(['artistes'])).toBeUndefined()
  })
})
