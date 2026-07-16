import React, { useState } from "react";
import { Share2, Plus, MessageSquare, Send, Users, Play, Square, Check, Info, ArrowRight, UserPlus } from "lucide-react";
import { Movie, SharedList, UserProfile } from "../types";

interface SocialHubProps {
  sharedLists: SharedList[];
  movies: Movie[];
  activeProfile: UserProfile;
  onCreateShare: (title: string, description: string, movieIds: string[], isCollaborative: boolean) => Promise<void>;
  onJoinLeaveSession: (shareId: string, action: "join" | "leave") => Promise<void>;
  onAddComment: (shareId: string, commentText: string) => Promise<void>;
  onViewMovieDetails: (movieId: string) => void;
}

export default function SocialHub({
  sharedLists,
  movies,
  activeProfile,
  onCreateShare,
  onJoinLeaveSession,
  onAddComment,
  onViewMovieDetails
}: SocialHubProps) {
  // Sharing form state
  const [showShareForm, setShowShareForm] = useState<boolean>(false);
  const [listTitle, setListTitle] = useState<string>("");
  const [listDesc, setListDesc] = useState<string>("");
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [isCollaborative, setIsCollaborative] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Active viewing/commenting states
  const [commentInputs, setCommentInputs] = useState<{ [shareId: string]: string }>({});
  const [focusedShareId, setFocusedShareId] = useState<string | null>(sharedLists[0]?.id || null);

  const activeShare = sharedLists.find((s) => s.id === focusedShareId) || sharedLists[0];

  const handleMovieToggle = (movieId: string) => {
    if (selectedMovieIds.includes(movieId)) {
      setSelectedMovieIds(selectedMovieIds.filter((id) => id !== movieId));
    } else {
      setSelectedMovieIds([...selectedMovieIds, movieId]);
    }
  };

  const handleCreateShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listTitle.trim() || selectedMovieIds.length === 0) return;

    setIsCreating(true);
    try {
      await onCreateShare(listTitle, listDesc, selectedMovieIds, isCollaborative);
      setListTitle("");
      setListDesc("");
      setSelectedMovieIds([]);
      setIsCollaborative(true);
      setShowShareForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCommentSubmit = async (shareId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[shareId] || "";
    if (!text.trim()) return;

    try {
      await onAddComment(shareId, text);
      setCommentInputs({ ...commentInputs, [shareId]: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCoWatchSession = async (share: SharedList) => {
    const isAlreadyWatching = share.activeViewers.includes(activeProfile.username);
    const action = isAlreadyWatching ? "leave" : "join";
    try {
      await onJoinLeaveSession(share.id, action);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: Shared lists explorer / Shared list creation form */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-orange-500" />
            <h2 className="font-sans text-base font-bold text-white uppercase tracking-wider">Shared watchlists</h2>
          </div>
          
          <button
            onClick={() => setShowShareForm(!showShareForm)}
            className="flex items-center gap-1 rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-500 shadow-md shadow-orange-600/20"
          >
            <Plus className="h-3 w-3" />
            <span>{showShareForm ? "Browse" : "Share List"}</span>
          </button>
        </div>

        {showShareForm ? (
          /* Create Share Form */
          <form
            onSubmit={handleCreateShareSubmit}
            className="rounded-2xl border border-white/10 bg-[#0a0a0a]/50 p-4 flex flex-col gap-4"
          >
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-orange-500">
              Configure Shared List
            </h3>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 mb-1">
                List Title
              </label>
              <input
                type="text"
                required
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                placeholder="Nolan Weekend, Late Night Cozy, etc."
                className="w-full rounded-xl border border-white/10 bg-[#050505] px-3 py-1.5 text-xs text-gray-100 placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 mb-1">
                List Description
              </label>
              <textarea
                rows={2}
                value={listDesc}
                onChange={(e) => setListDesc(e.target.value)}
                placeholder="Describe the occasion, preferred vibes..."
                className="w-full rounded-xl border border-white/10 bg-[#050505] px-3 py-1.5 text-xs text-gray-100 placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
              />
            </div>

            {/* Collaborative Session check */}
            <label className="flex items-center gap-2 rounded-lg bg-[#050505] p-2 cursor-pointer border border-white/10">
              <input
                type="checkbox"
                checked={isCollaborative}
                onChange={(e) => setIsCollaborative(e.target.checked)}
                className="rounded border-white/10 bg-black text-orange-500 focus:ring-orange-500/50"
              />
              <div className="text-left">
                <span className="block text-xs font-bold text-gray-300">
                  Collaborative Watch Party
                </span>
                <span className="block text-[9px] text-gray-500">
                  Allow friends to co-watch in real-time.
                </span>
              </div>
            </label>

            {/* Movie Multi-select list */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 mb-1.5">
                Select Movies (min 1)
              </label>
              <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto border border-white/10 bg-black/40 rounded-xl p-2.5">
                {movies.map((m) => {
                  const isChecked = selectedMovieIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleMovieToggle(m.id)}
                      className={`flex items-center justify-between rounded-lg p-1.5 text-left text-xs transition-all ${
                        isChecked
                          ? "bg-orange-600/10 border border-orange-600/20 text-white"
                          : "border border-transparent text-gray-400 hover:bg-black/5"
                      }`}
                    >
                      <span className="font-semibold">{m.title}</span>
                      <span className="font-mono text-[9px] text-gray-500">{m.genre}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-[9px] text-gray-500">
                Selected: {selectedMovieIds.length} movie(s)
              </p>
            </div>

            <button
              type="submit"
              disabled={isCreating || selectedMovieIds.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-500 active:scale-95 disabled:opacity-40 shadow-md shadow-orange-600/20"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{isCreating ? "Publishing list..." : "Publish to Social Hub"}</span>
            </button>
          </form>
        ) : (
          /* Shared Lists List View */
          <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto">
            {sharedLists.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center bg-black/10">
                <p className="text-xs text-gray-500">No shared watchlists available yet.</p>
              </div>
            ) : (
              sharedLists.map((share) => {
                const isSelected = focusedShareId === share.id || (focusedShareId === null && activeShare?.id === share.id);
                return (
                  <button
                    key={share.id}
                    onClick={() => setFocusedShareId(share.id)}
                    className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-orange-600/50 bg-orange-600/5"
                        : "border-white/10 bg-[#0a0a0a]/30 hover:bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <h4 className="font-sans text-xs font-bold text-white line-clamp-1 uppercase">
                        {share.title}
                      </h4>
                      {share.isCollaborative && (
                        <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[8px] font-bold text-rose-400 tracking-wider">
                          LIVE WATCH
                        </span>
                      )}
                    </div>
                    
                    <p className="font-sans text-[11px] text-gray-400 line-clamp-2 leading-normal mb-2.5">
                      {share.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2 font-mono text-[9px] text-gray-500">
                      <span>By: {share.ownerName}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-2.5 w-2.5" />
                        <span>{share.activeViewers.length} active</span>
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Right Column: Active Shared List Details, Live Co-watching simulator room, Comments */}
      <div className="lg:col-span-8">
        {!activeShare ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center bg-black/10 flex flex-col items-center justify-center h-full min-h-[300px]">
            <Share2 className="h-10 w-10 text-gray-800 mb-2" />
            <p className="text-sm font-sans text-gray-400">
              Select or publish a shared watchlist on the left to join collaborative viewing parties!
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/30 p-5 backdrop-blur-sm flex flex-col gap-5">
            
            {/* List Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-sans text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                    {activeShare.title}
                  </h3>
                  {activeShare.isCollaborative && (
                    <span className="animate-pulse rounded bg-rose-600 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-sans leading-relaxed">
                  {activeShare.description || "Shared with community."}
                </p>
                <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest">
                  Owner: <span className="text-orange-500 font-bold">{activeShare.ownerName}</span>
                </p>
              </div>

              {/* Live Co-Watching Control Toggle */}
              {activeShare.isCollaborative && (
                <button
                  onClick={() => toggleCoWatchSession(activeShare)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                    activeShare.activeViewers.includes(activeProfile.username)
                      ? "bg-rose-500/10 border border-rose-500 text-rose-500 hover:bg-rose-500/20"
                      : "bg-orange-600 text-white hover:bg-orange-500 shadow-md shadow-orange-600/20"
                  }`}
                >
                  {activeShare.activeViewers.includes(activeProfile.username) ? (
                    <>
                      <Square className="h-3 w-3 fill-rose-500" />
                      <span>Leave Watch Party</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-white" />
                      <span>Join Live Watch Party</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* List Content Area: Split into movies in list and live session metrics / comment logs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Movies in Shared List */}
              <div className="md:col-span-6 flex flex-col gap-3">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                  Movies in this List ({activeShare.movieIds.length})
                </h4>
                
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                  {activeShare.movieIds.map((mId) => {
                    const movie = movies.find((m) => m.id === mId);
                    if (!movie) return null;
                    return (
                      <div
                        key={mId}
                        className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#050505]/40 p-2 hover:border-white/20 hover:bg-[#050505]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={movie.imageUrl}
                            alt={movie.title}
                            referrerPolicy="no-referrer"
                            className="h-9 w-14 object-cover rounded bg-slate-900"
                          />
                          <div className="text-left min-w-0">
                            <h5 className="font-sans text-xs font-bold text-gray-200 truncate group-hover:text-orange-500 transition-colors uppercase">
                              {movie.title}
                            </h5>
                            <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                              {movie.genre} · {movie.year}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => onViewMovieDetails(movie.id)}
                          className="rounded bg-black/60 p-1.5 text-gray-400 hover:text-white hover:bg-[#050505] transition-all shrink-0"
                          title="View film details"
                        >
                          <ArrowRight className="h-3.5 w-3.5 text-orange-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live viewers & Collaborative Session Chat Comments log */}
              <div className="md:col-span-6 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-4">
                
                {/* Active Viewers Shelf */}
                {activeShare.isCollaborative && (
                  <div className="rounded-xl bg-black/60 p-3 border border-white/10">
                    <div className="flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      <Users className="h-3.5 w-3.5 text-orange-500" />
                      <span>Co-watching Live now ({activeShare.activeViewers.length})</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {activeShare.activeViewers.length === 0 ? (
                        <span className="text-[10px] text-gray-500">No active sessions.</span>
                      ) : (
                        activeShare.activeViewers.map((viewer, index) => (
                          <span
                            key={index}
                            className={`rounded-full px-2 py-0.5 font-sans text-[9px] font-bold tracking-wide border ${
                              viewer === activeProfile.username
                                ? "bg-orange-600/10 text-orange-500 border-orange-600/25"
                                : "bg-[#0a0a0a] text-gray-400 border-white/10"
                            }`}
                          >
                            ● {viewer}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Session discussion comments */}
                <div className="flex flex-col gap-2.5">
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                    Party Discussion ({activeShare.comments.length})
                  </h4>

                  {/* Comment list block */}
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {activeShare.comments.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 p-4 text-center">
                        <p className="text-[10px] text-gray-500">No comments posted yet.</p>
                      </div>
                    ) : (
                      activeShare.comments.map((comment, idx) => (
                        <div key={idx} className="rounded-lg bg-[#050505]/50 p-2 border border-white/5">
                          <div className="flex items-center justify-between gap-2 font-mono text-[9px]">
                            <span className="font-sans font-bold text-gray-300">
                              {comment.username}
                            </span>
                            <span className="text-gray-500">
                              {new Date(comment.timestamp).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                          <p className="mt-1 font-sans text-xs text-gray-400 leading-normal">
                            {comment.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment form */}
                  <form
                    onSubmit={(e) => handleCommentSubmit(activeShare.id, e)}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={commentInputs[activeShare.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [activeShare.id]: e.target.value })
                      }
                      placeholder="Discuss movie timings, ratings..."
                      className="flex-1 rounded-xl border border-white/10 bg-[#050505] px-3 py-1.5 text-xs text-gray-100 placeholder-gray-600 focus:border-orange-500/50 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-orange-600 p-1.5 text-white hover:bg-orange-500 transition-all active:scale-90 shrink-0 shadow-md shadow-orange-600/20"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
