import { useState, useEffect } from "react";
import { Movie, UserProfile, UserRole, Ticket, PaymentTransaction, LicenseGrant, PlaybackSession, AuditLog } from "./types";
import {
  INITIAL_MOVIES,
  INITIAL_USER,
  INITIAL_TICKETS,
  INITIAL_PAYMENTS,
  INITIAL_LICENSES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SESSIONS,
  MOCK_USERS,
} from "./data";
import Navbar from "./components/Navbar";
import MoviesSection from "./components/MoviesSection";
import CheckoutModal from "./components/CheckoutModal";
import CinematicPlayer from "./components/CinematicPlayer";
import AdminPanel from "./components/AdminPanel";
import UGCPromoLab from "./components/UGCPromoLab";
import { Sparkles, Info, CheckCircle } from "lucide-react";

export default function App() {
  // Current logged in user state
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);

  // States mirroring structured dbs
  const [moviesList, setMoviesList] = useState<Movie[]>(INITIAL_MOVIES);
  const [ticketsList, setTicketsList] = useState<Ticket[]>(INITIAL_TICKETS);
  const [paymentsList, setPaymentsList] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [licensesList, setLicensesList] = useState<LicenseGrant[]>(INITIAL_LICENSES);
  const [sessionsList, setSessionsList] = useState<PlaybackSession[]>(INITIAL_SESSIONS);
  const [auditLogsList, setAuditLogsList] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Load movies from backend on mount
  useEffect(() => {
    fetch("/api/movies")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load backend movies");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMoviesList(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load movies from backend, falling back to static data:", err);
      });
  }, []);

  // Interface view states
  const [selectedMovieForCheckout, setSelectedMovieForCheckout] = useState<Movie | null>(null);
  const [activeWatchMovie, setActiveWatchMovie] = useState<Movie | null>(null);
  const [isTeaserOnly, setIsTeaserOnly] = useState(false);

  // Add system-level audit logs utility
  const recordAuditLog = (action: string, details: string, severity: "info" | "warning" | "critical" = "info") => {
    const newLog: AuditLog = {
      id: "log-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userEmail: currentUser.email,
      role: currentUser.role,
      action: action,
      details: details,
      ipAddress: "197.210.35.4", // local Lagos IP simulator
      severity: severity,
    };
    setAuditLogsList((prev) => [newLog, ...prev]);
  };

  // Sync role select change
  const handleRoleChange = (role: UserRole) => {
    // Audit the permission elevation or lowering
    recordAuditLog("ROLE_CHANGE", `Switched user session permission state to: ${role.toUpperCase()}`);
    setCurrentUser((prev) => ({
      ...prev,
      role: role,
    }));
  };

  // 1. Movie Catalogue Crud Handlers
  const handleAddMovie = (newMovie: Movie) => {
    setMoviesList((prev) => {
      if (prev.some((m) => m.id === newMovie.id)) {
        return prev;
      }
      return [...prev, newMovie];
    });
    recordAuditLog("MOVIE_CREATE", `Registered & drafted new Nollywood title: '${newMovie.title}' on standard catalog list`);
  };

  const handleModifyMovie = (modified: Movie) => {
    fetch(`/api/movies/${modified.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modified),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update movie");
        return res.json();
      })
      .then((data) => {
        setMoviesList((prev) => prev.map((m) => (m.id === data.id ? data : m)));
        recordAuditLog("MOVIE_UPDATE", `Updated details for: '${data.title}' (Published: ${data.published})`);
      })
      .catch((err) => {
        console.error("Error updating movie:", err);
        // Optimistic fallback update in local UI state
        setMoviesList((prev) => prev.map((m) => (m.id === modified.id ? modified : m)));
      });
  };

  const handleDeleteMovie = (id: string) => {
    fetch(`/api/movies/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete movie");
        const deleted = moviesList.find((m) => m.id === id);
        setMoviesList((prev) => prev.filter((m) => m.id !== id));
        if (deleted) {
          recordAuditLog("MOVIE_DELETE", `Removed movie title: '${deleted.title}' from system listings`, "warning");
        }
      })
      .catch((err) => {
        console.error("Error deleting movie:", err);
        // Optimistic fallback deletion in local UI state
        const deleted = moviesList.find((m) => m.id === id);
        setMoviesList((prev) => prev.filter((m) => m.id !== id));
        if (deleted) {
          recordAuditLog("MOVIE_DELETE", `Removed movie title: '${deleted.title}' from system listings (UI-only fallback)`, "warning");
        }
      });
  };

  // 2. Role CRM update handler
  const handleUpdateUsersRoleCRM = (userId: string, targetRole: UserRole) => {
    recordAuditLog("CRM_ROLE_CHANGE", `Updated CRM database user role to: ${targetRole.toUpperCase()}`);
  };

  // 3. License Manager Handlers
  const handleGrantLicense = (userId: string, movieId: string) => {
    const targetUser = MOCK_USERS.find((u) => u.id === userId) || currentUser;
    const targetMovie = moviesList.find((m) => m.id === movieId);

    if (!targetMovie) return;

    const newLicense: LicenseGrant = {
      id: "lic-" + Math.random().toString(36).substring(2, 6),
      userId: targetUser.id,
      userEmail: targetUser.email,
      userRole: targetUser.role,
      movieId: movieId,
      movieTitle: targetMovie.title,
      grantedBy: "System Host (Session Override)",
      grantedAt: new Date().toISOString(),
      status: "active",
    };

    setLicensesList((prev) => [newLicense, ...prev]);
    recordAuditLog("LICENSE_GRANT", `Granted free access token pass for movie '${targetMovie.title}' to: ${targetUser.email}`);
  };

  const handleRevokeLicense = (licenseId: string) => {
    const revoked = licensesList.find((l) => l.id === licenseId);
    setLicensesList((prev) => prev.filter((l) => l.id !== licenseId));
    if (revoked) {
      recordAuditLog("LICENSE_REVOKE", `Revoked access pass token for movie '${revoked.movieTitle}' from user: ${revoked.userEmail}`, "warning");
    }
  };

  // 4. Buy Ticket Trigger
  const handleRequestCheckout = (movie: Movie) => {
    setSelectedMovieForCheckout(movie);
  };

  // Callback on successful payment in Paystack Inline popup
  const handlePaymentSuccess = (paymentReference: string) => {
    if (!selectedMovieForCheckout) return;

    // Issue ticket
    const newTicket: Ticket = {
      id: "t-" + Math.random().toString(36).substring(2, 6),
      movieId: selectedMovieForCheckout.id,
      userId: currentUser.id,
      purchaseDate: new Date().toISOString(),
      pricePaidNGN: selectedMovieForCheckout.priceNGN,
      status: "active",
      viewCount: 0,
    };

    // Calculate payouts (90% to filmmaker, 10% to platform)
    const amount = selectedMovieForCheckout.priceNGN;
    const creatorShare = Math.floor(amount * 0.9);
    const platformFee = amount - creatorShare;

    const newPayment: PaymentTransaction = {
      id: "tx-" + Math.random().toString(36).substring(2, 6),
      userId: currentUser.id,
      userEmail: currentUser.email,
      movieId: selectedMovieForCheckout.id,
      movieTitle: selectedMovieForCheckout.title,
      amountNGN: amount,
      creatorShareNGN: creatorShare,
      platformFeeNGN: platformFee,
      status: "success",
      reference: paymentReference,
      timestamp: new Date().toISOString(),
    };

    setTicketsList((prev) => [newTicket, ...prev]);
    setPaymentsList((prev) => [newPayment, ...prev]);

    recordAuditLog("TICKET_PURCHASE", `Successfully settled NGN payment Reference '${paymentReference}' via Paystack. Issued single-view ticket access.`);

    setTimeout(() => {
      setSelectedMovieForCheckout(null); // Close checkout
    }, 1500);
  };

  // Play film watcher Trigger
  const handleWatchMovie = (movie: Movie) => {
    setIsTeaserOnly(false);
    setActiveWatchMovie(movie);

    // Boot interactive live session simulator
    const newSession: PlaybackSession = {
      id: "sess-" + Math.random().toString(36).substring(2, 6),
      userId: currentUser.id,
      userEmail: currentUser.email,
      movieTitle: movie.title,
      ipAddress: "197.210.35.4",
      device: "Desktop Chrome Browser",
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      status: "live",
    };

    setSessionsList((prev) => [newSession, ...prev]);
    recordAuditLog("MEDIA_PLAYBACK_START", `Initiated high-definition master screen session for film: '${movie.title}'`);
  };

  // Play teaser Trigger
  const handleWatchTeaser = (movie: Movie) => {
    setIsTeaserOnly(true);
    setActiveWatchMovie(movie);
    recordAuditLog("TEASER_PLAYBACK_START", `Initiated free teaser promo stream for film: '${movie.title}'`);
  };

  // Consume ticket upon first click of actual film play
  const handleConsumeTicketOnPlay = () => {
    if (!activeWatchMovie || isTeaserOnly) return;

    // Set any active ticket for this movie to 'used' or increase viewCount
    setTicketsList((prev) =>
      prev.map((t) =>
        t.movieId === activeWatchMovie.id && t.userId === currentUser.id
          ? { ...t, status: "used", viewCount: t.viewCount + 1 }
          : t
      )
    );

    recordAuditLog(
      "TICKET_CONSUMPTION",
      `Ticket used & consumed for single-view entry. Access code locked.`,
      "info"
    );
  };

  // Close player handler
  const handleClosePlayer = () => {
    if (activeWatchMovie) {
      recordAuditLog("MEDIA_PLAYBACK_CLOSE", `Closed playback viewport session for film: '${activeWatchMovie.title}'`);
    }
    setActiveWatchMovie(null);
  };

  const handleClearAuditLogs = () => {
    setAuditLogsList([]);
  };

  // Lists of movie indices the user holds
  const userTickets = ticketsList
    .filter((t) => t.userId === currentUser.id && (t.status === "active" || t.status === "used"))
    .map((t) => t.movieId);

  const userLicenses = licensesList
    .filter((l) => l.userId === currentUser.id && l.status === "active")
    .map((l) => l.movieId);

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative pb-16 selection:bg-red-600 selection:text-white overflow-hidden">
      
      {/* Dynamic sleek blur ambient glow elements */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-red-900 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-zinc-900 rounded-full blur-[120px]" />
      </div>

      {/* Navbar segment */}
      <Navbar
        user={currentUser}
        onChangeRole={handleRoleChange}
        ticketCount={ticketsList.filter(t => t.userId === currentUser.id && t.status === "active").length}
      />

      {/* Main Container */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8 space-y-12 leading-relaxed">
        
        {/* Cinematic Headline Banner */}
        <header className="relative bg-zinc-950 rounded-2xl p-6 md:p-10 border border-white/5 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-transparent z-0 pointer-events-none" />
          
          <div className="space-y-4 max-w-xl relative z-10">
            <div className="flex items-center gap-2 bg-red-600/10 border border-red-600/20 text-red-500 px-3 py-1 rounded-sm text-[10px] font-mono tracking-widest font-extrabold uppercase w-max">
              <Sparkles className="w-3.5 h-3.5" /> Nollywood Cinema Revolution
            </div>
            <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight text-white leading-[0.9] uppercase">
              African Cinema. <br />
              <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-800 bg-clip-text text-transparent">
                No Subscriptions.
              </span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              CINNETemple is a premium pay-per-view cinema in your browser. Read pitches, buy single tickets starting from ₦500, stream once securely — <strong>90% goes directly to creators.</strong>
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 pt-1">
              <span className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 p-2 rounded-lg text-zinc-400">
                <CheckCircle className="w-4 h-4 text-red-500" /> Paystack Secured NGN
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 p-2 rounded-lg text-zinc-400">
                <CheckCircle className="w-4 h-4 text-zinc-600" /> DRM anti-record guard
              </span>
            </div>
          </div>

          {/* Quick interactive role demo helper alert card */}
          <div className="relative z-10 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl w-full md:max-w-xs shadow-2xl space-y-4 font-sans backdrop-blur-md">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
              <Info className="w-4 h-4 text-red-500" /> Sandbox Simulator
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Toggle roles in the header to preview both sides: Buy ticket as a **Viewer**, bypass or review locks as early **Tester perks**, or access CRUD and forensics inside the **Filmmaker Admin** Backstage!
            </p>
            <div className="bg-white/5 p-2 text-[10px] font-mono rounded text-zinc-300 flex justify-between items-center border border-white/5">
              <span>Active Privilege:</span>
              <span className="uppercase font-bold text-red-500">{currentUser.role}</span>
            </div>
          </div>
        </header>

        {/* AI UGC Creative Lab - Highlighting Veo 3 integration */}
        <UGCPromoLab
          movies={moviesList}
          onTriggerUgcScriptLog={(details) => recordAuditLog("UGC_STUDIO_ACTION", details)}
        />

        {/* Catalog Lobby segment */}
        <MoviesSection
          movies={moviesList}
          userRole={currentUser.role}
          userTickets={userTickets}
          userLicenses={userLicenses}
          onBuyTicket={handleRequestCheckout}
          onWatchMovie={handleWatchMovie}
          onTriggerTrailer={handleWatchTeaser}
        />

        {/* Backstage Studio Admin panel - accessible by Admin role */}
        {(currentUser.role === "admin" || currentUser.role === "tester") && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-px bg-white/5 flex-1" />
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-black">
                Studio Controls Authorized
              </span>
              <div className="h-px bg-white/5 flex-1" />
            </div>

            <AdminPanel
              movies={moviesList}
              users={MOCK_USERS}
              payments={paymentsList}
              licenses={licensesList}
              playbackSessions={sessionsList}
              auditLogs={auditLogsList}
              onAddMovie={handleAddMovie}
              onModifyMovie={handleModifyMovie}
              onDeleteMovie={handleDeleteMovie}
              onUpdateUserRole={handleUpdateUsersRoleCRM}
              onGrantLicense={handleGrantLicense}
              onRevokeLicense={handleRevokeLicense}
              onClearAuditLogs={handleClearAuditLogs}
            />
          </div>
        )}

      </div>

      {/* Paystack checkout secure inline frame popup */}
      {selectedMovieForCheckout && (
        <CheckoutModal
          movie={selectedMovieForCheckout}
          onClose={() => setSelectedMovieForCheckout(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Media theatrical Player frame */}
      {activeWatchMovie && (
        <CinematicPlayer
          movie={activeWatchMovie}
          userEmail={currentUser.email}
          isTeaserOnly={isTeaserOnly}
          onClosePlayer={handleClosePlayer}
          onFirstPlayConsumed={handleConsumeTicketOnPlay}
        />
      )}

      {/* Bottom status indicator marker bar */}
      <footer className="w-full text-center text-[10px] font-mono text-zinc-600 mt-16 flex flex-col items-center justify-center gap-1 leading-normal selection:bg-neutral-800">
        <p className="flex items-center gap-1 uppercase tracking-widest font-black">
          <span>● DEPLOYED SECURITY LAYER ACTIVE</span>
          <span className="text-zinc-700">|</span>
          <span>Nollywood Sovereign Tech Moat</span>
        </p>
        <p className="text-zinc-700 text-[9px]">
          Engineering transparency and proper direct payouts from Abuja to the world.
        </p>
      </footer>
    </main>
  );
}
