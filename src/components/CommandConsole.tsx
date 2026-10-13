import React, { useState } from 'react';
import { 
  Send, 
  Terminal, 
  Sparkles, 
  Radio, 
  Satellite, 
  Flame, 
  ShieldAlert, 
  Mic, 
  MicOff, 
  Loader2,
  ChevronRight,
  Database,
  ArrowRight
} from 'lucide-react';
import { OrbitalTarget } from '../types';

interface CommandConsoleProps {
  onRunMission: (prompt: string, satId: string, debId: string) => void;
  isRunning: boolean;
  catalog: OrbitalTarget[];
  selectedSatId: string;
  selectedDebId: string;
  onSelectSat: (id: string) => void;
  onSelectDeb: (id: string) => void;
}

const PRESET_SCENARIOS = [
  {
    title: 'The Wow Factor: Military Debris Incident',
    prompt: 'A cluster of military debris is heading toward our primary telemetry bird. Calculate collision risk, assess medical telemedicine clinics, and execute autonomous failover.',
    satId: 'sat-med-4b',
    debId: 'deb-cosmos-2251',
    badge: 'JUDGE DEMO',
  },
  {
    title: 'South Asia Flood & Telemedicine Anomaly',
    prompt: 'Assess the incoming orbital anomaly over South Asia and safeguard local medical stations in Sylhet and Chittagong coastal command.',
    satId: 'sat-med-4b',
    debId: 'deb-fengyun-1c',
    badge: 'HUMANITARIAN',
  },
  {
    title: 'Sentinel-6 Mekong River Conjunction',
    prompt: 'Detect conjunction between Cosmos-2251 fragment and Sentinel-6. Calculate impact on Mekong basin flood telemetry sensors.',
    satId: 'sat-sentinel-6',
    debId: 'deb-cosmos-2251',
    badge: 'CRITICAL INFRA',
  },
  {
    title: 'Wildfire Incident FirstNet Dropout Threat',
    prompt: 'Evaluate high-velocity conjunction threat to FirstNet Wildfire Sat-Com 1. Safeguard Sierra Nevada mobile command posts.',
    satId: 'sat-cal-firelink',
    debId: 'deb-fengyun-1c',
    badge: 'DISASTER MGMT',
  },
];

export const CommandConsole: React.FC<CommandConsoleProps> = ({
  onRunMission,
  isRunning,
  catalog,
  selectedSatId,
  selectedDebId,
  onSelectSat,
  onSelectDeb,
}) => {
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const satellites = catalog.filter((c) => c.type === 'satellite');
  const debris = catalog.filter((c) => c.type === 'debris' || c.type === 'rocket_body');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isRunning) return;
    onRunMission(inputPrompt.trim(), selectedSatId, selectedDebId);
  };

  const handleSelectPreset = (scenario: typeof PRESET_SCENARIOS[0]) => {
    setInputPrompt(scenario.prompt);
    onSelectSat(scenario.satId);
    onSelectDeb(scenario.debId);
    onRunMission(scenario.prompt, scenario.satId, scenario.debId);
  };

  // Browser SpeechRecognition fallback for terminal prompt dictation
  const handleToggleVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use keyboard input.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080d1c] border border-cyan-500/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.06)]">
      {/* Header */}
      <div className="bg-[#0b1329] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold text-slate-200 tracking-wider">
            OPERATOR COMMAND INTERFACE
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          LANGGRAPH ORCHESTRATOR
        </span>
      </div>

      {/* Target Asset Selectors */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Target Satellite (Primary Bird):</label>
          <select
            value={selectedSatId}
            onChange={(e) => onSelectSat(e.target.value)}
            disabled={isRunning}
            className="w-full bg-[#0d162d] border border-slate-700 rounded px-2.5 py-1.5 text-cyan-200 text-xs focus:outline-none focus:border-cyan-400"
          >
            {satellites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (NORAD {s.noradId}) - {s.altitudeKm}km
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Approaching Orbital Threat:</label>
          <select
            value={selectedDebId}
            onChange={(e) => onSelectDeb(e.target.value)}
            disabled={isRunning}
            className="w-full bg-[#0d162d] border border-slate-700 rounded px-2.5 py-1.5 text-rose-300 text-xs focus:outline-none focus:border-rose-400"
          >
            {debris.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} (NORAD {d.noradId}) - {d.altitudeKm}km
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Scenarios List */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quick Mission Scenarios (Hackathon Blueprint)
          </span>
          <span className="text-[9px] text-slate-500">Click to run full multi-agent sequence</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {PRESET_SCENARIOS.map((scenario, index) => (
            <button
              key={index}
              onClick={() => handleSelectPreset(scenario)}
              disabled={isRunning}
              className="text-left group p-2 rounded-lg bg-[#0d162d]/60 hover:bg-[#121f3d] border border-slate-800 hover:border-cyan-500/40 transition-all flex items-start justify-between gap-2"
            >
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {scenario.title}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-300 border border-amber-500/30 font-semibold">
                    {scenario.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 group-hover:text-slate-300">
                  {scenario.prompt}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5 mt-1 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Natural Language Prompt Terminal */}
      <div className="p-3 flex-1 flex flex-col justify-end">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Speak or enter mission command (e.g. 'Assess the incoming orbital anomaly over South Asia and safeguard local medical stations.')..."
              rows={3}
              disabled={isRunning}
              className="w-full bg-[#0b1329] border border-slate-700 focus:border-cyan-400 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-mono"
            />
            
            {/* Mic Dictation */}
            <button
              type="button"
              onClick={handleToggleVoiceDictation}
              className={`absolute bottom-3 right-3 p-1.5 rounded transition-all ${
                isRecording 
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Voice dictation input"
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-slate-500">
              ⚡ Multi-Agent Pipeline: Coordinator → Debris ML → Ground RAG → Response Broker
            </span>

            <button
              type="submit"
              disabled={isRunning || !inputPrompt.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching Agents...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Mission</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
