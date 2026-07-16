import React, { useState } from "react";
import { X, Star, Clock, User, Bookmark, MessageSquare, Send, Calendar, AlertCircle } from "lucide-react";
import { Movie, Rating, UserProfile } from "../types";

interface MovieDetailsModalProps {
  movie: Movie;
  activeProfile: UserProfile;
  isSaved: boolean;
  onClose: () => void;
  onToggleWatchlist: (movieId: string) => void;
  onSubmitRating: (movieId: string, rating: number, comment: string) => Promise<void>;
}

export default function MovieDetailsModal({
  movie,
  activeProfile,
  isSaved,
  onClose,
  onToggleWatchlist,
  onSubmitRating
}: MovieDetailsModalProps) {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await onSubmitRating(movie.id, selectedRating, commentText);
      setSuccessMessage("Thank you! Your rating has been recorded successfully.");
      setCommentText("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarIcon = (name: string) => {
    switch (name) {
      case "clapperboard":
        return "🎬";
      case "ticket":
        return "🎟️";
      case "camera":
        return "📷";
      case "film":
        return "🎞️";
      default:
        return "🍿";
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/95 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl transition-all my-8">
        
        {/* Header Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-gray-400 hover:text-white transition-colors"
          title="Close details"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Wide Banner Image */}
        <div className="relative h-48 sm:h-64 w-full bg-[#050505]">
          <img
            src={movie.bannerUrl}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          
          {/* Movie Title & Badges overlaid on banner */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 sm:left-6 sm:bottom-6 sm:right-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-orange-600 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-orange-600/20">
                {movie.genre}
              </span>
              <span className="rounded bg-black/80 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-gray-300 backdrop-blur-sm">
                {movie.year}
              </span>
              <span className="flex items-center gap-1 rounded bg-black/80 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-gray-300 backdrop-blur-sm">
                <Clock className="h-3 w-3 text-orange-500" />
                {movie.duration} min
              </span>
            </div>
            
            <h2 className="font-sans text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md uppercase">
              {movie.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[calc(100vh-320px)] overflow-y-auto">
          
          {/* Left Column - Synopsis & Movie Meta */}
          <div className="md:col-span-7 flex flex-col gap-5">
            <div>
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-gray-400">
                Synopsis
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-200">
                {movie.synopsis}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Director
                </span>
                <p className="text-sm font-semibold text-gray-200">{movie.director}</p>
              </div>
              <div>
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Watchlist Status
                </span>
                <button
                  onClick={() => onToggleWatchlist(movie.id)}
                  className={`mt-1.5 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                    isSaved
                      ? "bg-orange-600/10 text-orange-500 border border-orange-600/30"
                      : "bg-[#050505] text-gray-300 border border-white/10 hover:bg-white/5"
                  }`}
                >
                  <Bookmark className="h-3 w-3" fill={isSaved ? "currentColor" : "none"} />
                  <span>{isSaved ? "Saved" : "Bookmark"}</span>
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-widest text-gray-400">
                  <MessageSquare className="h-3.5 w-3.5 text-orange-500" />
                  <span>User Reviews ({movie.ratings.length})</span>
                </h3>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-gray-500">Avg:</span>
                  <span className="font-bold text-orange-500">{movie.rating > 0 ? movie.rating : "No ratings"}</span>
                  <Star className="h-3 w-3 text-orange-500" fill="currentColor" />
                </div>
              </div>

              {movie.ratings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-[#050505]/20 p-6 text-center">
                  <p className="text-xs text-gray-500">
                    No reviews yet. Be the first to rate and share your thoughts!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {movie.ratings.map((review, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-black/40 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">🍿</span>
                          <span className="font-sans text-xs font-bold text-gray-200">
                            {review.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, starIdx) => (
                            <Star
                              key={starIdx}
                              className={`h-2.5 w-2.5 ${
                                starIdx < review.rating ? "text-orange-500" : "text-gray-800"
                              }`}
                              fill={starIdx < review.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-1 text-xs text-gray-300 leading-relaxed font-sans">
                          {review.comment}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-end font-mono text-[9px] text-gray-500">
                        <Calendar className="mr-1 h-2.5 w-2.5" />
                        <span>{formatDate(review.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Submission Form */}
          <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
            <div className="sticky top-0 bg-[#0a0a0a]">
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Rate & Review
              </h3>

              <form onSubmit={handleRatingSubmit} className="flex flex-col gap-4">
                {/* Score Stars Choice */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold">
                    Your Rating Score
                  </label>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const score = idx + 1;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedRating(score)}
                          className="text-orange-500 transition-all hover:scale-110"
                        >
                          <Star
                            className="h-6 w-6"
                            fill={selectedRating >= score ? "currentColor" : "none"}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 font-mono text-sm font-bold text-gray-300">
                      {selectedRating} / 5 stars
                    </span>
                  </div>
                </div>

                {/* Feedback Comment box */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold">
                    Write Review Comment (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Provide your thoughts on the cinematography, acting, storyline, or score..."
                    className="w-full rounded-xl border border-white/10 bg-[#050505] px-3 py-2 text-xs text-gray-100 placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
                  />
                </div>

                {/* Notifications */}
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-orange-500 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-orange-600/20"
                >
                  <Send className="h-3 w-3" />
                  <span>{isSubmitting ? "Submitting..." : "Submit My Review"}</span>
                </button>
              </form>

              {/* Connected Active User Details */}
              <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-3 flex items-center gap-2.5">
                <span className="text-sm">{getAvatarIcon(activeProfile.avatar)}</span>
                <div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    Reviewing as
                  </p>
                  <p className="text-xs font-bold text-gray-300">
                    {activeProfile.username}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
