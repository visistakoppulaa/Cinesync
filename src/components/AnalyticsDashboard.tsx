import React from "react";
import { BarChart3, Database, Star, MessageSquare, Users, Award, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { SystemAnalytics, Movie } from "../types";

interface AnalyticsDashboardProps {
  analytics: SystemAnalytics;
  movies: Movie[];
}

export default function AnalyticsDashboard({ analytics, movies }: AnalyticsDashboardProps) {
  const getStatPercent = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getGenreColor = (genre: string) => {
    switch (genre.toLowerCase()) {
      case "sci-fi":
        return "bg-cyan-500";
      case "action":
        return "bg-rose-500";
      case "drama":
        return "bg-orange-600";
      case "animation":
        return "bg-emerald-500";
      case "thriller":
        return "bg-purple-500";
      case "comedy":
        return "bg-orange-400";
      case "horror":
        return "bg-red-500";
      case "romance":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Movies */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/30 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Total Catalog
            </span>
            <Database className="h-4 w-4 text-orange-500" />
          </div>
          <p className="font-sans text-2xl font-extrabold text-white">
            {analytics.totalMovies}
          </p>
          <p className="font-sans text-[10px] text-gray-400 mt-1">
            Registered films in API
          </p>
        </div>

        {/* Avg Rating */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/30 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Average Score
            </span>
            <Star className="h-4 w-4 text-orange-500" fill="currentColor" />
          </div>
          <p className="font-sans text-2xl font-extrabold text-white">
            {analytics.totalAvgRating > 0 ? analytics.totalAvgRating : "N/A"}
          </p>
          <p className="font-sans text-[10px] text-gray-400 mt-1 font-mono">
            Out of 5 stars max
          </p>
        </div>

        {/* Total Reviews */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/30 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Active Reviews
            </span>
            <MessageSquare className="h-4 w-4 text-rose-500" />
          </div>
          <p className="font-sans text-2xl font-extrabold text-white">
            {analytics.totalRatingsCount}
          </p>
          <p className="font-sans text-[10px] text-gray-400 mt-1">
            Ratings submitted in cloud
          </p>
        </div>

        {/* Live Active co-watching */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/30 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Co-watchers
            </span>
            <Users className="h-4 w-4 text-cyan-400 animate-pulse" />
          </div>
          <p className="font-sans text-2xl font-extrabold text-white">
            {analytics.activeWatchSessionsCount}
          </p>
          <p className="font-sans text-[10px] text-gray-400 mt-1 font-mono">
            Simulated active sessions
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Genre Distribution */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/30 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
            <BarChart3 className="h-4.5 w-4.5 text-orange-500" />
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-white">
              Genre Concentration
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {Object.keys(analytics.genreDistribution).length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No genres registered yet.</p>
            ) : (
              Object.keys(analytics.genreDistribution).map((genre) => {
                const count = analytics.genreDistribution[genre];
                const pct = getStatPercent(count, analytics.totalMovies);
                return (
                  <div key={genre} className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between font-sans">
                      <span className="font-semibold text-gray-300">{genre}</span>
                      <span className="text-gray-500 font-mono">
                        {count} films ({pct}%)
                      </span>
                    </div>
                    {/* Visual bar container */}
                    <div className="w-full h-2 rounded bg-black overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full ${getGenreColor(genre)} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Content Discovery: Trending Search Logs */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/30 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-3">
              <TrendingUp className="h-4.5 w-4.5 text-orange-500" />
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-white">
                Content Discovery Metrics (Trending Searches)
              </h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-normal mb-4">
              Real-time searched keyword clouds calculated on backend server logs to study what titles and genres viewers are looking for:
            </p>

            <div className="flex flex-wrap gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 min-h-[140px] items-center justify-center">
              {analytics.topSearchQueries.length === 0 ? (
                <div className="text-center font-sans text-gray-600 text-xs py-4">
                  No search keywords logged yet. Try searching films!
                </div>
              ) : (
                analytics.topSearchQueries.map((query, idx) => {
                  // Proportional font sizing
                  const sizeClass = query.value > 3 ? "text-base font-bold text-orange-500" : query.value > 1 ? "text-sm font-semibold text-gray-200" : "text-xs text-gray-400";
                  return (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded bg-[#0a0a0a] border border-white/10 cursor-default transition-all hover:border-white/20 hover:scale-105 ${sizeClass}`}
                      title={`${query.value} searches logged`}
                    >
                      {query.text}
                      <span className="ml-1 text-[9px] font-mono text-gray-600">({query.value})</span>
                    </span>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/10 text-[10px] text-gray-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-500 shrink-0" />
            <span>Search tags help direct inventory and seed recommendations.</span>
          </div>
        </div>

      </div>

      {/* Watchlist Frequency & Saving Stats */}
      <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/30 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
          <Award className="h-4.5 w-4.5 text-orange-500" />
          <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-white">
            Most Bookmarked Films (Watchlist Popularity)
          </h3>
        </div>

        {analytics.movieSaves.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">No films have been watchlisted yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {analytics.movieSaves.map((save, idx) => {
              const movie = movies.find((m) => m.id === save.id);
              return (
                <div key={save.id} className="rounded-xl bg-black/40 p-3 border border-white/5 flex flex-col justify-between">
                  <div className="text-left">
                    <span className="font-mono text-[9px] font-extrabold text-orange-500 uppercase">
                      Rank #{idx + 1}
                    </span>
                    <h4 className="font-sans text-xs font-bold text-gray-200 line-clamp-1 mt-1 uppercase">
                      {save.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                      {movie ? movie.genre : "Film"}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[10px]">
                    <span className="text-gray-500">Saves:</span>
                    <span className="font-bold text-orange-500">{save.saves} list(s)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
