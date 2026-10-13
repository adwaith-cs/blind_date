import React, { useState } from 'react';
import { 
  X, 
  Brain, 
  Sparkles, 
  Loader2, 
  Orbit, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Cpu
} from 'lucide-react';

interface ThinkingAstrodynamicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryBirdName: string;
  debrisName: string;
  missDistanceMeters: number;
}

export const ThinkingAstrodynamicsModal: React.FC<ThinkingAstrodynamicsModalProps> = ({
  isOpen,
  onClose,
  primaryBirdName,
  debrisName,
  missDistanceMeters,
}) => {
  const [scenarioPrompt, setScenarioPrompt] = useState<string>(
    `Perform complete multi-variable astrodynamic failure cascade reasoning for ${primaryBirdName} vs ${debrisName} with estimated miss distance of ${missDistanceMeters.toFixed(1)} meters. Evaluate atmospheric drag perturbation, B-plane error ellipse covariance, optimal delta-V maneuver epochs, and ground telemedicine outage failover.`
  );
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('gemini-3.1-pro-preview');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runThinkingAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/thinking-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conjunctionScenario: scenarioPrompt,
          primaryBird: primaryBirdName,
          debrisTarget: debrisName,
          missDistanceKm: (missDistanceMeters / 1000).toFixed(3),
          timeToTca: '38.4 minutes',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to complete thinking analysis');
      }

      const data = await res.json();
      setAnalysisText(data.deepAnalysis);
      setModelUsed(data.modelUsed || 'gemini-3.1-pro-preview');
    } catch (err: any) {
      setError(err.message || 'Error executing astrodynamics thinking reasoning');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !analysisText && !isLoading) {
      runThinkingAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-[#090e21] border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden font-mono flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-[#0e1633] border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-300">
              <Brain className="w-5 h-5 animate-pulse text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">
                  ASTRODYNAMICS HIGH THINKING ENGINE
                </h2>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-bold">
                  ThinkingLevel.HIGH
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Model: {modelUsed} with maximum step-by-step astrodynamic & ground cascade reasoning
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Input */}
        <div className="p-3 bg-[#060a16] border-b border-slate-800">
          <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
            <span>Complex Astrodynamic & Cascade Query:</span>
            <span className="text-purple-300">Deep Reasoning Active</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={scenarioPrompt}
              onChange={(e) => setScenarioPrompt(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-purple-400 rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={runThinkingAnalysis}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Recompute</span>
            </button>
          </div>
        </div>

        {/* Thinking Output Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080d1c]">
          {isLoading && (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="text-purple-300 font-bold">
                Synthesizing multi-variable astrodynamics with ThinkingLevel.HIGH...
              </span>
              <span className="text-slate-500 text-xs max-w-sm">
                Evaluating B-plane coordinate error ellipses, atmospheric density covariance, thruster Isp requirements, and terrestrial backup topologies.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {analysisText && !isLoading && (
            <div className="bg-[#0b1329] p-4 rounded-xl border border-purple-500/20 text-slate-200 text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
              <div className="font-mono text-[10px] text-purple-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Detailed Astrodynamics & Conjunction Assessment Report:
                </span>
                <span className="text-slate-500">{new Date().toISOString()}</span>
              </div>
              <div className="prose prose-invert max-w-none text-slate-200 text-xs">
                {analysisText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
