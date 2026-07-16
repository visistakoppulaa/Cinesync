import React, { useState, useEffect } from "react";
import { User, Sparkles, Plus, Check, Star, ArrowRight, Save } from "lucide-react";
import { Movie, UserProfile } from "../types";

interface UserProfileSettingsProps {
  activeProfile: UserProfile;
  movies: Movie[];
  onSaveProfile: (profile: UserProfile) => Promise<void>;
  onViewDetails: (movie: Movie) => void;
  onToggleWatchlist: (movieId: string) => void;
}

export default function UserProfileSettings({
  activeProfile,
  movies,
  onSaveProfile,
  onViewDetails,
  onToggleWatchlist
}: UserProfileSettingsProps) {
  const [username, setUsername] = useState<string>(activeProfile.username);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(activeProfile.avatar);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(activeProfile.genrePreferences);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("");

  const avatars = [
    { id: "popcorn", icon: "🍿", label: "Popcorn" },
    { id: "clapperboard", icon: "🎬", label: "Director" },
    { id: "ticket", icon: "🎟️", label: "Ticket" },
    { id: "camera", icon: "📷", label: "Camera" },
    { id: "film", icon: "🎞️", label: "Film reel" }
  ];

  const availableGenres = [
    "Sci-Fi", "Action", "Drama", "Animation", "Thriller", "Comedy", "Horror", "Romance", "Fantasy"
  ];

  useEffect(() => {
    setUsername(activeProfile.username);
    setSelectedAvatar(activeProfile.avatar);
    setSelectedGenres(activeProfile.genrePreferences);
  }, [activeProfile]);

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      const updatedProfile: UserProfile = {
        ...activeProfile,
        username: username.trim(),
        avatar: selectedAvatar,
        genrePreferences: selectedGenres
      };
      await onSaveProfile(updatedProfile);
      setSaveMessage("Profile updated and synced successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err: any) {
      setSaveMessage("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Personalized recommendations engine:
  // Find movies that match preferred genres AND are not already in the watchlist, sorted by rating desc.
  const getPersonalizedRecommendations = (): Movie[] => {
    if (selectedGenres.length === 0) {
      // Fallback: return top-rated movies not in watchlist
      return movies
        .filter((m) => !activeProfile.watchlist.includes(m.id))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    }

    return movies
      .filter((m) => {
        const matchesGenre = selectedGenres.some((g) => g.toLowerCase() === m.genre.toLowerCase());
        const notInWatchlist = !activeProfile.watchlist.includes(m.id);
        return matchesGenre && notInWatchlist;
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  };

  const recommendations = getPersonalizedRecommendations();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Profile settings card */}
      <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0a0a0a]/50 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-orange-500" />
          <h2 className="font-sans text-base font-bold text-white uppercase tracking-wider">Your Profile Settings</h2>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <label className="block font-sans text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Profile Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. CinemaLover"
              className="w-full rounded-xl border border-white/10 bg-[#050505] px-3.5 py-2 text-xs font-medium text-gray-100 placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
            />
          </div>

          {/* Avatar select */}
          <div>
            <label className="block font-sans text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Select Avatar Badge
            </label>
            <div className="flex flex-wrap gap-2">
              {avatars.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedAvatar === av.id
                      ? "border-orange-600 bg-orange-600/10 text-orange-500"
                      : "border-white/10 bg-[#050505] text-gray-400 hover:border-white/20 hover:text-gray-300"
                  }`}
                >
                  <span>{av.icon}</span>
                  <span className="text-[10px]">{av.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Genres */}
          <div>
            <label className="block font-sans text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Favorite Film Genres
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableGenres.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all ${
                      isSelected
                        ? "border-orange-600/40 bg-orange-600/15 text-orange-500"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200"
                    }`}
                  >
                    {isSelected ? <Check className="h-3 w-3 text-orange-500" /> : <Plus className="h-3 w-3 text-gray-500" />}
                    <span>{genre}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {saveMessage && (
            <p className="font-sans text-xs font-bold text-orange-500 bg-orange-500/5 border border-orange-500/10 rounded-lg p-2 text-center uppercase tracking-widest">
              {saveMessage}
            </p>
          )}

          {/* Save button */}
          <button
            type="submit"
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-orange-600/20 hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Syncing..." : "Save & Cloud Sync"}</span>
          </button>
        </form>
      </div>

      {/* Recommendations card */}
      <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0a0a0a]/30 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <h2 className="font-sans text-base font-bold text-white uppercase tracking-wider">
              Personalized Recommendations
            </h2>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 bg-black/60 border border-white/10 px-2 py-0.5 rounded">
            Based on chosen genres
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#050505]/20 p-12 text-center h-[260px]">
            <Sparkles className="h-8 w-8 text-gray-700 mb-2" />
            <p className="text-xs text-gray-500 font-sans max-w-sm">
              We couldn't find matching recommendations. Try selecting different favorite genres on the left!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            <p className="text-xs text-gray-400 font-sans">
              Hand-picked from our movie database based on your preferred genre settings (
              <span className="text-orange-500 font-semibold">{selectedGenres.join(", ") || "None selected"}</span>
              ) and rating metrics:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommendations.map((movie) => (
                <div
                  key={movie.id}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2.5 transition-all hover:border-white/20 hover:bg-black/60"
                >
                  {/* Small poster */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#050505]">
                    <img
                      src={movie.imageUrl}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded bg-orange-600 px-1 py-0.5 font-sans text-[8px] font-bold text-white shadow shadow-orange-600/30">
                      <Star className="h-2 w-2" fill="currentColor" />
                      <span>{movie.rating}</span>
                    </div>
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-gray-200 line-clamp-1 group-hover:text-orange-500 transition-colors uppercase">
                    {movie.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                    {movie.genre} · {movie.year}
                  </p>

                  <button
                    onClick={() => onViewDetails(movie)}
                    className="mt-2.5 flex w-full items-center justify-between rounded bg-black p-1 font-sans text-[10px] text-gray-400 group-hover:bg-white/5 group-hover:text-white transition-all border border-white/5"
                  >
                    <span>View synopsis</span>
                    <ArrowRight className="h-2.5 w-2.5 text-orange-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
