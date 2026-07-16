var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var DB_PATH = import_path.default.resolve(process.cwd(), "movies_db.json");
var movies = [];
var profiles = [];
var sharedLists = [];
var searchLogs = [];
var DEFAULT_MOVIES = [
  {
    id: "m-1",
    title: "Inception",
    director: "Christopher Nolan",
    year: 2010,
    genre: "Sci-Fi",
    synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
    duration: 148,
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200",
    rating: 4.8,
    ratings: [
      { userId: "u-sys", username: "CinematicGamer", rating: 5, comment: "An absolute masterpiece of editing and score!", timestamp: "2026-06-01T10:00:00Z" },
      { userId: "u-alex", username: "AlexP", rating: 4, comment: "Mind-bending, though a bit exposition-heavy.", timestamp: "2026-06-15T14:30:00Z" },
      { userId: "u-emma", username: "EmmaStoneFan", rating: 5, comment: "The ending shot with the spinning top gets me every time.", timestamp: "2026-07-02T18:45:00Z" }
    ],
    addedBy: "system",
    createdAt: "2026-05-01T12:00:00Z"
  },
  {
    id: "m-2",
    title: "The Dark Knight",
    director: "Christopher Nolan",
    year: 2008,
    genre: "Action",
    synopsis: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    duration: 152,
    imageUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=1200",
    rating: 4.9,
    ratings: [
      { userId: "u-sys", username: "CinematicGamer", rating: 5, comment: "Heath Ledger's performance is legendary.", timestamp: "2026-05-10T09:15:00Z" },
      { userId: "u-emma", username: "EmmaStoneFan", rating: 5, comment: "Best comic book adaptation ever created, period.", timestamp: "2026-06-20T21:00:00Z" }
    ],
    addedBy: "system",
    createdAt: "2026-05-01T12:00:00Z"
  },
  {
    id: "m-3",
    title: "Interstellar",
    director: "Christopher Nolan",
    year: 2014,
    genre: "Sci-Fi",
    synopsis: "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
    duration: 169,
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    rating: 4.7,
    ratings: [
      { userId: "u-alex", username: "AlexP", rating: 5, comment: "The soundtrack by Hans Zimmer is ethereal.", timestamp: "2026-07-01T11:22:00Z" },
      { userId: "u-sys", username: "CinematicGamer", rating: 4, comment: "Scientifically accurate and emotionally gripping.", timestamp: "2026-07-05T08:00:00Z" }
    ],
    addedBy: "system",
    createdAt: "2026-05-01T12:00:00Z"
  },
  {
    id: "m-4",
    title: "Spirited Away",
    director: "Hayao Miyazaki",
    year: 2001,
    genre: "Animation",
    synopsis: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    duration: 125,
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1200",
    rating: 4.8,
    ratings: [
      { userId: "u-emma", username: "EmmaStoneFan", rating: 5, comment: "Ghibli magic at its absolute peak.", timestamp: "2026-06-18T13:40:00Z" }
    ],
    addedBy: "system",
    createdAt: "2026-05-01T12:00:00Z"
  },
  {
    id: "m-5",
    title: "The Godfather",
    director: "Francis Ford Coppola",
    year: 1972,
    genre: "Drama",
    synopsis: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    duration: 175,
    imageUrl: "https://images.unsplash.com/photo-1543536448-d209d2d13a1c?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1543536448-d209d2d13a1c?auto=format&fit=crop&q=80&w=1200",
    rating: 4.9,
    ratings: [
      { userId: "u-sys", username: "CinematicGamer", rating: 5, comment: "Unparalleled cinema storytelling.", timestamp: "2026-05-02T10:00:00Z" }
    ],
    addedBy: "system",
    createdAt: "2026-05-01T12:00:00Z"
  },
  {
    id: "m-6",
    title: "Parasite",
    director: "Bong Joon Ho",
    year: 2019,
    genre: "Thriller",
    synopsis: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    duration: 132,
    imageUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1200",
    rating: 4.6,
    ratings: [
      { userId: "u-alex", username: "AlexP", rating: 5, comment: "Breathtaking genre blend of dark comedy, satire and thriller.", timestamp: "2026-07-04T19:00:00Z" }
    ],
    addedBy: "system",
    createdAt: "2026-05-01T12:00:00Z"
  },
  {
    id: "m-7",
    title: "Knives Out",
    director: "Rian Johnson",
    year: 2019,
    genre: "Comedy",
    synopsis: "A detective investigates the death of a patriarch of an eccentric, combative family.",
    duration: 130,
    imageUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=1200",
    rating: 4.3,
    ratings: [
      { userId: "u-emma", username: "EmmaStoneFan", rating: 4, comment: "Incredibly clever, fun, and colorful murder mystery.", timestamp: "2026-07-06T15:00:00Z" }
    ],
    addedBy: "system",
    createdAt: "2026-05-01T12:00:00Z"
  },
  {
    id: "m-8",
    title: "Get Out",
    director: "Jordan Peele",
    year: 2017,
    genre: "Horror",
    synopsis: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception eventually reaches a boiling point.",
    duration: 104,
    imageUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1200",
    rating: 4.5,
    ratings: [
      { userId: "u-sys", username: "CinematicGamer", rating: 4.5, comment: "A brilliant societal satire masquerading as horror. Genius.", timestamp: "2026-07-07T12:10:00Z" }
    ],
    addedBy: "system",
    createdAt: "2026-05-01T12:00:00Z"
  },
  {
    id: "m-9",
    title: "La La Land",
    director: "Damien Chazelle",
    year: 2016,
    genre: "Romance",
    synopsis: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    duration: 128,
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200",
    rating: 4.4,
    ratings: [
      { userId: "u-emma", username: "EmmaStoneFan", rating: 5, comment: "Pure magic. The opening number is iconic.", timestamp: "2026-07-10T10:30:00Z" }
    ],
    addedBy: "system",
    createdAt: "2026-05-01T12:00:00Z"
  },
  {
    id: "m-10",
    title: "Lord of the Rings: Fellowship of the Ring",
    director: "Peter Jackson",
    year: 2001,
    genre: "Fantasy",
    synopsis: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
    duration: 178,
    imageUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1200",
    rating: 4.9,
    ratings: [
      { userId: "u-alex", username: "AlexP", rating: 5, comment: "Perfect fantasy. Worldbuilding at its masterclass.", timestamp: "2026-07-12T17:15:00Z" }
    ],
    addedBy: "system",
    createdAt: "2026-05-01T12:00:00Z"
  }
];
var DEFAULT_PROFILES = [
  {
    id: "u-sys",
    username: "CinematicGamer",
    avatar: "clapperboard",
    genrePreferences: ["Sci-Fi", "Action", "Drama"],
    watchlist: ["m-3", "m-6"],
    joinedAt: "2026-05-01T10:00:00Z"
  },
  {
    id: "u-alex",
    username: "AlexP",
    avatar: "popcorn",
    genrePreferences: ["Thriller", "Sci-Fi", "Fantasy"],
    watchlist: ["m-1", "m-10"],
    joinedAt: "2026-06-12T08:30:00Z"
  },
  {
    id: "u-emma",
    username: "EmmaStoneFan",
    avatar: "ticket",
    genrePreferences: ["Romance", "Animation", "Comedy"],
    watchlist: ["m-4", "m-9"],
    joinedAt: "2026-06-17T11:45:00Z"
  }
];
var DEFAULT_SHARED_LISTS = [
  {
    id: "s-1",
    title: "Christopher Nolan Marathon",
    description: "Curated collection of mind-bending Nolan films for our collaborative weekend watch party!",
    ownerId: "u-sys",
    ownerName: "CinematicGamer",
    movieIds: ["m-1", "m-2", "m-3"],
    comments: [
      { userId: "u-alex", username: "AlexP", text: "Let's definitely start with Interstellar first!", timestamp: "2026-07-12T20:00:00Z" },
      { userId: "u-sys", username: "CinematicGamer", text: "Agreed. The Zimmer soundtrack on big speakers is a must.", timestamp: "2026-07-12T20:05:00Z" }
    ],
    activeViewers: ["CinematicGamer", "AlexP"],
    isCollaborative: true
  },
  {
    id: "s-2",
    title: "Late Night Cozy Movies",
    description: "A cozy set of artistic animations and dramas for winding down.",
    ownerId: "u-emma",
    ownerName: "EmmaStoneFan",
    movieIds: ["m-4", "m-9"],
    comments: [],
    activeViewers: [],
    isCollaborative: false
  }
];
var DEFAULT_SEARCH_LOGS = [
  { query: "Nolan", genreFilter: "Sci-Fi", timestamp: "2026-07-14T22:30:00Z", resultsCount: 2 },
  { query: "Spirited", timestamp: "2026-07-15T01:15:00Z", resultsCount: 1 },
  { query: "Godfather", timestamp: "2026-07-15T03:40:00Z", resultsCount: 1 },
  { query: "Action", genreFilter: "Action", timestamp: "2026-07-15T05:22:00Z", resultsCount: 1 },
  { query: "Fantasy", timestamp: "2026-07-15T06:50:00Z", resultsCount: 1 }
];
function initDB() {
  try {
    if (import_fs.default.existsSync(DB_PATH)) {
      const dataStr = import_fs.default.readFileSync(DB_PATH, "utf-8");
      const data = JSON.parse(dataStr);
      movies = data.movies || DEFAULT_MOVIES;
      profiles = data.profiles || DEFAULT_PROFILES;
      sharedLists = data.sharedLists || DEFAULT_SHARED_LISTS;
      searchLogs = data.searchLogs || DEFAULT_SEARCH_LOGS;
      console.log("Database successfully loaded from", DB_PATH);
    } else {
      movies = DEFAULT_MOVIES;
      profiles = DEFAULT_PROFILES;
      sharedLists = DEFAULT_SHARED_LISTS;
      searchLogs = DEFAULT_SEARCH_LOGS;
      saveDB();
      console.log("Database initialized with seed data at", DB_PATH);
    }
  } catch (err) {
    console.error("Error reading database file, using in-memory defaults:", err);
    movies = DEFAULT_MOVIES;
    profiles = DEFAULT_PROFILES;
    sharedLists = DEFAULT_SHARED_LISTS;
    searchLogs = DEFAULT_SEARCH_LOGS;
  }
}
function saveDB() {
  try {
    const data = { movies, profiles, sharedLists, searchLogs };
    import_fs.default.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database to file:", err);
  }
}
initDB();
async function startServer() {
  const app = (0, import_express.default)();
  const requestedPort = parseInt(process.env.PORT || "3000", 10);
  const preferredPort = Number.isNaN(requestedPort) ? 3e3 : requestedPort;
  const startListening = (port) => {
    const server = app.listen(port, "0.0.0.0", () => {
      const address = server.address();
      const actualPort = typeof address === "object" && address ? address.port : port;
      console.log(`Movie Collection API Server is active at http://localhost:${actualPort}`);
    });
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE" && port < 3010) {
        const nextPort = port + 1;
        console.warn(`Port ${port} is already in use. Retrying on ${nextPort}...`);
        startListening(nextPort);
      } else {
        console.error("Failed to start server:", error);
        process.exit(1);
      }
    });
  };
  app.use(import_express.default.json());
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && "status" in err && err.status === 400) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Malformed JSON payload. Syntactic validation failed.",
        code: 400
      });
    }
    next();
  });
  app.get("/api/movies", (req, res) => {
    try {
      const query = (req.query.q || "").toLowerCase().trim();
      const genre = req.query.genre || "";
      const sortBy = req.query.sort || "";
      let filteredMovies = [...movies];
      if (query) {
        filteredMovies = filteredMovies.filter(
          (m) => m.title.toLowerCase().includes(query) || m.director.toLowerCase().includes(query) || m.synopsis.toLowerCase().includes(query)
        );
      }
      if (genre && genre !== "All") {
        filteredMovies = filteredMovies.filter(
          (m) => m.genre.toLowerCase() === genre.toLowerCase()
        );
      }
      if (sortBy === "rating") {
        filteredMovies.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === "year") {
        filteredMovies.sort((a, b) => b.year - a.year);
      } else if (sortBy === "title") {
        filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        filteredMovies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      res.status(200).json(filteredMovies);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message, code: 500 });
    }
  });
  app.get("/api/movies/top-rated", (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 4;
      const sorted = [...movies].sort((a, b) => b.rating - a.rating).slice(0, limit);
      res.status(200).json(sorted);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message, code: 500 });
    }
  });
  app.get("/api/movies/:id", (req, res) => {
    const { id } = req.params;
    const movie = movies.find((m) => m.id === id);
    if (!movie) {
      return res.status(404).json({
        error: "Not Found",
        message: `Movie with ID '${id}' was not found.`,
        code: 404
      });
    }
    res.status(200).json(movie);
  });
  app.post("/api/movies", (req, res) => {
    try {
      const { title, director, year, genre, synopsis, duration, imageUrl, bannerUrl, addedBy } = req.body;
      if (!title || !director || !year || !genre || !synopsis || !duration) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Validation failed: 'title', 'director', 'year', 'genre', 'synopsis', and 'duration' are required fields.",
          code: 400
        });
      }
      if (typeof year !== "number" || year < 1888 || year > (/* @__PURE__ */ new Date()).getFullYear() + 5) {
        return res.status(400).json({
          error: "Bad Request",
          message: `Validation failed: 'year' must be a valid number between 1888 and ${(/* @__PURE__ */ new Date()).getFullYear() + 5}.`,
          code: 400
        });
      }
      if (typeof duration !== "number" || duration <= 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Validation failed: 'duration' must be a positive number representing minutes.",
          code: 400
        });
      }
      const duplicate = movies.find((m) => m.title.toLowerCase() === title.toLowerCase() && m.director.toLowerCase() === director.toLowerCase());
      if (duplicate) {
        return res.status(409).json({
          error: "Conflict",
          message: `A movie with title '${title}' directed by '${director}' already exists.`,
          code: 409
        });
      }
      const defaultImage = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600";
      const defaultBanner = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200";
      const newMovie = {
        id: `m-${Date.now()}`,
        title: title.trim(),
        director: director.trim(),
        year,
        genre: genre.trim(),
        synopsis: synopsis.trim(),
        duration,
        imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : defaultImage,
        bannerUrl: bannerUrl && bannerUrl.trim() ? bannerUrl.trim() : defaultBanner,
        rating: 0,
        ratings: [],
        addedBy: addedBy || "u-sys",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      movies.unshift(newMovie);
      saveDB();
      res.status(201).json({
        message: "Movie added successfully",
        movie: newMovie
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message, code: 500 });
    }
  });
  app.post("/api/movies/:id/rate", (req, res) => {
    try {
      const { id } = req.params;
      const { userId, username, rating, comment } = req.body;
      if (!userId || !username || rating === void 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Validation failed: 'userId', 'username', and 'rating' are required parameters.",
          code: 400
        });
      }
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Validation failed: 'rating' must be a number between 1 and 5.",
          code: 400
        });
      }
      const movie = movies.find((m) => m.id === id);
      if (!movie) {
        return res.status(404).json({
          error: "Not Found",
          message: `Movie with ID '${id}' was not found.`,
          code: 404
        });
      }
      const existingRatingIndex = movie.ratings.findIndex((r) => r.userId === userId);
      const newRating = {
        userId,
        username,
        rating,
        comment: comment ? comment.trim() : void 0,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (existingRatingIndex >= 0) {
        movie.ratings[existingRatingIndex] = newRating;
      } else {
        movie.ratings.push(newRating);
      }
      const sum = movie.ratings.reduce((acc, r) => acc + r.rating, 0);
      movie.rating = parseFloat((sum / movie.ratings.length).toFixed(1));
      saveDB();
      res.status(200).json({
        message: "Rating saved successfully",
        averageRating: movie.rating,
        ratingsCount: movie.ratings.length,
        movie
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message, code: 500 });
    }
  });
  app.get("/api/genres", (req, res) => {
    const genres = Array.from(new Set(movies.map((m) => m.genre)));
    res.status(200).json(genres);
  });
  app.get("/api/profiles", (req, res) => {
    res.status(200).json(profiles);
  });
  app.post("/api/profiles", (req, res) => {
    try {
      const { id, username, avatar, genrePreferences } = req.body;
      if (!id || !username) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Validation failed: 'id' and 'username' are required fields.",
          code: 400
        });
      }
      const existingIndex = profiles.findIndex((p) => p.id === id);
      const profileData = {
        id,
        username: username.trim(),
        avatar: avatar || "popcorn",
        genrePreferences: Array.isArray(genrePreferences) ? genrePreferences : [],
        watchlist: existingIndex >= 0 ? profiles[existingIndex].watchlist : [],
        joinedAt: existingIndex >= 0 ? profiles[existingIndex].joinedAt : (/* @__PURE__ */ new Date()).toISOString()
      };
      if (existingIndex >= 0) {
        profiles[existingIndex] = profileData;
      } else {
        profiles.push(profileData);
      }
      saveDB();
      res.status(200).json({
        message: "Profile saved successfully",
        profile: profileData
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message, code: 500 });
    }
  });
  app.post("/api/profiles/:userId/watchlist", (req, res) => {
    try {
      const { userId } = req.params;
      const { movieId } = req.body;
      if (!movieId) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Validation failed: 'movieId' is required in the body.",
          code: 400
        });
      }
      let profile = profiles.find((p) => p.id === userId);
      if (!profile) {
        profile = {
          id: userId,
          username: "AnonymousViewer",
          avatar: "popcorn",
          genrePreferences: [],
          watchlist: [],
          joinedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        profiles.push(profile);
      }
      const movieExists = movies.some((m) => m.id === movieId);
      if (!movieExists) {
        return res.status(404).json({
          error: "Not Found",
          message: `Movie with ID '${movieId}' does not exist.`,
          code: 404
        });
      }
      const index = profile.watchlist.indexOf(movieId);
      let action = "added";
      if (index >= 0) {
        profile.watchlist.splice(index, 1);
        action = "removed";
      } else {
        profile.watchlist.push(movieId);
      }
      saveDB();
      res.status(200).json({
        message: `Movie was successfully ${action} watchlist.`,
        action,
        watchlist: profile.watchlist
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message, code: 500 });
    }
  });
  app.get("/api/social/shares", (req, res) => {
    res.status(200).json(sharedLists);
  });
  app.post("/api/social/shares", (req, res) => {
    try {
      const { title, description, ownerId, ownerName, movieIds, isCollaborative } = req.body;
      if (!title || !ownerId || !ownerName || !Array.isArray(movieIds) || movieIds.length === 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Validation failed: 'title', 'ownerId', 'ownerName', and non-empty 'movieIds' array are required.",
          code: 400
        });
      }
      const newShare = {
        id: `s-${Date.now()}`,
        title: title.trim(),
        description: description ? description.trim() : "",
        ownerId,
        ownerName,
        movieIds,
        comments: [],
        activeViewers: [ownerName],
        isCollaborative: !!isCollaborative
      };
      sharedLists.unshift(newShare);
      saveDB();
      res.status(201).json({
        message: "Movie list shared successfully",
        sharedList: newShare
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message, code: 500 });
    }
  });
  app.post("/api/social/shares/:shareId/collaborate", (req, res) => {
    try {
      const { shareId } = req.params;
      const { username, action } = req.body;
      if (!username || !action) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Validation failed: 'username' and 'action' are required parameters.",
          code: 400
        });
      }
      const list = sharedLists.find((s) => s.id === shareId);
      if (!list) {
        return res.status(404).json({
          error: "Not Found",
          message: `Shared list with ID '${shareId}' was not found.`,
          code: 404
        });
      }
      if (action === "join") {
        if (!list.activeViewers.includes(username)) {
          list.activeViewers.push(username);
        }
      } else if (action === "leave") {
        list.activeViewers = list.activeViewers.filter((u) => u !== username);
      } else {
        return res.status(400).json({
          error: "Bad Request",
          message: "Validation failed: 'action' must be either 'join' or 'leave'.",
          code: 400
        });
      }
      saveDB();
      res.status(200).json({
        message: `Successfully ${action}ed the collaborative session.`,
        activeViewers: list.activeViewers,
        sharedList: list
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message, code: 500 });
    }
  });
  app.post("/api/social/shares/:shareId/comment", (req, res) => {
    try {
      const { shareId } = req.params;
      const { userId, username, text } = req.body;
      if (!userId || !username || !text || !text.trim()) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Validation failed: 'userId', 'username', and a non-empty 'text' are required.",
          code: 400
        });
      }
      const list = sharedLists.find((s) => s.id === shareId);
      if (!list) {
        return res.status(404).json({
          error: "Not Found",
          message: `Shared list with ID '${shareId}' was not found.`,
          code: 404
        });
      }
      list.comments.push({
        userId,
        username,
        text: text.trim(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      saveDB();
      res.status(201).json({
        message: "Comment added successfully",
        comments: list.comments
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message, code: 500 });
    }
  });
  app.post("/api/analytics/search-log", (req, res) => {
    try {
      const { query, genreFilter, resultsCount } = req.body;
      if (query === void 0) {
        return res.status(400).json({ error: "Bad Request", message: "Query string is required" });
      }
      const log = {
        query: query.trim(),
        genreFilter: genreFilter || void 0,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        resultsCount: typeof resultsCount === "number" ? resultsCount : 0
      };
      searchLogs.push(log);
      if (searchLogs.length > 100) {
        searchLogs.shift();
      }
      saveDB();
      res.status(201).json({ success: true, log });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
  });
  app.get("/api/analytics", (req, res) => {
    try {
      const totalMovies = movies.length;
      const genreDistribution = {};
      movies.forEach((m) => {
        genreDistribution[m.genre] = (genreDistribution[m.genre] || 0) + 1;
      });
      const ratedMovies = movies.filter((m) => m.ratings.length > 0);
      const totalAvgRating = ratedMovies.length > 0 ? parseFloat((ratedMovies.reduce((acc, m) => acc + m.rating, 0) / ratedMovies.length).toFixed(2)) : 0;
      let totalRatingsCount = 0;
      movies.forEach((m) => {
        totalRatingsCount += m.ratings.length;
      });
      const queryCounts = {};
      searchLogs.forEach((log) => {
        if (log.query && log.query.length >= 2) {
          const word = log.query.toLowerCase().trim();
          queryCounts[word] = (queryCounts[word] || 0) + 1;
        }
      });
      const topSearchQueries = Object.keys(queryCounts).map((word) => ({ text: word, value: queryCounts[word] })).sort((a, b) => b.value - a.value).slice(0, 10);
      const watchlistFrequencies = {};
      profiles.forEach((p) => {
        p.watchlist.forEach((mId) => {
          watchlistFrequencies[mId] = (watchlistFrequencies[mId] || 0) + 1;
        });
      });
      const movieSaves = Object.keys(watchlistFrequencies).map((mId) => {
        const movie = movies.find((m) => m.id === mId);
        return {
          id: mId,
          title: movie ? movie.title : "Unknown Movie",
          saves: watchlistFrequencies[mId]
        };
      }).sort((a, b) => b.saves - a.saves).slice(0, 5);
      const activeWatchSessionsCount = sharedLists.reduce((acc, list) => acc + list.activeViewers.length, 0);
      res.status(200).json({
        totalMovies,
        genreDistribution,
        totalAvgRating,
        totalRatingsCount,
        topSearchQueries,
        movieSaves,
        activeWatchSessionsCount,
        profilesCount: profiles.length,
        sharedListsCount: sharedLists.length
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message, code: 500 });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  startListening(preferredPort);
}
startServer().catch((err) => {
  console.error("Critical error starting Movie Collection full-stack server:", err);
});
//# sourceMappingURL=server.cjs.map
