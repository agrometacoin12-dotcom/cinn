import React, { useState } from "react";
import { Movie } from "../types";
import { CreditCard, Eye, EyeOff, Lock, Sparkles, Check, ChevronRight, Ban } from "lucide-react";

interface CheckoutModalProps {
  movie: Movie;
  onClose: () => void;
  onSuccess: (paymentReference: string) => void;
}

export default function CheckoutModal({ movie, onClose, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<"details" | "otp" | "success">("details");
  const [cardNumber, setCardNumber] = useState("4381 2290 8872 1010");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("718");
  const [otp, setOtp] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv) {
      setErrorMessage("Please complete all card details.");
      return;
    }
    setErrorMessage("");
    setIsProcessing(true);

    // Simulate contacting Paystack gateway
    setTimeout(() => {
      setIsProcessing(false);
      setStep("otp");
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "1234") {
      setErrorMessage("Incorrect simulator code. Tip: Use '1234' to verify!");
      return;
    }
    setErrorMessage("");
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setStep("success");
      onSuccess("PAY_TEMPLE_" + Math.random().toString(36).substring(2, 8).toUpperCase());
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-zinc-950 border border-white/5 rounded-3xl shadow-2xl overflow-hidden leading-relaxed">
        {/* Header */}
        <div className="bg-zinc-900/60 px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow shadow-red-500/50"></div>
            <span className="font-mono text-xs text-red-500 font-extrabold uppercase tracking-widest">
              Paystack Secure Inline
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body content */}
        <div className="p-6">
          {step === "details" && (
            <form onSubmit={handleStartPayment} className="space-y-4">
              <div className="bg-black/60 border border-white/5 p-4 rounded-xl">
                <p className="text-xs text-zinc-500 font-mono">PURCHASING SINGLE TICKET</p>
                <p className="font-display font-black text-xl text-white mt-1 uppercase tracking-tight">{movie.title}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                  <span className="text-zinc-500 text-xs">Total Bill:</span>
                  <span className="font-display font-extrabold text-red-500 text-lg">
                    ₦{movie.priceNGN.toLocaleString()}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-lg flex items-center gap-2 text-xs text-red-300">
                  <Ban className="w-4.5 h-4.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Card Form */}
              <div className="space-y-3">
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4000 1234 5678 9010"
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                  <CreditCard className="absolute right-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-600 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                      CVV Code
                    </label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="•••"
                      maxLength={3}
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-600 text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/15"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-1.5 animate-pulse text-white">
                      🔒 Verifying Secure Bank Ledger...
                    </span>
                  ) : (
                    <>
                      <span>Submit Secure Payment (₦{movie.priceNGN.toLocaleString()})</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-zinc-500" /> Secure 256-bit encrypted bank gateway.
              </p>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl text-center">
                <p className="text-xs text-red-500 font-bold uppercase tracking-wide">
                  🛡️ Simulated One-Time PIN (OTP) Gate
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  We sent a simulated verify SMS to your bank profile.
                </p>
                <p className="text-xs font-mono font-bold text-red-500 mt-2">
                  Tip: Enter code <span className="bg-red-600 text-white px-1.5 rounded font-black text-sm">1234</span> to bypass successfully!
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-lg text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[11px] font-mono text-zinc-500 text-center uppercase">
                  Verify OTP CODE
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="e.g. 1234"
                  maxLength={6}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-lg text-center tracking-widest text-[#3ECF8E] font-bold focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
              >
                {isProcessing ? "Finalizing Ledger Clearance..." : "Verify & Issue My Active Ticket"}
              </button>

              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-full text-zinc-500 hover:text-zinc-300 text-[11px] text-center font-mono mt-1"
              >
                ← Back to Card Details
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-[#3ECF8E]">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h4 className="font-display font-medium text-lg text-white uppercase tracking-tight">Ticket Issued Successfully!</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Single-use cinema license is cleared. Tap below to start your cinematic screening!
                </p>
              </div>

              <p className="text-[10px] font-mono text-zinc-500">
                LOBBY CLEARANCE SECURED WITH FORENSIC WATERMARK TRACE
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
