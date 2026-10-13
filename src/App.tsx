import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OrbitalVisualizer } from './components/OrbitalVisualizer';
import { CommandConsole } from './components/CommandConsole';
import { AgentReasoningPanel } from './components/AgentReasoningPanel';
import { GroundImpactDrawer } from './components/GroundImpactDrawer';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { ThinkingAstrodynamicsModal } from './components/ThinkingAstrodynamicsModal';
import { ManeuverExecutionModal } from './components/ManeuverExecutionModal';
import { MlWorkbenchModal } from './components/MlWorkbenchModal';
import { OrbitalTarget, AgentRunResult } from './types';
import { playBase64Wav } from './utils/audioUtils';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Radio, 
  MapPin, 
  Activity, 
  Flame, 
  Volume2, 
  Layers 
} from 'lucide-react';

export default function App() {
  const [catalog, setCatalog] = useState<OrbitalTarget[]>([]);
  const [selectedSatId, setSelectedSatId] = useState<string>('sat-med-4b');
  const [selectedDebId, setSelectedDebId] = useState<string>('deb-cosmos-2251');
  const [agentResult, setAgentResult] = useState<AgentRunResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [maneuverExecuted, setManeuverExecuted] = useState<boolean>(false);

  // Modals
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState<boolean>(false);
  const [isThinkingOpen, setIsThinkingOpen] = useState<boolean>(false);
  const [isGroundMapOpen, setIsGroundMapOpen] = useState<boolean>(false);
  const [isBurnModalOpen, setIsBurnModalOpen] = useState<boolean>(false);
  const [isMlWorkbenchOpen, setIsMlWorkbenchOpen] = useState<boolean>(false);

  // TTS State
  const [isTtsLoading, setIsTtsLoading] = useState<boolean>(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState<boolean>(false);

  // Fetch catalog on mount
  useEffect(() => {
    fetch('/api/satellites/catalog')
      .then((res) => res.json())
      .then((data) => {
        if (data.catalog) {
          setCatalog(data.catalog);
        }
      })
      .catch((err) => console.error('Failed to load orbital catalog:', err));
  }, []);

  // Initial baseline orchestration
  useEffect(() => {
    runMissionOrchestration(
      'A cluster of military debris is heading toward our primary telemetry bird. Calculate collision risk, assess medical telemedicine clinics, and execute autonomous failover.',
      'sat-med-4b',
      'deb-cosmos-2251'
    );
  }, []);

  const runMissionOrchestration = async (prompt: string, satId: string, debId: string) => {
    setIsRunning(true);
    setManeuverExecuted(false);
    try {
      const res = await fetch('/api/agents/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: prompt,
          primarySatelliteId: satId,
          debrisId: debId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Agent orchestration failed');
      }

      const data: AgentRunResult = await res.json();
      setAgentResult(data);
    } catch (err: any) {
      console.error('Error running agent mission:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handlePlayTtsBriefing = async () => {
    if (isTtsPlaying || isTtsLoading) return;
    setIsTtsLoading(true);

    const speechText = agentResult
      ? `OrbitSentinel Flight Director Briefing. Target bird: ${activeSat?.name || 'Primary Telemetry'}. Approaching debris: ${activeDeb?.name || 'Debris'}. Estimated miss distance is ${agentResult.debrisMlAgent.missDistanceMeters.toFixed(1)} meters. Collision probability is ${(agentResult.debrisMlAgent.collisionProbability * 100).toFixed(1)} percent. Conjunction threat exceeds critical threshold. Autonomous delta-V burn recommended to safeguard ${agentResult.groundImpactAgent.totalLivesAtRisk} dependent patients and ground facilities.`
      : 'OrbitSentinel Flight Director online. All orbital sectors nominal. Standing by for conjunction telemetry vectors.';

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: speechText,
          voice: 'Zephyr',
        }),
      });

      if (!res.ok) {
        throw new Error('TTS generation failed');
      }

      const data = await res.json();
      if (data.audio) {
        setIsTtsPlaying(true);
        setIsTtsLoading(false);
        await playBase64Wav(data.audio);
        setIsTtsPlaying(false);
      }
    } catch (err) {
      console.error('Error playing TTS briefing:', err);
      setIsTtsPlaying(false);
      setIsTtsLoading(false);
    }
  };

  const activeSat = catalog.find((c) => c.id === selectedSatId) || {
    id: 'sat-med-4b',
    name: 'Sat-Health 4B (GSAT-Relay)',
    noradId: 44234,
    type: 'satellite' as const,
    tleLine1: '',
    tleLine2: '',
    altitudeKm: 580,
    inclinationDeg: 19.2,
    velocityKmS: 7.56,
    criticalGroundDependents: [],
  };

  const activeDeb = catalog.find((c) => c.id === selectedDebId) || {
    id: 'deb-cosmos-2251',
    name: 'Debris COSMOS-2251 Fragment #1042',
    noradId: 34112,
    type: 'debris' as const,
    tleLine1: '',
    tleLine2: '',
    altitudeKm: 582,
    inclinationDeg: 74.0,
    velocityKmS: 7.82,
    criticalGroundDependents: [],
  };

  const missDist = agentResult?.debrisMlAgent.missDistanceMeters ?? 42.6;
  const colProb = maneuverExecuted ? 0.0000001 : (agentResult?.debrisMlAgent.collisionProbability ?? 0.084);
  const tcaMin = agentResult?.debrisMlAgent.timeToClosestApproachMinutes ?? 38.4;
  const riskLevel = maneuverExecuted ? 'NOMINAL' : (agentResult?.debrisMlAgent.riskLevel ?? 'CRITICAL');

  const defaultManeuver = {
    deltaVx_ms: 1.48,
    deltaVy_ms: 0.12,
    deltaVz_ms: -0.85,
    totalDeltaV_ms: 1.71,
    propellantRequiredKg: 0.42,
    burnDurationSec: 24.2,
    newSafePerigeeKm: 583.5,
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Mission Control Bar */}
      <Navbar
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
        onOpenThinking={() => setIsThinkingOpen(true)}
        onOpenGroundMap={() => setIsGroundMapOpen(true)}
        onOpenMlWorkbench={() => setIsMlWorkbenchOpen(true)}
        onPlayTtsBriefing={handlePlayTtsBriefing}
        onTriggerBurn={() => setIsBurnModalOpen(true)}
        isTtsPlaying={isTtsPlaying}
        isTtsLoading={isTtsLoading}
        conjunctionRisk={riskLevel}
        collisionProbability={colProb}
        activeBirdName={activeSat.name}
      />

      {/* Main Mission Control Grid */}
      <main className="flex-1 p-3 lg:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 max-w-[1920px] mx-auto w-full">
        {/* Left Column: Command Console (3 cols) */}
        <section className="lg:col-span-4 xl:col-span-3 flex flex-col h-[600px] lg:h-[calc(100vh-5.5rem)]">
          <CommandConsole
            onRunMission={runMissionOrchestration}
            isRunning={isRunning}
            catalog={catalog}
            selectedSatId={selectedSatId}
            selectedDebId={selectedDebId}
            onSelectSat={setSelectedSatId}
            onSelectDeb={setSelectedDebId}
          />
        </section>

        {/* Center Column: 3D Tactical Orbital Domain Canvas & Ground Footprint (5 cols) */}
        <section className="lg:col-span-8 xl:col-span-5 flex flex-col gap-3 h-auto lg:h-[calc(100vh-5.5rem)] overflow-y-auto">
          {/* Orbital Canvas */}
          <OrbitalVisualizer
            primaryBird={activeSat}
            debrisTarget={activeDeb}
            missDistanceMeters={missDist}
            collisionProbability={colProb}
            tcaMinutes={tcaMin}
            maneuverExecuted={maneuverExecuted}
            maneuverVector={agentResult?.debrisMlAgent.maneuverVector || defaultManeuver}
          />

          {/* Real-time Astrodynamics & Ground Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#090f22] border border-cyan-500/20">
              <span className="text-[10px] text-slate-400 block mb-0.5">Primary Altitude</span>
              <span className="text-base font-bold text-cyan-300">{activeSat.altitudeKm} km</span>
              <span className="text-[10px] text-slate-500 block">LEO Circular</span>
            </div>

            <div className="p-3 rounded-xl bg-[#090f22] border border-rose-500/20">
              <span className="text-[10px] text-slate-400 block mb-0.5">Miss Distance</span>
              <span className={`text-base font-bold ${maneuverExecuted ? 'text-emerald-400' : 'text-rose-400'}`}>
                {maneuverExecuted ? '+14.8 km' : `${missDist.toFixed(1)} m`}
              </span>
              <span className="text-[10px] text-slate-500 block">B-Plane Radius</span>
            </div>

            <div className="p-3 rounded-xl bg-[#090f22] border border-amber-500/20">
              <span className="text-[10px] text-slate-400 block mb-0.5">Time to TCA</span>
              <span className="text-base font-bold text-amber-300">{tcaMin.toFixed(1)} min</span>
              <span className="text-[10px] text-slate-500 block">Propagation Window</span>
            </div>

            <div className="p-3 rounded-xl bg-[#090f22] border border-emerald-500/20">
              <span className="text-[10px] text-slate-400 block mb-0.5">Ground Dependents</span>
              <span className="text-base font-bold text-emerald-300">
                {activeSat.criticalGroundDependents?.length || 3} Hubs
              </span>
              <span className="text-[10px] text-slate-500 block">100% Failover Ready</span>
            </div>
          </div>

          {/* Terrestrial Ground Impact & Failover Status Bar */}
          <div className="p-3.5 rounded-xl bg-[#080d1c] border border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-slate-200 block text-xs">
                  Active Terrestrial Failover Topology
                </span>
                <span className="text-[11px] text-slate-400">
                  {maneuverExecuted
                    ? 'Transferred downlink to backup Starlink LEO + VHF/HF Tactical Radio grid'
                    : 'Monitoring transponder link health // Automated trigger threshold at Pc > 0.001'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsGroundMapOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Verify Google Maps Grounding</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Live Agent Reasoning Log (4 cols) */}
        <section className="lg:col-span-12 xl:col-span-4 flex flex-col h-[600px] lg:h-[calc(100vh-5.5rem)]">
          <AgentReasoningPanel
            agentResult={agentResult}
            isRunning={isRunning}
            onOpenGroundMaps={() => setIsGroundMapOpen(true)}
            onOpenMlWorkbench={() => setIsMlWorkbenchOpen(true)}
            onTriggerBurn={() => setIsBurnModalOpen(true)}
            maneuverExecuted={maneuverExecuted}
          />
        </section>
      </main>

      {/* Modals */}
      <GroundImpactDrawer
        isOpen={isGroundMapOpen}
        onClose={() => setIsGroundMapOpen(false)}
        dependents={activeSat.criticalGroundDependents || []}
        targetLocation={activeSat.criticalGroundDependents?.[0]?.location || 'Sylhet, Bangladesh'}
      />

      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        activeBirdName={activeSat.name}
      />

      <ThinkingAstrodynamicsModal
        isOpen={isThinkingOpen}
        onClose={() => setIsThinkingOpen(false)}
        primaryBirdName={activeSat.name}
        debrisName={activeDeb.name}
        missDistanceMeters={missDist}
      />

      <ManeuverExecutionModal
        isOpen={isBurnModalOpen}
        onClose={() => setIsBurnModalOpen(false)}
        onConfirmExecution={() => setManeuverExecuted(true)}
        maneuverVector={agentResult?.debrisMlAgent.maneuverVector || defaultManeuver}
        primaryBirdName={activeSat.name}
        smsPayload={agentResult?.responseAutomationAgent.groundAlertDispatched?.smsPayload}
      />

      <MlWorkbenchModal
        isOpen={isMlWorkbenchOpen}
        onClose={() => setIsMlWorkbenchOpen(false)}
        catalog={catalog}
        selectedSatId={selectedSatId}
        selectedDebId={selectedDebId}
      />
    </div>
  );
}
