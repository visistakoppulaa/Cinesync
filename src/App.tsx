import React, { useState, useEffect } from "react";
import { Movie, UserProfile, SharedList, SystemAnalytics } from "./types";
import Navbar from "./components/Navbar";
import MovieCard from "./components/MovieCard";
import MovieDetailsModal from "./components/MovieDetailsModal";
import UserProfileSettings from "./components/UserProfileSettings";
import SocialHub from "./components/SocialHub";
import ApiPlayground from "./components/ApiPlayground";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import {
  Search,
  SlidersHorizontal,
  PlusCircle,
  X,
  Bookmark,
  Sparkles,
  RefreshCw,
  WifiOff,
  FolderPlus,
  Compass,
  Check,
  AlertCircle
} from "lucide-react";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("movies");
  
  // Database States
  const [movies, setMovies] = useState<Movie[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [sharedLists, setSharedLists] = useState<SharedList[]>([]);
  const [analytics, setAnalytics] = useState<SystemAnalytics>({
    totalMovies: 0,
    genreDistribution: {},
    totalAvgRating: 0,
    totalRatingsCount: 0,
    topSearchQueries: [],
    movieSaves: [],
    activeWatchSessionsCount: 0,
    profilesCount: 0,
    sharedListsCount: 0
  });

  // Current active user
  const [activeProfileId, setActiveProfileId] = useState<string>("u-sys");
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || {
    id: activeProfileId,
    username: "CinematicGamer",
    avatar: "popcorn",
    genrePreferences: ["Sci-Fi", "Action"],
    watchlist: [],
    joinedAt: new Date().toISOString()
  };

  // UI state overlays
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(false);
  const [showAddMovieDrawer, setShowAddMovieDrawer] = useState<boolean>(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("newest"); // newest, rating, year, title
  const [minYear, setMinYear] = useState<number>(1970);

  // Synchronization and Offline State
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string>("");

  // Add Movie Form State
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDirector, setNewDirector] = useState<string>("");
  const [newYear, setNewYear] = useState<number>(2024);
  const [newGenre, setNewGenre] = useState<string>("Sci-Fi");
  const [newSynopsis, setNewSynopsis] = useState<string>("");
  const [newDuration, setNewDuration] = useState<number>(120);
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newBannerUrl, setNewBannerUrl] = useState<string>("");
  const [addMovieError, setAddMovieError] = useState<string>("");
  const [addMovieSuccess, setAddMovieSuccess] = useState<string>("");

  // --------------------------------------------------------
  // DATA FETCHERS & API BINDINGS
  // --------------------------------------------------------

  // Fetch all movies
  const fetchMovies = async (query = "", genre = "", sort = "") => {
    if (isOffline) {
      // Offline fallback: load from local cache if exist, otherwise fallback
      const cached = localStorage.getItem("cinesync_cached_movies");
      if (cached) {
        let list: Movie[] = JSON.parse(cached);
        if (query) {
          list = list.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()));
        }
        if (genre && genre !== "All") {
          list = list.filter((m) => m.genre.toLowerCase() === genre.toLowerCase());
        }
        setMovies(list);
      }
      return;
    }

    try {
      const qParams = new URLSearchParams();
      if (query) qParams.set("q", query);
      if (genre && genre !== "All") qParams.set("genre", genre);
      if (sort) qParams.set("sort", sort);

      const res = await fetch(`/api/movies?${qParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
        // Cache loaded list
        localStorage.setItem("cinesync_cached_movies", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to fetch movies:", err);
    }
  };

  // Fetch profiles list
  const fetchProfiles = async () => {
    if (isOffline) {
      const cached = localStorage.getItem("cinesync_cached_profiles");
      if (cached) setProfiles(JSON.parse(cached));
      return;
    }
    try {
      const res = await fetch("/api/profiles");
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
        localStorage.setItem("cinesync_cached_profiles", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
    }
  };

  // Fetch shared watchlists
  const fetchSharedLists = async () => {
    if (isOffline) {
      const cached = localStorage.getItem("cinesync_cached_shares");
      if (cached) setSharedLists(JSON.parse(cached));
      return;
    }
    try {
      const res = await fetch("/api/social/shares");
      if (res.ok) {
        const data = await res.json();
        setSharedLists(data);
        localStorage.setItem("cinesync_cached_shares", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to fetch shared lists:", err);
    }
  };

  // Fetch system statistics
  const fetchAnalytics = async () => {
    if (isOffline) return;
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  // Trigger content discovery logger on backend
  const logSearchQuery = async (query: string, filter: string, count: number) => {
    if (isOffline || !query.trim()) return;
    try {
      await fetch("/api/analytics/search-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, genreFilter: filter, resultsCount: count })
      });
    } catch (err) {
      console.error("Failed to log search queries:", err);
    }
  };

  // Initial loading trigger
  useEffect(() => {
    const init = async () => {
      setIsSyncing(true);
      await Promise.all([fetchMovies(), fetchProfiles(), fetchSharedLists(), fetchAnalytics()]);
      setIsSyncing(false);
    };
    init();
  }, [isOffline]);

  // Handle live query logging
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const delayDebounceFn = setTimeout(() => {
        logSearchQuery(searchQuery, genreFilter, movies.length);
        fetchAnalytics(); // Refresh word cloud cloud metrics
      }, 1000);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, genreFilter]);

  // Handle active queries search action
  useEffect(() => {
    fetchMovies(searchQuery, genreFilter, sortBy);
  }, [searchQuery, genreFilter, sortBy]);

  // --------------------------------------------------------
  // USER OPERATIONS
  // --------------------------------------------------------

  // Toggle offline simulator mode
  const handleToggleOffline = () => {
    setIsOffline((prev) => {
      const next = !prev;
      setSyncFeedback(next ? "Offline browsing active" : "Cloud synchronization restored");
      setTimeout(() => setSyncFeedback(""), 3000);
      return next;
    });
  };

  // Force Cloud Sync triggers manually
  const handleForceSync = async () => {
    if (isOffline) return;
    setIsSyncing(true);
    setSyncFeedback("Syncing with Cloud...");
    
    await Promise.all([
      fetchMovies(searchQuery, genreFilter, sortBy),
      fetchProfiles(),
      fetchSharedLists(),
      fetchAnalytics()
    ]);

    setIsSyncing(false);
    setSyncFeedback("All data up to date!");
    setTimeout(() => setSyncFeedback(""), 3000);
  };

  // Watchlist bookmarker toggle action
  const handleToggleWatchlist = async (movieId: string) => {
    const movie = movies.find((m) => m.id === movieId);
    const movieTitle = movie ? movie.title : "Movie";

    // 1. Pessimistic update in server
    if (!isOffline) {
      try {
        const res = await fetch(`/api/profiles/${activeProfile.id}/watchlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId })
        });
        if (res.ok) {
          const result = await res.json();
          // Update local profile watchlist state
          setProfiles((prev) =>
            prev.map((p) => (p.id === activeProfile.id ? { ...p, watchlist: result.watchlist } : p))
          );
          
          const isAdded = result.watchlist.includes(movieId);
          setSyncFeedback(isAdded ? `🔖 Saved "${movieTitle}" to your Watchlist!` : `Removed "${movieTitle}" from your Watchlist`);
          setTimeout(() => setSyncFeedback(""), 3000);
          
          fetchAnalytics(); // Refresh saved numbers
        }
      } catch (err) {
        console.error("Failed to sync watchlist toggle:", err);
      }
    } else {
      // 2. Offline Mode local state update
      const isSavedCurrently = activeProfile.watchlist.includes(movieId);
      const updatedWatchlist = isSavedCurrently
        ? activeProfile.watchlist.filter((id) => id !== movieId)
        : [...activeProfile.watchlist, movieId];

      setProfiles((prev) =>
        prev.map((p) => (p.id === activeProfile.id ? { ...p, watchlist: updatedWatchlist } : p))
      );
      
      setSyncFeedback(!isSavedCurrently ? `🔖 Saved "${movieTitle}" locally (Offline)` : `Removed "${movieTitle}" locally`);
      setTimeout(() => setSyncFeedback(""), 3000);

      // Persist locally
      const cachedProfiles = profiles.map((p) =>
        p.id === activeProfile.id ? { ...p, watchlist: updatedWatchlist } : p
      );
      localStorage.setItem("cinesync_cached_profiles", JSON.stringify(cachedProfiles));
    }
  };

  // Submit movie review with ratings
  const handleSubmitRating = async (movieId: string, rating: number, comment: string) => {
    if (isOffline) {
      throw new Error("Submit rating rejected: server connection is offline.");
    }

    const payload = {
      userId: activeProfile.id,
      username: activeProfile.username,
      rating,
      comment
    };

    const res = await fetch(`/api/movies/${movieId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to submit rating");
    }

    const result = await res.json();
    
    // Update local movies state with calculated values
    setMovies((prev) => prev.map((m) => (m.id === movieId ? result.movie : m)));
    // If selected movie detail modal is open, sync that too
    if (selectedMovie && selectedMovie.id === movieId) {
      setSelectedMovie(result.movie);
    }
    
    fetchAnalytics(); // Sync ratings tally counts
  };

  // Create new shared list (social watchlist)
  const handleCreateShare = async (
    title: string,
    description: string,
    movieIds: string[],
    isCollaborative: boolean
  ) => {
    if (isOffline) return;

    try {
      const payload = {
        title,
        description,
        ownerId: activeProfile.id,
        ownerName: activeProfile.username,
        movieIds,
        isCollaborative
      };

      const res = await fetch("/api/social/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        setSharedLists((prev) => [result.sharedList, ...prev]);
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Join or leave social collaborative viewing room
  const handleJoinLeaveSession = async (shareId: string, action: "join" | "leave") => {
    if (isOffline) return;

    try {
      const res = await fetch(`/api/social/shares/${shareId}/collaborate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: activeProfile.username, action })
      });

      if (res.ok) {
        const result = await res.json();
        setSharedLists((prev) =>
          prev.map((s) => (s.id === shareId ? result.sharedList : s))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Post live co-watching comments
  const handleAddComment = async (shareId: string, text: string) => {
    if (isOffline) return;

    try {
      const res = await fetch(`/api/social/shares/${shareId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeProfile.id,
          username: activeProfile.username,
          text
        })
      });

      if (res.ok) {
        const result = await res.json();
        setSharedLists((prev) =>
          prev.map((s) => (s.id === shareId ? { ...s, comments: result.comments } : s))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit / Save Profile preferences
  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    if (isOffline) {
      setProfiles((prev) => prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)));
      const cached = profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p));
      localStorage.setItem("cinesync_cached_profiles", JSON.stringify(cached));
      return;
    }

    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile)
      });

      if (res.ok) {
        const result = await res.json();
        setProfiles((prev) =>
          prev.map((p) => (p.id === updatedProfile.id ? result.profile : p))
        );
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Movie form submission handler
  const handleAddMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMovieError("");
    setAddMovieSuccess("");

    if (isOffline) {
      setAddMovieError("Adding movies is locked while offline. Restore connection first.");
      return;
    }

    // Client-side validations
    if (!newTitle.trim() || !newDirector.trim() || !newSynopsis.trim()) {
      setAddMovieError("Title, Director, and Synopsis plot are required fields.");
      return;
    }

    if (newYear < 1888 || newYear > new Date().getFullYear() + 5) {
      setAddMovieError(`Release year must be between 1888 and ${new Date().getFullYear() + 5}.`);
      return;
    }

    if (newDuration <= 0) {
      setAddMovieError("Duration must be a positive number of minutes.");
      return;
    }

    const payload = {
      title: newTitle.trim(),
      director: newDirector.trim(),
      year: newYear,
      genre: newGenre,
      synopsis: newSynopsis.trim(),
      duration: newDuration,
      imageUrl: newImageUrl.trim(),
      bannerUrl: newBannerUrl.trim(),
      addedBy: activeProfile.id
    };

    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setAddMovieError(data.message || "Failed to add movie.");
      } else {
        setAddMovieSuccess("Success! Movie added and cloud synced.");
        setMovies((prev) => [data.movie, ...prev]);
        
        // Clear fields
        setNewTitle("");
        setNewDirector("");
        setNewYear(2024);
        setNewSynopsis("");
        setNewDuration(120);
        setNewImageUrl("");
        setNewBannerUrl("");

        fetchAnalytics(); // Sync totals

        // Hide drawer after short timeout
        setTimeout(() => {
          setShowAddMovieDrawer(false);
          setAddMovieSuccess("");
        }, 2000);
      }
    } catch (err: any) {
      setAddMovieError(err.message || "Network connection failed.");
    }
  };

  const getGenreList = () => {
    const list = new Set(movies.map((m) => m.genre));
    return ["All", ...Array.from(list)];
  };

  // Filter movies that match minYear range slider
  const displayedMovies = movies.filter((m) => m.year >= minYear);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 selection:bg-orange-600 selection:text-white">
      
      {/* Sleek Top Navbar */}
      <Navbar
        activeProfile={activeProfile}
        isOffline={isOffline}
        isSyncing={isSyncing}
        onToggleOffline={handleToggleOffline}
        onForceSync={handleForceSync}
        onOpenProfile={() => setShowProfileDrawer(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Offline Alert Sticky Banner */}
      {isOffline && (
        <div className="bg-gradient-to-r from-orange-600/20 via-orange-500/20 to-orange-600/20 border-b border-white/10 px-4 py-2 flex items-center justify-center gap-2 text-xs text-orange-500">
          <WifiOff className="h-4 w-4 animate-bounce shrink-0" />
          <span className="font-sans font-bold uppercase tracking-wide">
            Offline Cache Browsing is active. Content ratings, adding movies, and social lists are temporarily read-only.
          </span>
        </div>
      )}

      {/* Sync State Feedback Popup */}
      {syncFeedback && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 shadow-2xl px-4 py-3.5 text-xs text-gray-200">
          {syncFeedback.includes("Syncing") || syncFeedback.includes("with Cloud") ? (
            <RefreshCw className="h-4 w-4 text-orange-500 animate-spin shrink-0" />
          ) : (
            <Check className="h-4 w-4 text-green-500 shrink-0" />
          )}
          <span className="font-sans font-medium">{syncFeedback}</span>
        </div>
      )}

      {/* Primary Container Layout */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        
        {/* Render Tab Contents */}
        {activeTab === "movies" && (
          <div className="flex flex-col gap-6">
            
            {/* Catalog Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/30 p-6 sm:p-8 backdrop-blur-sm">
              <div className="relative z-10 flex flex-col gap-3 max-w-2xl text-left">
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-orange-500 bg-orange-600/10 rounded-full px-2.5 py-0.5 w-fit">
                  LATE NIGHT COZY CINEMA
                </span>
                <h1 className="font-sans text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight uppercase">
                  Discover, Catalog, and Rate the Perfect Watchlist
                </h1>
                <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Welcome to CineSync, powered by DecodeLabs. Complete with sub-minute cloud syncing, advanced filtering, and a live REST API explorer playground.
                </p>

                <div className="flex flex-wrap items-center gap-2.5 mt-2">
                  <button
                    onClick={() => setShowAddMovieDrawer(true)}
                    className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-orange-600/20 hover:bg-orange-500 transition-all active:scale-95 cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Catalog New Movie</span>
                  </button>

                  <button
                    onClick={() => setShowProfileDrawer(true)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#050505] px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-300 hover:border-white/20 hover:text-white transition-all cursor-pointer"
                  >
                    <span>Configure Profile Recommendations</span>
                  </button>
                </div>
              </div>

              {/* Decorative background radial glows */}
              <div className="absolute top-0 right-0 h-[220px] w-[220px] rounded-full bg-orange-600/5 blur-[80px]" />
              <div className="absolute -bottom-10 -left-10 h-[220px] w-[220px] rounded-full bg-rose-500/5 blur-[80px]" />
            </div>

            {/* Simple Onboarding Steps banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-white/5 bg-gradient-to-r from-orange-950/10 to-black/30 p-4 text-left">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-600/20 text-[11px] font-bold text-orange-500">1</span>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-white">Browse the Catalog</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">Filter by genre, year, or search titles below.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-4">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-600/20 text-[11px] font-bold text-orange-500">2</span>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-white">Tap the Bookmark</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">Click the 🔖 button on any movie card to instantly add or remove from watchlist.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-4">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-600/20 text-[11px] font-bold text-orange-500">3</span>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-white">Manage Your Watchlist</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">Click "My Watchlist" in the top bar to view your saved film collection!</p>
                </div>
              </div>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-col gap-4 border-b border-white/5 pb-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                
                {/* Search query box */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-600" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, director, keyword..."
                    className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/30 py-2.5 pl-10 pr-4 text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/30 focus:bg-[#0a0a0a]/60 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute top-2.5 right-3 text-gray-500 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Genre chips row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <SlidersHorizontal className="h-4 w-4 text-gray-600 mr-1 shrink-0" />
                  {getGenreList().map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setGenreFilter(genre)}
                      className={`rounded-full px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider border transition-all duration-200 shrink-0 cursor-pointer ${
                        genreFilter === genre
                          ? "border-orange-500/40 bg-orange-600/10 text-orange-500"
                          : "border-white/10 bg-[#0a0a0a]/20 text-gray-400 hover:border-white/20 hover:text-gray-300"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced multi-filters panel */}
              <div className="flex flex-wrap items-center gap-5 text-left text-xs bg-[#0a0a0a]/20 border border-white/5 rounded-2xl p-4">
                {/* Sort drop menu */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-sans font-bold uppercase tracking-wider text-[10px]">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black px-2.5 py-1 text-gray-300 focus:outline-none focus:border-orange-500/30"
                  >
                    <option value="newest">Recently Added</option>
                    <option value="rating">Average Rating ⭐</option>
                    <option value="year">Release Year 📅</option>
                    <option value="title">Alphabetical (A-Z)</option>
                  </select>
                </div>

                {/* Year Range Slider */}
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <span className="text-gray-500 font-sans font-bold uppercase tracking-wider text-[10px] shrink-0">Year:</span>
                  <input
                    type="range"
                    min="1970"
                    max={new Date().getFullYear()}
                    value={minYear}
                    onChange={(e) => setMinYear(parseInt(e.target.value))}
                    className="flex-1 accent-orange-600 bg-black h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-mono text-[11px] font-bold text-orange-500 bg-black px-2 py-0.5 rounded border border-white/10">
                    &ge; {minYear}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setGenreFilter("All");
                    setSortBy("newest");
                    setMinYear(1970);
                  }}
                  className="font-sans text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-orange-500 ml-auto cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Movie collection layout */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sans text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Movie Database ({displayedMovies.length} found)
                </h2>
                
                {/* Quick total metric */}
                <span className="text-[10px] text-gray-500 font-mono bg-[#050505] px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider">
                  Cloud state synced
                </span>
              </div>

              {displayedMovies.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-16 text-center">
                  <SlidersHorizontal className="mx-auto h-8 w-8 text-gray-700 mb-2" />
                  <h3 className="font-sans text-sm font-bold text-gray-300 uppercase">
                    No movies match criteria
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-normal font-sans">
                    Try broadening your search text or shifting the release year slide filter back to 1970!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {displayedMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onViewDetails={(m) => setSelectedMovie(m)}
                      onToggleWatchlist={handleToggleWatchlist}
                      isSaved={activeProfile.watchlist.includes(movie.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Personalized Shelf (shown inside catalog tab too, for easy discovery) */}
            {activeProfile.watchlist.length > 0 && (
              <div className="mt-8 border-t border-white/5 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4.5 w-4.5 text-orange-500" fill="currentColor" />
                    <h3 className="font-sans text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Your Quick Watchlist Shelf ({activeProfile.watchlist.length} saved)
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {activeProfile.watchlist.map((mId) => {
                    const m = movies.find((item) => item.id === mId);
                    if (!m) return null;
                    return (
                      <div
                        key={mId}
                        onClick={() => setSelectedMovie(m)}
                        className="group cursor-pointer relative overflow-hidden rounded-xl border border-white/5 bg-black/50 p-2 text-left hover:border-white/10 transition-all hover:-translate-y-1"
                      >
                        <div className="aspect-[16/10] overflow-hidden rounded-lg bg-black relative">
                          <img
                            src={m.imageUrl}
                            alt={m.title}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover opacity-80"
                          />
                        </div>
                        <h4 className="mt-2 text-xs font-bold text-gray-300 truncate group-hover:text-orange-500 transition-colors uppercase">
                          {m.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{m.genre}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {activeTab === "watchlist" && (
          <div className="flex flex-col gap-6">
            {/* Watchlist Header Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/30 p-6 sm:p-8 backdrop-blur-sm">
              <div className="relative z-10 flex flex-col gap-3 max-w-2xl text-left">
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-orange-500 bg-orange-600/10 rounded-full px-2.5 py-0.5 w-fit">
                  YOUR PERSONAL SELECTION
                </span>
                <h1 className="font-sans text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight uppercase">
                  My Watchlist
                </h1>
                <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Your customized movie queue. Movies you add from the Catalog will appear here. Rate them, manage your list, or start a collaborative watch party with your community!
                </p>
              </div>
              <div className="absolute top-0 right-0 h-[220px] w-[220px] rounded-full bg-orange-600/5 blur-[80px]" />
            </div>

            {/* Watchlist Movies Grid */}
            <div>
              {activeProfile.watchlist.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-16 text-center">
                  <Bookmark className="mx-auto h-8 w-8 text-gray-600 mb-2 animate-pulse" />
                  <h3 className="font-sans text-sm font-bold text-gray-300 uppercase">
                    Your watchlist is empty
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-normal font-sans">
                    Explore the Catalog and click the bookmark button (🔖) on any movie to start building your collection!
                  </p>
                  <button
                    onClick={() => setActiveTab("movies")}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-orange-600/20 hover:bg-orange-500 transition-all active:scale-95 cursor-pointer"
                  >
                    Go to Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
                  {activeProfile.watchlist.map((mId) => {
                    const movie = movies.find((item) => item.id === mId);
                    if (!movie) return null;
                    return (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onViewDetails={(m) => setSelectedMovie(m)}
                        onToggleWatchlist={handleToggleWatchlist}
                        isSaved={true}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <SocialHub
            sharedLists={sharedLists}
            movies={movies}
            activeProfile={activeProfile}
            onCreateShare={handleCreateShare}
            onJoinLeaveSession={handleJoinLeaveSession}
            onAddComment={handleAddComment}
            onViewMovieDetails={(mId) => {
              const item = movies.find((m) => m.id === mId);
              if (item) setSelectedMovie(item);
            }}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsDashboard analytics={analytics} movies={movies} />
        )}

        {activeTab === "playground" && <ApiPlayground />}

      </main>

      {/* --------------------------------------------------------
          SLIDEOUT PANEL DRAWERS / MODALS
         -------------------------------------------------------- */}

      {/* Movie Details overlay modal */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          activeProfile={activeProfile}
          isSaved={activeProfile.watchlist.includes(selectedMovie.id)}
          onClose={() => setSelectedMovie(null)}
          onToggleWatchlist={handleToggleWatchlist}
          onSubmitRating={handleSubmitRating}
        />
      )}

      {/* Profile settings slideout drawer */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border-l border-white/10 h-screen overflow-y-auto p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
                  <h3 className="font-sans text-base font-bold text-white uppercase tracking-wider">
                    Personalized recommendations engine
                  </h3>
                </div>
                <button
                  onClick={() => setShowProfileDrawer(false)}
                  className="rounded-full bg-black p-1.5 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Inner recommendations widget */}
              <UserProfileSettings
                activeProfile={activeProfile}
                movies={movies}
                onSaveProfile={handleSaveProfile}
                onViewDetails={(m) => {
                  setSelectedMovie(m);
                  setShowProfileDrawer(false);
                }}
                onToggleWatchlist={handleToggleWatchlist}
              />
            </div>

            <div className="border-t border-white/5 pt-4 mt-6 text-center text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              User identity is persisted locally and synced across REST schemas
            </div>
          </div>
        </div>
      )}

      {/* Add Movie sidebar Drawer */}
      {showAddMovieDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a0a0a] border-l border-white/10 h-screen overflow-y-auto p-5 sm:p-6 text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-orange-500" />
                  <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-white">
                    Catalog New Movie
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddMovieDrawer(false)}
                  className="rounded-full bg-black p-1.5 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleAddMovieSubmit} className="flex flex-col gap-4">
                
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Movie Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Dune: Part Two"
                    className="w-full rounded-xl border border-white/10 bg-black px-3 py-1.5 text-xs text-gray-100 placeholder-gray-650 focus:outline-none focus:border-orange-500/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Director *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDirector}
                    onChange={(e) => setNewDirector(e.target.value)}
                    placeholder="e.g. Denis Villeneuve"
                    className="w-full rounded-xl border border-white/10 bg-black px-3 py-1.5 text-xs text-gray-100 placeholder-gray-650 focus:outline-none focus:border-orange-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                      Release Year *
                    </label>
                    <input
                      type="number"
                      required
                      value={newYear}
                      onChange={(e) => setNewYear(parseInt(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-black px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-orange-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                      Duration (mins) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newDuration}
                      onChange={(e) => setNewDuration(parseInt(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-black px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-orange-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Genre *
                  </label>
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-orange-500/40"
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Action">Action</option>
                    <option value="Drama">Drama</option>
                    <option value="Animation">Animation</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Horror">Horror</option>
                    <option value="Romance">Romance</option>
                    <option value="Fantasy">Fantasy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Synopsis / Plot *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newSynopsis}
                    onChange={(e) => setNewSynopsis(e.target.value)}
                    placeholder="Provide a detailed overview of the core cinematic conflict..."
                    className="w-full rounded-xl border border-white/10 bg-black px-3 py-1.5 text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Poster Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Unsplash photographic background URL"
                    className="w-full rounded-xl border border-white/10 bg-black px-3 py-1.5 text-xs text-gray-100 placeholder-gray-650 focus:outline-none focus:border-orange-500/40"
                  />
                </div>

                {addMovieError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400 font-sans">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{addMovieError}</span>
                  </div>
                )}

                {addMovieSuccess && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400 font-sans">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>{addMovieSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-orange-500 transition-all active:scale-95 cursor-pointer shadow-md shadow-orange-600/20"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Publish & Sync film</span>
                </button>
              </form>
            </div>

            <div className="border-t border-white/5 pt-4 mt-6 text-center text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              * Requires connection to active express microservice database
            </div>
          </div>
        </div>
      )}

      {/* Modern minimal footer */}
      <footer className="border-t border-white/5 bg-[#050505] py-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
          CineSync API Client &copy; 2026 Batch · DecodeLabs Industrial Training
        </p>
      </footer>

    </div>
  );
}
