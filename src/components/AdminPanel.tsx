import React, { useState } from "react";
import { Movie, UserProfile, UserRole, PaymentTransaction, LicenseGrant, PlaybackSession, AuditLog } from "../types";
import { Plus, Check, ShieldCheck, X, Ban, Trash2, Edit, TrendingUp, DollarSign, ListFilter, Users, Terminal, RefreshCw, FileText } from "lucide-react";

interface AdminPanelProps {
  movies: Movie[];
  users: UserProfile[];
  payments: PaymentTransaction[];
  licenses: LicenseGrant[];
  playbackSessions: PlaybackSession[];
  auditLogs: AuditLog[];
  onAddMovie: (movie: Movie) => void;
  onModifyMovie: (movie: Movie) => void;
  onDeleteMovie: (id: string) => void;
  onUpdateUserRole: (userId: string, targetRole: UserRole) => void;
  onGrantLicense: (userId: string, movieId: string) => void;
  onRevokeLicense: (licenseId: string) => void;
  onClearAuditLogs: () => void;
}

export default function AdminPanel({
  movies,
  users,
  payments,
  licenses,
  playbackSessions,
  auditLogs,
  onAddMovie,
  onModifyMovie,
  onDeleteMovie,
  onUpdateUserRole,
  onGrantLicense,
  onRevokeLicense,
  onClearAuditLogs,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"movies" | "users" | "licenses" | "payments" | "forensics">("movies");

  // New Movie state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newMovieDirector, setNewMovieDirector] = useState("");
  const [newMovieSynopsis, setNewMovieSynopsis] = useState("");
  const [newMoviePrice, setNewMoviePrice] = useState(2500);
  const [newMovieGenre, setNewMovieGenre] = useState("Noir Thriller");
  const [newMovieDuration, setNewMovieDuration] = useState("1h 45m");
  const [newMoviePoster, setNewMoviePoster] = useState("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80");
  const [newMovieRating, setNewMovieRating] = useState("18+");
  
  // File upload states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // License form state
  const [selectedUserLicense, setSelectedUserLicense] = useState(users[0]?.id || "");
  const [selectedMovieLicense, setSelectedMovieLicense] = useState(movies[0]?.id || "");

  const handleMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovieTitle || !newMovieDirector) return;

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append("title", newMovieTitle);
      formData.append("director", newMovieDirector);
      formData.append("synopsis", newMovieSynopsis);
      formData.append("priceNGN", String(newMoviePrice));
      formData.append("genre", newMovieGenre);
      formData.append("duration", newMovieDuration);
      formData.append("rating", newMovieRating);

      if (videoFile) {
        formData.append("videoFile", videoFile);
      }
      if (posterFile) {
        formData.append("posterFile", posterFile);
      } else {
        formData.append("posterUrl", newMoviePoster);
      }

      setUploadProgress(40);

      const response = await fetch("/api/movies/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        throw new Error("Failed to upload movie.");
      }

      const createdMovie: Movie = await response.json();
      setUploadProgress(100);

      // Call prop callback
      onAddMovie(createdMovie);

      setTimeout(() => {
        setShowAddModal(false);
        setIsUploading(false);
        setUploadProgress(0);

        // Reset state
        setNewMovieTitle("");
        setNewMovieDirector("");
        setNewMovieSynopsis("");
        setNewMoviePrice(2500);
        setNewMovieGenre("Noir Thriller");
        setNewMovieDuration("1h 45m");
        setNewMoviePoster("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80");
        setNewMovieRating("18+");
        setVideoFile(null);
        setPosterFile(null);
      }, 600);

    } catch (err) {
      console.error("Upload failed:", err);
      alert("Movie registration and upload failed. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Math totals for Payments
  const totalReceivedNGN = payments.reduce((sum, item) => item.status === "success" ? sum + item.amountNGN : sum, 0);
  const totalCreatorPayoutNGN = payments.reduce((sum, item) => item.status === "success" ? sum + item.creatorShareNGN : sum, 0);
  const totalPlatformFeesNGN = payments.reduce((sum, item) => item.status === "success" ? sum + item.platformFeeNGN : sum, 0);

  return (
    <section className="bg-zinc-950/80 border border-white/5 backdrop-blur-md rounded-3xl p-6 md:p-10 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-display font-black tracking-wide text-white flex items-center gap-2 uppercase">
            <Terminal className="w-5 h-5 text-red-500" />
            CINNETemple Creator & Studio Backstage
          </h2>
          <p className="text-xs text-zinc-400">
            Realtime revenue audit ledger, RLS policy bypass simulators, & user roles dashboard.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-black/50 border border-white/5 rounded-xl">
          {[
            { id: "movies", label: "🎬 Content Manager" },
            { id: "users", label: "👥 Users CRM" },
            { id: "licenses", label: "🔑 Licenses (Gifts)" },
            { id: "payments", label: "💰 Revenue Ledger" },
            { id: "forensics", label: "🛡️ Forensics Audit" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all uppercase tracking-wider ${
                activeTab === tab.id
                  ? "bg-red-600 text-white shadow-md shadow-red-600/10"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* -------------------- 1. Tab: Movies Manager -------------------- */}
      {activeTab === "movies" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-zinc-200 uppercase tracking-wider">Catalogue Movies ({movies.length})</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600/10 border border-red-600/30 text-red-500 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-600/20 transition-all flex items-center gap-1 uppercase font-mono tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 text-red-500 stroke-[3]" /> Add New Title
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 font-mono">
              <thead className="border-b border-white/5 text-[11px] text-zinc-500 uppercase tracking-widest bg-black/20">
                <tr>
                  <th className="py-3 px-4">Poster / Title</th>
                  <th className="py-3 px-4">Director</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {movies.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-900/40 text-xs">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img src={m.posterUrl} className="w-10 h-10 object-cover rounded-lg border border-white/5" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-bold text-white uppercase tracking-tight">{m.title}</span>
                        <span className="block text-[10px] font-mono text-zinc-500 uppercase mt-0.5">{m.genre} • {m.duration}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">{m.director}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-red-500">₦{m.priceNGN.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onModifyMovie({ ...m, published: !m.published })}
                        className={`font-mono text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                          m.published
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : "bg-red-600/15 text-red-400 border-red-500/20"
                        }`}
                      >
                        {m.published ? "🟢 Published" : "📄 Draft"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex gap-1.5 justify-center">
                        <button
                          onClick={() => onDeleteMovie(m.id)}
                          className="p-1 px-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 rounded font-mono text-[10px] uppercase tracking-wider"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add popup */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl w-full max-w-md">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                  <h4 className="font-display font-medium text-white text-base">Register Nollywood Title</h4>
                  <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleMovieSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Movie Title</label>
                    <input
                      type="text"
                      required
                      value={newMovieTitle}
                      onChange={(e) => setNewMovieTitle(e.target.value)}
                      placeholder="e.g. Lagos Storm"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Director Name</label>
                      <input
                        type="text"
                        required
                        value={newMovieDirector}
                        onChange={(e) => setNewMovieDirector(e.target.value)}
                        placeholder="e.g. Kunle Afolayan"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Genre</label>
                      <select
                        value={newMovieGenre}
                        onChange={(e) => setNewMovieGenre(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                      >
                        <option value="Noir Thriller">Noir Thriller</option>
                        <option value="Romantic Drama">Romantic Drama</option>
                        <option value="Historical Epic">Historical Epic</option>
                        <option value="Comedy Drama">Comedy Drama</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Action Thriller">Action Thriller</option>
                        <option value="Documentary">Documentary</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Price (₦)</label>
                      <input
                        type="number"
                        value={newMoviePrice}
                        onChange={(e) => setNewMoviePrice(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Duration</label>
                      <input
                        type="text"
                        value={newMovieDuration}
                        onChange={(e) => setNewMovieDuration(e.target.value)}
                        placeholder="e.g. 1h 55m"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Rating</label>
                      <select
                        value={newMovieRating}
                        onChange={(e) => setNewMovieRating(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      >
                        <option value="G">G</option>
                        <option value="PG">PG</option>
                        <option value="PG-13">PG-13</option>
                        <option value="13+">13+</option>
                        <option value="16+">16+</option>
                        <option value="18+">18+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Full Feature Video File (.mp4, .mkv, .mov)</label>
                    <input
                      type="file"
                      required
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setVideoFile(e.target.files[0]);
                        }
                      }}
                      className="w-full bg-zinc-900 border border-dashed border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Poster Image file (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPosterFile(e.target.files[0]);
                        }
                      }}
                      className="w-full bg-zinc-900 border border-dashed border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50 mb-2"
                    />
                    {!posterFile && (
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-500 uppercase">Or fallback Image URL</label>
                        <input
                          type="text"
                          value={newMoviePoster}
                          onChange={(e) => setNewMoviePoster(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Synopsis</label>
                    <textarea
                      value={newMovieSynopsis}
                      onChange={(e) => setNewMovieSynopsis(e.target.value)}
                      placeholder="Short movie summary..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white h-16 focus:outline-none focus:border-red-500/50 resize-none"
                    />
                  </div>

                  {isUploading && (
                    <div className="space-y-1.5 p-3.5 bg-zinc-900 rounded-xl border border-white/5 animate-pulse">
                      <div className="flex justify-between items-center text-[10px] font-mono text-red-500 uppercase">
                        <span>Streaming files to server...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${uploadProgress}%` }}
                          className="h-full bg-red-600 transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    {isUploading ? "Uploading Movie..." : "Register & Upload Movie"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- 2. Tab: Users Manager -------------------- */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-medium text-sm text-zinc-200 uppercase tracking-wider">Registered Users ({users.length})</h3>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Simulates RLS Policies in Action</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 font-mono">
              <thead className="border-b border-white/5 text-zinc-500 bg-black/10">
                <tr>
                  <th className="py-3 px-4">Contact Profile</th>
                  <th className="py-3 px-4">Role Permission</th>
                  <th className="py-3 px-4">Joined At</th>
                  <th className="py-3 px-4 text-center">Re-Assign permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-zinc-900/40">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-white uppercase tracking-tight">{usr.name}</span>
                        <span className="block text-[10px] font-mono text-zinc-500 mt-0.5">{usr.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        usr.role === "admin"
                          ? "bg-red-600/10 text-red-500 border border-red-600/20"
                          : usr.role === "tester"
                          ? "bg-zinc-800 text-white border border-white/10"
                          : "bg-zinc-950 text-zinc-400 border border-white/5"
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500 text-[10px]">
                      {new Date(usr.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-1.5 justify-center font-mono">
                        <select
                          value={usr.role}
                          onChange={(e) => onUpdateUserRole(usr.id, e.target.value as UserRole)}
                          className="bg-black text-xs text-red-500 border border-white/5 px-2 py-1 rounded focus:outline-none"
                        >
                          <option value="viewer">Viewer Privilege</option>
                          <option value="tester">Early Tester Perk</option>
                          <option value="admin">Admin / System Host</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- 3. Tab: Licenses -------------------- */}
      {activeTab === "licenses" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Create form */}
            <div className="bg-black/50 border border-gray-800/60 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="font-display font-medium text-zinc-200 text-sm">Issue Press Pass (License)</h4>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Grants free access pass to specific users (journalists, press, selectors) bypass bank ledger checks.
                </p>

                <div className="space-y-3 mt-4">
                  <div>
                    <label className="block text-[10.5px] font-mono text-zinc-400 uppercase mb-1">Select Audience Profile</label>
                    <select
                      value={selectedUserLicense}
                      onChange={(e) => setSelectedUserLicense(e.target.value)}
                      className="w-full text-xs text-gray-300 bg-zinc-900 border border-zinc-800 rounded-lg p-2 focus:outline-none"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono text-zinc-400 uppercase mb-1">Select Film Access</label>
                    <select
                      value={selectedMovieLicense}
                      onChange={(e) => setSelectedMovieLicense(e.target.value)}
                      className="w-full text-xs text-gray-300 bg-zinc-900 border border-zinc-800 rounded-lg p-2 focus:outline-none"
                    >
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onGrantLicense(selectedUserLicense, selectedMovieLicense)}
                className="mt-6 w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all uppercase tracking-wider"
              >
                Issue Gated Press Pass
              </button>
            </div>

            {/* License list */}
            <div className="bg-black/20 md:col-span-2 border border-white/5 p-4 rounded-2xl">
              <h4 className="font-display font-bold text-zinc-200 text-sm mb-3 uppercase tracking-wide">Live Active Gated Licenses ({licenses.length})</h4>
              
              <div className="overflow-y-auto max-h-64 space-y-2">
                {licenses.map((lic) => (
                  <div key={lic.id} className="bg-zinc-950/50 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
                    <div>
                      <span className="font-bold text-zinc-200">{lic.userEmail}</span>
                      <span className="text-zinc-500 mx-1">granted entry to</span>
                      <strong className="text-red-500 font-sans font-bold uppercase">{lic.movieTitle}</strong>
                      <span className="block text-[10px] text-zinc-600 uppercase mt-0.5">By {lic.grantedBy} • {new Date(lic.grantedAt).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={() => onRevokeLicense(lic.id)}
                      className="p-1 px-2 text-[10px] bg-red-950/40 text-red-400 border border-red-900/40 rounded uppercase hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
                {licenses.length === 0 && (
                  <p className="text-center py-8 text-zinc-600">No active press pass licenses issued at this moment.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 4. Tab: Revenue Dashboard -------------------- */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          {/* Revenue highlighters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-950/60 border border-white/5 p-5 rounded-2xl">
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Gross Ticket Ledger</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="font-display font-black text-white text-2xl">₦{totalReceivedNGN.toLocaleString()}</span>
              </div>
              <span className="block text-[9px] text-zinc-600 mt-1 uppercase font-mono">Paystack Secure Settle</span>
            </div>

            <div className="bg-[#3ECF8E]/5 border border-[#3ECF8E]/20 p-5 rounded-2xl">
              <p className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Filmmaker Yield (90% Share)</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="font-display font-black text-[#3ECF8E] text-2xl">₦{totalCreatorPayoutNGN.toLocaleString()}</span>
              </div>
              <span className="block text-[9px] text-emerald-600 mt-1 uppercase font-mono">Distributed 48h Window</span>
            </div>

            <div className="bg-zinc-950/60 border border-white/5 p-5 rounded-2xl">
              <p className="text-[10px] font-mono text-zinc-500 uppercase">CINNETemple Platform Fee (10%)</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="font-display font-black text-red-500 text-2xl">₦{totalPlatformFeesNGN.toLocaleString()}</span>
              </div>
              <span className="block text-[9px] text-zinc-600 mt-1 uppercase font-mono font-bold">Hosts server bandwidth CDN</span>
            </div>
          </div>

          {/* Transactions lists */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs text-zinc-200 uppercase tracking-wider">Historical Checkout Logs</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-500 font-mono">
                <thead className="border-b border-white/5 text-[10px] uppercase">
                  <tr>
                    <th className="py-2">Reference</th>
                    <th className="py-2">Audience Account</th>
                    <th className="py-2">Movie Title</th>
                    <th className="py-2 text-right">Gross Amount</th>
                    <th className="py-2 text-right">Filmmaker Profit</th>
                    <th className="py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-400">
                  {payments.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-900/40">
                      <td className="py-2.5 font-bold text-zinc-200">{tx.reference}</td>
                      <td className="py-2.5 text-zinc-400 font-sans">{tx.userEmail}</td>
                      <td className="py-2.5 text-zinc-300 font-sans">{tx.movieTitle}</td>
                      <td className="py-2.5 text-right text-zinc-300">₦{tx.amountNGN.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-[#3ECF8E]">₦{tx.creatorShareNGN.toLocaleString()}</td>
                      <td className="py-2.5 text-center">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          tx.status === "success"
                            ? "bg-emerald-500/10 text-[#3ECF8E]"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 5. Tab: Forensic Auditing & Sessions -------------------- */}
      {activeTab === "forensics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 leading-relaxed font-sans">
          
          {/* Active play sessions simulator */}
          <div className="bg-black/40 border border-gray-800/60 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-900">
                <h4 className="font-display font-bold text-sm text-zinc-300">Live Active Playback Sessions ({playbackSessions.length})</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-72 font-mono text-[11px]">
                {playbackSessions.map((sess) => (
                  <div key={sess.id} className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-xl">
                    <div className="flex justify-between text-zinc-400">
                      <span>Viewer: <strong>{sess.userEmail}</strong></span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                        sess.status === "live" ? "bg-emerald-500/10 text-[#3ECF8E] animate-pulse" : "bg-neutral-800 text-zinc-400"
                      }`}>{sess.status}</span>
                    </div>
                    <p className="mt-1.5 font-sans font-bold text-white text-xs">Watching: {sess.movieTitle}</p>
                    <div className="flex gap-4 text-[10px] text-zinc-600 mt-2">
                      <span>Device: {sess.device}</span>
                      <span>IP: {sess.ipAddress}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Trail System */}
          <div className="bg-black/40 border border-gray-800/60 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-900">
                <h4 className="font-display font-bold text-sm text-zinc-300">Forensics Security Audit Trail</h4>
                <button
                  onClick={onClearAuditLogs}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono"
                >
                  Clear logs
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-72 font-mono text-[10px]">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`border p-2 rounded-lg ${
                      log.severity === "warning"
                        ? "bg-yellow-950/20 border-yellow-500/20 text-yellow-300"
                        : log.severity === "critical"
                        ? "bg-red-950/20 border-red-500/20 text-red-300"
                        : "bg-zinc-950/40 border-zinc-900 text-zinc-400"
                    }`}
                  >
                    <div className="flex justify-between font-black text-[9px] opacity-70 mb-1">
                      <span>{new Date(log.timestamp).toLocaleTimeString()} • IP: {log.ipAddress}</span>
                      <span className="uppercase">{log.action}</span>
                    </div>
                    <p className="text-zinc-300">{log.details}</p>
                    <span className="block mt-0.5 opacity-60">Actor: {log.userEmail} ({log.role})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </section>
  );
}
