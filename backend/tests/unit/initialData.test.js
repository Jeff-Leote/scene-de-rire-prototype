/**
 * Tests unitaires pour initialData.js (données initiales page d'accueil - Option B).
 */
const mockQuery = jest.fn();

jest.mock('../../src/db', () => ({
  query: (...args) => mockQuery(...args)
}));

const { getInitialDataForHome } = require('../../src/initialData');

describe('initialData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockImplementation((sql) => {
      if (typeof sql !== 'string') return Promise.resolve([[]]);
      if (sql.includes('COUNT(*)')) return Promise.resolve([[{ total: 10 }]]);
      if (sql.includes('LIMIT ? OFFSET ?')) {
        return Promise.resolve([[
          { id: 1, title: 'Spectacle 1', img: 'img1.jpg', description: '', date_spectacle: '2025-06-01', heure_spectacle: '20:00:00', lieu: 'Lille', lien_spectacle: '' }
        ]]);
      }
      if (sql.includes('is_main = TRUE')) return Promise.resolve([[{ id: 1, image_path: 'venue.jpg', is_main: true }]]);
      if (sql.includes('FROM lieu') && !sql.includes('is_main = TRUE')) return Promise.resolve([[{ id: 1, image_path: 'v1.jpg', is_main: false }]]);
      if (sql.includes('FROM spectacle')) {
        return Promise.resolve([[
          { id: 1, title: 'S1', img: 'i1.jpg', description: '', date_spectacle: '2025-06-01', heure_spectacle: '20:00:00', lieu: 'Lille', lien_spectacle: '' }
        ]]);
      }
      if (sql.includes('FROM artiste')) return Promise.resolve([[{ id: 1, name: 'Artiste', photo: 'p.jpg', upcoming_shows: 0 }]]);
      return Promise.resolve([[]]);
    });
  });

  describe('getInitialDataForHome', () => {
    it('returns an object with all expected keys when DB succeeds', async () => {
      const result = await getInitialDataForHome();
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('spectaclesUpcoming');
      expect(result).toHaveProperty('artistFeatured');
      expect(result).toHaveProperty('venueImages');
      expect(result).toHaveProperty('venueMain');
      expect(result).toHaveProperty('spectaclesList');
      expect(result).toHaveProperty('artistes');
      expect(result).toHaveProperty('spectaclesAll');
      expect(Array.isArray(result.spectaclesUpcoming)).toBe(true);
      expect(Array.isArray(result.artistes)).toBe(true);
      expect(Array.isArray(result.spectaclesAll)).toBe(true);
      expect(result.spectaclesList).toHaveProperty('spectacles');
      expect(result.spectaclesList).toHaveProperty('pagination');
    });

    it('returns null when DB throws', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB connection failed'));
      const result = await getInitialDataForHome();
      expect(result).toBeNull();
    });
  });
});
