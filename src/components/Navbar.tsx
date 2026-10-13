import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  Volume2, 
  Brain, 
  MapPin, 
  Flame, 
  Clock, 
  Loader2, 
  CheckCircle2,
  Activity,
  Cpu
} from 'lucide-react';

interface NavbarProps {
  onOpenLiveVoice: () => void;
  onOpenThinking: () => void;
  onOpenGroundMap: () => void;
  onOpenMlWorkbench: () => void;
  onPlayTtsBriefing: () => void;
  onTriggerBurn: () => void;
  isTtsPlaying: boolean;
  isTtsLoading: boolean;
  conjunctionRisk: 'CRITICAL' | 'ELEVATED' | 'NOMINAL';
  collisionProbability: number;
  activeBirdName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLiveVoice,
  onOpenThinking,
  onOpenGroundMap,
  onOpenMlWorkbench,
  onPlayTtsBriefing,
  onTriggerBurn,
  isTtsPlaying,
  isTtsLoading,
  conjunctionRisk,
  collisionProbability,
  activeBirdName,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#080d1a]/95 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none sticky top-0 z-40">
      {/* Brand & Mission Status */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-950 to-blue-900 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
          <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#080d1a] animate-ping" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
              ORBIT SENTINEL
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-semibold tracking-wider">
              MULTI-AGENT CORE
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Activity className="w-3 h-3 text-cyan-400" />
              Target: <strong className="text-cyan-200 font-normal">{activeBirdName}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SGP4 Real-Time
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Mission Clock & Conjunction Radar Meter */}
      <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-cyan-300">{utcTime || '00:00:00 UTC'}</span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Conjunction Pc:</span>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span
              className={`px-2 py-0.5 rounded font-bold text-xs ${
                conjunctionRisk === 'CRITICAL'
                  ? 'bg-rose-950/80 border border-rose-500/50 text-rose-300 animate-pulse'
                  : conjunctionRisk === 'ELEVATED'
                  ? 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
                  : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
              }`}
            >
              {conjunctionRisk === 'CRITICAL' ? 'CRITICAL ' : ''}
              {(collisionProbability * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Gemini 3.8 Flash TTS Voice Briefing */}
        <button
          onClick={onPlayTtsBriefing}
          disabled={isTtsLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
            isTtsPlaying
              ? 'bg-amber-500/20 border border-amber-400/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-200'
          }`}
          title="Play vocal flight director report using Gemini 3.8 Flash TTS"
        >
          {isTtsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <Volume2 className={`w-3.5 h-3.5 ${isTtsPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
          )}
          <span>{isTtsPlaying ? 'Playing Audio' : 'Audio Briefing'}</span>
          <span className="text-[9px] bg-slate-800 px-1 rounded text-cyan-400 border border-slate-700">TTS</span>
        </button>

        {/* Gemini 3.8 Live API Voice Conversation */}
        <button
          onClick={onOpenLiveVoice}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium bg-gradient-to-r from-blue-950 to-indigo-950 hover:from-blue-900 hover:to-indigo-900 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 transition-all shadow-[0_0_10px_rgba(99,102,241,0.15)]"
          title="Real-time voice conversation with Flight Director via Gemini 3.8 Live API"
        >
          <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Live Voice (Live API)</span>
        </button>

        {/* Thinking Astrodynamics Engine */}
        <button
          onClick={onOpenThinking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium bg-slate-900 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-400/60 text-purple-200 transition-all"
          title="Trigger high-thinking astrodynamic analysis"
        >
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span>High Thinking</span>
        </button>

        {/* Google Maps Grounding Drawer */}
        <button
          onClick={onOpenGroundMap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400/60 text-emerald-200 transition-all"
          title="View ground hospital and gateway assets via Google Maps grounding"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ground RAG</span>
        </button>

        {/* ML Engine (XGBoost / SGP4 / Isolation Forest) */}
        <button
          onClick={onOpenMlWorkbench}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-400/50 hover:border-cyan-300 text-cyan-200 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          title="Open Machine Learning backend engine workbench (SGP4, XGBoost, Isolation Forest)"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>ML Workbench</span>
          <span className="text-[9px] bg-cyan-900/60 text-cyan-300 px-1 rounded border border-cyan-500/40">XGB</span>
        </button>

        {/* Autonomous Maneuver Action */}
        <button
          onClick={onTriggerBurn}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-mono font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-[0_0_14px_rgba(225,29,72,0.35)] transition-all active:scale-95"
          title="Execute autonomous delta-V burn script and trigger emergency failover"
        >
          <Flame className="w-3.5 h-3.5 text-amber-200" />
          <span>Burn Maneuver</span>
        </button>
      </div>
    </header>
  );
};
