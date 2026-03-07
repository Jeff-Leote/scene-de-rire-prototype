/**
 * Données initiales pour la page d'accueil (Option B - injection dans le HTML).
 * Même forme que les réponses API pour que le frontend puisse remplir le cache React Query.
 */
const db = require('./db');

async function getInitialDataForHome() {
  try {
    const [
      spectaclesUpcoming,
      artistFeatured,
      venueImages,
      venueMain,
      spectaclesList,
      artistes,
      spectaclesAll
    ] = await Promise.all([
      getSpectaclesUpcoming(),
      getArtistFeatured(),
      getVenueImages(),
      getVenueMain(),
      getSpectaclesList(1, 9),
      getArtistes(),
      getSpectaclesAll()
    ]);

    return {
      spectaclesUpcoming,
      artistFeatured,
      venueImages,
      venueMain,
      spectaclesList,
      artistes,
      spectaclesAll
    };
  } catch (err) {
    console.warn('⚠️ Initial data (home):', err.message);
    return null;
  }
}

async function getSpectaclesUpcoming() {
  const [rows] = await db.query(`
    SELECT id, title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle
    FROM spectacle
    WHERE date_spectacle >= CURDATE()
    ORDER BY date_spectacle ASC, heure_spectacle ASC
    LIMIT 4
  `);
  return rows;
}

async function getArtistFeatured() {
  const [rows] = await db.query(`
    SELECT s.id as next_show_id, s.title as next_show_title, s.date_spectacle as next_show_date,
           s.heure_spectacle as next_show_time, s.img as next_show_image
    FROM spectacle s
    WHERE s.date_spectacle >= CURDATE()
    ORDER BY s.date_spectacle ASC, s.heure_spectacle ASC
    LIMIT 1
  `);
  if (rows.length === 0) {
    return { id: 1, name: "Artiste à l'affiche", photo: "default-artist.jpg", next_show: null };
  }
  const s = rows[0];
  return {
    id: 1,
    name: "Artiste à l'affiche",
    photo: "default-artist.jpg",
    next_show: {
      id: s.next_show_id,
      title: s.next_show_title,
      date: s.next_show_date,
      time: s.next_show_time,
      image: s.next_show_image
    }
  };
}

async function getVenueImages() {
  const [rows] = await db.query('SELECT id, image_path, is_main FROM lieu');
  return rows;
}

async function getVenueMain() {
  const [rows] = await db.query(
    'SELECT id, image_path, is_main FROM lieu WHERE is_main = TRUE LIMIT 1'
  );
  return rows[0] || null;
}

async function getSpectaclesList(page, limit) {
  const offset = (page - 1) * limit;
  const [spectacles] = await db.query(`
    SELECT id, title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle
    FROM spectacle
    WHERE date_spectacle >= CURDATE()
    ORDER BY date_spectacle ASC, heure_spectacle ASC
    LIMIT ? OFFSET ?
  `, [limit, offset]);
  const [[{ total }]] = await db.query(`
    SELECT COUNT(*) as total FROM spectacle WHERE date_spectacle >= CURDATE()
  `);
  return {
    spectacles,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getArtistes() {
  const [artistes] = await db.query(`
    SELECT a.*, 0 as upcoming_shows FROM artiste a ORDER BY a.created_at DESC
  `);
  return artistes;
}

async function getSpectaclesAll() {
  const [rows] = await db.query(`
    SELECT id, title, img, description, date_spectacle, heure_spectacle, lieu, lien_spectacle
    FROM spectacle
    ORDER BY date_spectacle ASC, heure_spectacle ASC
  `);
  return rows;
}

module.exports = { getInitialDataForHome };
