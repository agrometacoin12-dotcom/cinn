import { Movie, UserProfile, Ticket, PaymentTransaction, LicenseGrant, PlaybackSession, AuditLog } from "./types";

export const INITIAL_MOVIES: Movie[] = [
  {
    id: "m-1",
    title: "Eko Midnight",
    director: "Kemi Adesua",
    synopsis: "A stylish, fast-paced crime thriller set in the underbelly of Lagos. A compromised inspector has 12 hours to locate a missing governor's driver before the cartels claim the streets.",
    genre: "Noir Thriller",
    releaseYear: 2026,
    duration: "1h 58m",
    priceNGN: 2500,
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    trailerUrl: "https://assets.mixkit.co/videos/preview/mixkit-city-lights-at-night-reflected-on-water-43330-large.mp4",
    published: true,
    rating: "18+"
  },
  {
    id: "m-2",
    title: "The Whispering Palms",
    director: "Tunde Alabi",
    synopsis: "A breathtaking indie romance set along the serene beaches of Badagry, tracing the deep-seated historical secrets that bind two star-crossed lovers from competing luxury resort families.",
    genre: "Romantic Drama",
    releaseYear: 2025,
    duration: "2h 05m",
    priceNGN: 1800,
    posterUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    trailerUrl: "https://assets.mixkit.co/videos/preview/mixkit-gentle-ocean-waves-on-a-sandy-beach-23362-large.mp4",
    published: true,
    rating: "13+"
  },
  {
    id: "m-3",
    title: "Onyeka's Legacy",
    director: "Chidi Nwabueze",
    synopsis: "A powerful historical epic chronicling the resilient women of Southeastern Nigeria during the palm oil trade wars. Masterful cinematography, authentic traditional scores, and award-winning performances.",
    genre: "Historical Epic",
    releaseYear: 2026,
    duration: "2h 22m",
    priceNGN: 3500,
    posterUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1eae?auto=format&fit=crop&w=600&q=80",
    trailerUrl: "https://assets.mixkit.co/videos/preview/mixkit-fire-burning-in-the-forest-41131-large.mp4",
    published: true,
    rating: "16+"
  },
  {
    id: "m-4",
    title: "Lagos Runway",
    director: "Yinka Balogun",
    synopsis: "A high-fashion satire highlighting the cutthroat world of design, vanity, and high-society sabotage in modern Victoria Island. A witty look into Nigeria's ultra-wealthy creative ecosystem.",
    genre: "Comedy Drama",
    releaseYear: 2026,
    duration: "1h 45m",
    priceNGN: 1500,
    posterUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
    trailerUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-fashionable-clothes-in-studio-34282-large.mp4",
    published: true,
    rating: "PG"
  },
  {
    id: "m-5",
    title: "Shadows of the Dunes",
    director: "Mustapha Musa",
    synopsis: "An elegant, slowly-unraveling Northern Nigerian mystery focusing on an archaeologist who discovers pre-colonial metalworks near Kano, triggering a clash with powerful land-developers.",
    genre: "Mystery",
    releaseYear: 2025,
    duration: "1h 50m",
    priceNGN: 2000,
    posterUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80",
    trailerUrl: "https://assets.mixkit.co/videos/preview/mixkit-desert-landscape-with-sand-dunes-under-sunlight-41221-large.mp4",
    published: false, // Starts as draft to demonstrate creator controls!
    rating: "PG-13"
  }
];

export const INITIAL_USER: UserProfile = {
  id: "usr-1",
  email: "agrometacoin12@gmail.com",
  name: "Nollywood Visionary",
  role: "admin", // Default to admin so they discover all features immediately!
  joinedAt: "2026-01-10T11:20:00Z"
};

export const MOCK_USERS: UserProfile[] = [
  { id: "usr-1", email: "agrometacoin12@gmail.com", name: "Premium Creator", role: "admin", joinedAt: "2026-01-10T11:20:00Z" },
  { id: "usr-2", email: "folake.o@nollywoodbuzz.ng", name: "Folake Okonjo", role: "tester", joinedAt: "2026-03-02T14:15:00Z" },
  { id: "usr-3", email: "emeka_film_guy@gmail.com", name: "Emeka Obi", role: "viewer", joinedAt: "2026-05-18T09:40:00Z" },
  { id: "usr-4", email: "press_pass_temple@gmail.com", name: "Laolu Johnson (Tribune)", role: "tester", joinedAt: "2026-06-01T16:30:00Z" },
  { id: "usr-5", email: "chioma.n@yahoo.com", name: "Chioma Nduka", role: "viewer", joinedAt: "2026-06-15T20:10:00Z" }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "t-1",
    movieId: "m-1",
    userId: "usr-1",
    purchaseDate: "2026-06-18T22:30:00Z",
    pricePaidNGN: 2500,
    status: "active",
    viewCount: 0,
    expiresAt: "2026-07-18T22:30:00Z"
  },
  {
    id: "t-2",
    movieId: "m-2",
    userId: "usr-1",
    purchaseDate: "2026-06-12T10:15:00Z",
    pricePaidNGN: 1800,
    status: "used", // consumed single-view concept!
    viewCount: 1,
    expiresAt: "2026-06-13T10:15:00Z"
  }
];

