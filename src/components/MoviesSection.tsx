import { useState } from "react";
import { Movie, UserRole } from "../types";
import { Search, Film, Calendar, Clock, Play, Tag, CheckCircle, Unlock, Info } from "lucide-react";

interface MoviesSectionProps {
  movies: Movie[];
  userRole: UserRole;
  userTickets: string[]; // movie IDs with active tickets
  userLicenses: string[]; // movie IDs with active granted licenses
  onBuyTicket: (movie: Movie) => void;
  onWatchMovie: (movie: Movie) => void;
  onTriggerTrailer: (movie: Movie) => void;
}

export default function MoviesSection({
  movies,
  userRole,
  userTickets,
  userLicenses,
  onBuyTicket,
  onWatchMovie,
  onTriggerTrailer,
}: MoviesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const genres = ["All", ...Array.from(new Set(movies.map((m) => m.genre)))];

  const filteredMovies = movies.filter((movie) => {
    // Audit log check: shadows of dunes is a draft. Only admin/tester can see draft movies!
    if (!movie.published && userRole !== "admin" && userRole !== "tester") {
      return false;
    }
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.synopsis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || movie.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-2 uppercase">
            <Film className="w-5 h-5 text-red-500" />
            CINNETemple Cinema Lobby
          </h2>
          <p className="text-sm text-zinc-400">
            Premium Nigerian & African stories. Pay once, stream once. No monthly traps.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search movies, directors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-600 placeholder-zinc-600"
            />
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-zinc-950 border border-white/5 text-sm text-zinc-300 rounded-lg px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-1 focus:ring-red-600"
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950 border border-white/5 rounded-2xl">
          <p className="text-zinc-500 font-mono text-sm leading-normal">No movies found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map((movie) => {
            const hasTicket = userTickets.includes(movie.id);
            const hasLicense = userLicenses.includes(movie.id);
            // Early access program: early testers and admins get free access to Badagry Romance / short indies
            const isTesterPerk =
              (userRole === "admin" || userRole === "tester") && movie.priceNGN <= 1800;
            const canWatch = hasTicket || hasLicense || isTesterPerk;

            return (
              <div
                key={movie.id}
                className="group relative flex flex-col bg-zinc-950/60 border border-white/5 rounded-2xl overflow-hidden hover:border-red-600/40 transition-all duration-300 shadow-xl"
              >
                {/* Poster area */}
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="bg-red-600/10 border border-red-600/30 text-red-500 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                      {movie.genre}
                    </span>
                    {!movie.published && (
                      <span className="bg-red-600/20 text-red-500 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-red-600/30">
                        📄 DRAFT / STUDIO
                      </span>
                    )}
                    {isTesterPerk && (
                      <span className="bg-zinc-800 text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                        🧪 Tester Perk Pass
                      </span>
                    )}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/80 backdrop-blur-md text-zinc-300 font-mono text-xs font-semibold px-2.5 py-1 rounded border border-white/10">
                      {movie.rating}
                    </span>
                  </div>

                  {/* Quick Play Trigger (overlay) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <button
                      onClick={() => onTriggerTrailer(movie)}
                      className="bg-red-600 text-white p-3.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                      title="Watch Teaser/Promo"
                    >
                      <Play className="w-6 h-6 fill-current text-white ml-0.5" />
                    </button>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-black text-lg text-white group-hover:text-red-500 transition-colors uppercase">
                        {movie.title}
                      </h3>
                      <span className="text-red-500 font-display font-bold text-base">
                        ₦{movie.priceNGN.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 mt-1 font-mono">
                      Director: <span className="text-zinc-300 font-sans">{movie.director}</span>
                    </p>

                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {movie.synopsis}
                    </p>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {movie.releaseYear}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {movie.duration}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Section */}
                  <div className="mt-5 space-y-2">
                    {canWatch ? (
                      <button
                        onClick={() => onWatchMovie(movie)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                      >
                        <Unlock className="w-4 h-4" />
                        Enter Cinema Hall (Play Film)
                      </button>
                    ) : (
                      <button
                        onClick={() => onBuyTicket(movie)}
                        className="w-full bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.01] flex items-center justify-center gap-2 shadow-lg shadow-red-600/10"
                      >
                        <Tag className="w-4 h-4 text-white" />
                        Buy Single Ticket (₦{movie.priceNGN.toLocaleString()})
                      </button>
                    )}

                    <button
                      onClick={() => onTriggerTrailer(movie)}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-white/5"
                    >
                      Watch Free Teaser
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

