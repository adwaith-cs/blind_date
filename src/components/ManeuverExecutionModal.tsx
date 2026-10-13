import React, { useState, useEffect } from 'react';
import { 
  X, 
  Flame, 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Loader2, 
  Smartphone,
  Send,
  Sparkles
} from 'lucide-react';
import { ManeuverVector } from '../types';

interface ManeuverExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExecution: () => void;
  maneuverVector: ManeuverVector;
  primaryBirdName: string;
  smsPayload?: string;
}

export const ManeuverExecutionModal: React.FC<ManeuverExecutionModalProps> = ({
  isOpen,
  onClose,
  onConfirmExecution,
  maneuverVector,
  primaryBirdName,
  smsPayload,
}) => {
  const [phase, setPhase] = useState<'review' | 'igniting' | 'burning' | 'success'>('review');
  const [countdown, setCountdown] = useState<number>(5);
  const [burnProgress, setBurnProgress] = useState<number>(0);
  const [simulatedPhone, setSimulatedPhone] = useState<string>('+1 (555) 438-9201');

  useEffect(() => {
    if (!isOpen) {
      setPhase('review');
      setCountdown(5);
      setBurnProgress(0);
      return;
    }
  }, [isOpen]);

  const handleStartBurn = () => {
    setPhase('igniting');
    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        setPhase('burning');

        // Burn simulation
        let progress = 0;
        const burnTimer = setInterval(() => {
          progress += 5;
          setBurnProgress(progress);
          if (progress >= 100) {
            clearInterval(burnTimer);
            setPhase('success');
            onConfirmExecution();
          }
        }, 120);
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#090f22] border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden font-mono flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#0d1633] border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                AUTONOMOUS RESPONSE BROKER // BURN EXECUTION
              </h2>
              <span className="text-[10px] text-slate-400">
                Target Bird: {primaryBirdName} // CCSDS Thruster Injection
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Phase 1: Review */}
          {phase === 'review' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200">
                <span className="font-bold block mb-1">
                  ⚠️ High-Conjunction Maneuver Authorization Required
                </span>
                <p className="text-[11px] text-slate-300 font-sans">
                  The Debris ML Agent calculated collision probability exceeding critical threshold (Pc &gt; 0.001). Executing this maneuver will command onboard RCS thrusters and simultaneously trigger Twilio SMS alerts and radio failover.
                </p>
              </div>

              {/* Vector Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Total Δv:</span>
                  <span className="text-cyan-300 font-bold text-sm">{maneuverVector.totalDeltaV_ms} m/s</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Burn Duration:</span>
                  <span className="text-amber-300 font-bold text-sm">{maneuverVector.burnDurationSec} s</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Fuel Mass:</span>
                  <span className="text-purple-300 font-bold text-sm">{maneuverVector.propellantRequiredKg} kg</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">New Safe Perigee:</span>
                  <span className="text-emerald-300 font-bold text-sm">+{maneuverVector.newSafePerigeeKm} km</span>
                </div>
              </div>

              {/* Twilio SMS Mockup */}
              <div className="p-3 rounded-lg bg-[#070c1a] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    Automated Twilio SMS Ground Dispatch Target:
                  </span>
                  <span className="text-slate-500">{simulatedPhone}</span>
                </div>
                <div className="bg-[#101730] p-2.5 rounded border-l-2 border-emerald-400 text-[11px] text-slate-200 font-sans">
                  {smsPayload || "CRITICAL ORBIT ALERT: Sat-Health 4B initiating emergency collision avoidance maneuver. Primary downlink pausing. Telemedicine traffic rerouted to backup radio grid."}
                </div>
              </div>

              {/* Trigger Button */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartBurn}
                  className="px-5 py-2 rounded bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-amber-200" />
                  <span>Execute On-Orbit Avoidance Burn</span>
                </button>
              </div>
            </div>
          )}

          {/* Phase 2 & 3: Igniting & Burning */}
          {(phase === 'igniting' || phase === 'burning') && (
            <div className="p-8 text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-amber-950/80 border-2 border-amber-500 flex items-center justify-center text-amber-400 text-2xl font-bold shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                  {phase === 'igniting' ? countdown : `${burnProgress}%`}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-amber-300 uppercase tracking-wider">
                  {phase === 'igniting' ? 'Attitude Slewing & Thruster Arming...' : 'Hydrazine Thruster Firing in Progress...'}
                </h3>
                <p className="text-xs text-slate-400">
                  {phase === 'igniting' 
                    ? `Initiating +${maneuverVector.totalDeltaV_ms} m/s prograde burn in ${countdown}s`
                    : 'Applying 24.2s orbital delta-V impulse to clear conjunction risk sphere.'}
                </p>
              </div>

              {/* Progress Bar */}
              {phase === 'burning' && (
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-amber-500/30">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-150"
                    style={{ width: `${burnProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Phase 4: Success */}
          {phase === 'success' && (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-emerald-300 uppercase tracking-wider">
                  Maneuver Completed & Ground Continuity Preserved!
                </h3>
                <p className="text-xs text-slate-300 font-sans max-w-md mx-auto">
                  New safe orbital perigee established (+14.8 km radial offset). Collision probability reduced to &lt;0.000001. Twilio SMS notification sent to ground NOC and all 38 rural clinics switched seamlessly to the backup radio mesh!
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs text-left space-y-1 font-mono">
                <div>✓ Burn Executed: 24.2s Hydrazine Pulse (+1.71 m/s total Δv)</div>
                <div>✓ Twilio SMS Alert: Dispatched to Regional NOC (+1 555-438-9201)</div>
                <div>✓ Ground Hospitals: Telemedicine video streaming preserved via failover</div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors"
              >
                Return to Mission Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
