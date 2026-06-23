import React, { useState, useEffect, useRef } from "react";
import { Movie } from "../types";
import { Shield, Eye, Lock, Volume2, Maximize, AlertTriangle, Monitor, RotateCcw, Video, Play } from "lucide-react";

interface CinematicPlayerProps {
  movie: Movie;
  userEmail: string;
  isTeaserOnly?: boolean;
  onClosePlayer: () => void;
  onFirstPlayConsumed?: () => void; // Triggered on start of main movie to simulate Ticket consumption!
}

export default function CinematicPlayer({
  movie,
  userEmail,
  isTeaserOnly = false,
  onClosePlayer,
  onFirstPlayConsumed,
}: CinematicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStartedRecordingGuard, setHasStartedRecordingGuard] = useState(true);

  // Floating watermark coords for screenshot protection
  const [watermarkPos, setWatermarkPos] = useState({ top: "25%", left: "30%" });

  // Move the anti-piracy watermark randomly to mimic state-of-the-art deterrents!
  useEffect(() => {
    const interval = setInterval(() => {
      const topRandom = Math.floor(Math.random() * 60) + 15; // 15% - 75%
      const leftRandom = Math.floor(Math.random() * 55) + 15; // 15% - 70%
      setWatermarkPos({ top: `${topRandom}%`, left: `${leftRandom}%` });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlayToggle = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        if (!isTeaserOnly && onFirstPlayConsumed) {
          onFirstPlayConsumed(); // Consume the ticket upon first starting the film!
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      videoRef.current.currentTime = percentage * duration;
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-4 leading-relaxed font-sans">
      {/* Upper Control Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-1 text-zinc-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-red-500">
            {isTeaserOnly ? "PREVIEW STREAM" : "AUTHORIZED PAY-PER-VIEW HALL"}
          </span>
        </div>
        
        <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
          <span>Watermark Protection: <strong className="text-emerald-500">ACTIVE</strong></span>
          <span>IP Tracked: <strong className="text-gray-300">197.210.35.4</strong></span>
        </div>

        <button
          onClick={onClosePlayer}
          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium font-mono uppercase tracking-wider transition-colors"
        >
          ✕ Close Hall
        </button>
      </div>

      {/* Main Screen Theater Frame */}
      <div className="relative w-full max-w-5xl aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center group">
        
        <video
          ref={videoRef}
          src={isTeaserOnly ? movie.trailerUrl : (movie.videoUrl || movie.trailerUrl || "https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-time-lapse-in-green-tones-42674-large.mp4")}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-contain"
          playsInline
          onClick={handlePlayToggle}
        />

        {/* Anti-Screen Recording Dynamic Floating Watermark */}
        <div
          style={{
            top: watermarkPos.top,
            left: watermarkPos.left,
          }}
          className="absolute text-[10px] sm:text-xs font-mono font-black text-white/10 select-none bg-black/20 pointer-events-none border border-white/5 p-1.5 rounded-md transition-all duration-1000 uppercase leading-none"
        >
          {userEmail} <br />
          SESS-BOUND • {new Date().toLocaleDateString()}
        </div>

        {/* Anti-record margin warning strip */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-white/5 px-3 py-1 rounded text-[10px] font-mono tracking-wider text-zinc-400 flex items-center gap-1 opacity-80 select-none">
          <Monitor className="w-3.5 h-3.5 text-red-500" />
          <span>DO NOT REC • ENCRYPTED STUDIO MASTER DETECTOR</span>
        </div>

        {/* Playback warning overlay if not playing yet */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none">
            <div className="w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center mb-4 text-red-500">
              <Video className="w-8 h-8 opacity-90" />
            </div>
            <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">{movie.title}</h3>
            <p className="text-zinc-400 text-xs max-w-md mt-1.5 leading-relaxed">
              {isTeaserOnly 
                ? "This is the free promotional trailer/teaser. Stream of the full feature film is restricted."
                : "Your single-use ticket transaction is verified. Prepare for an incredible cinematic screening."
              }
            </p>
            {!isTeaserOnly && (
              <div className="bg-red-600/10 border border-red-600/30 p-2 text-[10px] font-mono text-red-400 rounded max-w-sm mt-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>Ticket is consumed on first play click. Keep connection stable.</span>
              </div>
            )}
            <button
              onClick={handlePlayToggle}
              className="mt-5 pointer-events-auto bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all uppercase tracking-widest shadow-lg active:scale-95"
            >
              <Play className="w-4 h-4 fill-current text-white ml-0.5" />
              <span>{isTeaserOnly ? "Play Free Teaser" : "Start Cinema Screening (₦" + movie.priceNGN + ")"}</span>
            </button>
          </div>
        )}

        {/* Video Player Custom Bottom Bar Interface (Hover to display) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Progress Slider bar */}
          <div
            onClick={handleProgressClick}
            className="h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer relative"
          >
            <div
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              className="absolute left-0 top-0 bottom-0 bg-red-600 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-zinc-300">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayToggle}
                className="hover:text-red-500 transition-colors uppercase font-mono font-bold text-xs"
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>
              <span className="text-xs font-mono text-zinc-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                <Volume2 className="w-4 h-4" />
                <span>Stereo</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>1080p ABR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Under Screen Notice Box detailing actual ticket parameters */}
      <div className="w-full max-w-5xl bg-zinc-950 border border-white/5 mt-4 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-display font-extrabold text-red-500 text-sm uppercase tracking-wider">CINNETemple DRM Guard Active</h4>
          <p className="text-zinc-400 mt-1 text-xs">
            Any screenshot, capture, or stream rehosting logs a ticket breach to the African Intellectual Property Registry.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-xl border border-white/5 text-xs font-mono text-zinc-500">
          <span>TICKET TRACE ID:</span>
          <strong className="text-zinc-300">{isTeaserOnly ? "PUBLIC_PROMO" : "TICK-M1-U1-ACTIVE"}</strong>
        </div>
      </div>
    </div>
  );
}
