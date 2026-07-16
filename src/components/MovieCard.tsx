import React from "react";
import { Star, Clock, User, Bookmark, ExternalLink } from "lucide-react";
import { Movie } from "../types";

interface MovieCardProps {
  key?: React.Key;
  movie: Movie;
  onViewDetails: (movie: Movie) => void;
  onToggleWatchlist: (movieId: string) => void;
  isSaved: boolean;
}

export default function MovieCard({
  movie,
  onViewDetails,
  onToggleWatchlist,
  isSaved
}: MovieCardProps) {
  const getGenreColor = (genre: string) => {
    switch (genre.toLowerCase()) {
      case "sci-fi":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "action":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "drama":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "animation":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "thriller":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "comedy":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "horror":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "romance":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/50 p-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:bg-[#0a0a0a]/80 hover:shadow-2xl hover:shadow-orange-600/5">
      {/* Movie Image Poster Container */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#050505]">
        <img
          src={movie.imageUrl}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />

        {/* Top Floating Badge & Action */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {/* Watchlist Bookmark */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(movie.id);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg backdrop-blur-md transition-all ${
              isSaved
                ? "bg-orange-600 text-white hover:bg-orange-500"
                : "bg-black/70 text-gray-300 hover:bg-black hover:text-white"
            }`}
            title={isSaved ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Movie duration on image bottom-right */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9px] text-gray-300 backdrop-blur-sm">
          <Clock className="h-2.5 w-2.5 text-orange-500" />
          <span>{movie.duration}m</span>
        </div>

        {/* Floating average rating bottom-left */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-orange-600 px-1.5 py-0.5 font-sans text-[10px] font-bold text-white shadow-md shadow-orange-600/30">
          <Star className="h-3 w-3" fill="currentColor" />
          <span>{movie.rating > 0 ? movie.rating : "NR"}</span>
        </div>
      </div>

      {/* Content Details */}
      <div className="mt-3.5 flex flex-col gap-2">
        {/* Genre and Year row */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wider ${getGenreColor(
              movie.genre
            )}`}
          >
            {movie.genre}
          </span>
          <span className="font-mono text-xs text-gray-500">{movie.year}</span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-1 font-sans text-sm font-extrabold tracking-tight text-white group-hover:text-orange-500 transition-colors uppercase">
          {movie.title}
        </h3>

        {/* Director */}
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <User className="h-3 w-3 text-gray-500" />
          <span className="truncate">Dir: {movie.director}</span>
        </div>

        {/* Synopsis snippet */}
        <p className="line-clamp-2 text-xs leading-relaxed text-gray-400">
          {movie.synopsis}
        </p>

        {/* Action Button */}
        <button
          onClick={() => onViewDetails(movie)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white transition-all"
        >
          <span>View Details</span>
          <ExternalLink className="h-3 w-3 text-orange-500" />
        </button>
      </div>
    </div>
  );
}