export const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: "tx-101",
    userId: "usr-3",
    userEmail: "emeka_film_guy@gmail.com",
    movieId: "m-1",
    movieTitle: "Eko Midnight",
    amountNGN: 2500,
    creatorShareNGN: 2250, // 90%
    platformFeeNGN: 250, // 10%
    status: "success",
    reference: "PAY_TEMPLE_88A21B",
    timestamp: "2026-06-18T19:40:00Z"
  },
  {
    id: "tx-102",
    userId: "usr-5",
    userEmail: "chioma.n@yahoo.com",
    movieId: "m-3",
    movieTitle: "Onyeka's Legacy",
    amountNGN: 3500,
    creatorShareNGN: 3150,
    platformFeeNGN: 350,
    status: "success",
    reference: "PAY_TEMPLE_73D49C",
    timestamp: "2026-06-18T20:15:00Z"
  },
  {
    id: "tx-103",
    userId: "usr-3",
    userEmail: "emeka_film_guy@gmail.com",
    movieId: "m-4",
    movieTitle: "Lagos Runway",
    amountNGN: 1500,
    creatorShareNGN: 1350,
    platformFeeNGN: 150,
    status: "failed",
    reference: "PAY_TEMPLE_ERR993",
    timestamp: "2026-06-18T20:50:00Z"
  }
];

export const INITIAL_LICENSES: LicenseGrant[] = [
  {
    id: "lic-501",
    userId: "usr-2",
    userEmail: "folake.o@nollywoodbuzz.ng",
    userRole: "tester",
    movieId: "m-1",
    movieTitle: "Eko Midnight",
    grantedBy: "System Creator",
    grantedAt: "2026-06-15T08:00:00Z",
    status: "active"
  },
  {
    id: "lic-502",
    userId: "usr-4",
    userEmail: "press_pass_temple@gmail.com",
    userRole: "tester",
    movieId: "m-3",
    movieTitle: "Onyeka's Legacy",
    grantedBy: "System Creator",
    grantedAt: "2026-06-16T12:00:00Z",
    status: "active"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-06-19T01:00:00Z",
    userId: "usr-1",
    userEmail: "agrometacoin12@gmail.com",
    role: "admin",
    action: "MOVIE_PUBLISH_TOGGLE",
    details: "Toggled published state for 'Eko Midnight' to TRUE",
    ipAddress: "197.210.64.18",
    severity: "info"
  },
  {
    id: "log-2",
    timestamp: "2026-06-19T02:15:00Z",
    userId: "usr-1",
    userEmail: "agrometacoin12@gmail.com",
    role: "admin",
    action: "LICENSE_GRANT",
    details: "Granted press pass for Onyeka's Legacy to press_pass_temple@gmail.com",
    ipAddress: "197.210.64.18",
    severity: "info"
  },
  {
    id: "log-3",
    timestamp: "2026-06-19T04:30:00Z",
    userId: "usr-3",
    userEmail: "emeka_film_guy@gmail.com",
    role: "viewer",
    action: "ILLEGAL_CAPTURE_ATTEMPT",
    details: "Deterred potential browser screen recording - multi-layer canvas watermark rendered over player container.",
    ipAddress: "102.89.44.112",
    severity: "warning"
  }
];

export const INITIAL_SESSIONS: PlaybackSession[] = [
  {
    id: "sess-801",
    userId: "usr-3",
    userEmail: "emeka_film_guy@gmail.com",
    movieTitle: "Eko Midnight",
    ipAddress: "102.89.44.112",
    device: "Android Chrome Mobile",
    startedAt: "2026-06-19T05:10:00Z",
    durationSeconds: 1420,
    status: "live"
  },
  {
    id: "sess-802",
    userId: "usr-2",
    userEmail: "folake.o@nollywoodbuzz.ng",
    movieTitle: "The Whispering Palms",
    ipAddress: "197.210.8.44",
    device: "Mac Safari Desktop",
    startedAt: "2026-06-19T04:00:00Z",
    durationSeconds: 3600,
    status: "completed"
  }
];
