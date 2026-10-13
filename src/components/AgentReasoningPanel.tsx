import React, { useState } from 'react';
import { 
  Bot, 
  Cpu, 
  Orbit, 
  Building2, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  MessageSquare, 
  FileCode2, 
  ArrowUpRight, 
  ShieldCheck, 
  Terminal,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AgentRunResult, ManeuverVector } from '../types';

interface AgentReasoningPanelProps {
  agentResult: AgentRunResult | null;
  isRunning: boolean;
  onOpenGroundMaps: () => void;
  onOpenMlWorkbench?: () => void;
  onTriggerBurn: () => void;
  maneuverExecuted: boolean;
}

export const AgentReasoningPanel: React.FC<AgentReasoningPanelProps> = ({
  agentResult,
  isRunning,
  onOpenGroundMaps,
  onOpenMlWorkbench,
  onTriggerBurn,
  maneuverExecuted,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'coordinator' | 'debris_ml' | 'ground_rag' | 'response'>('all');
  const [expandedSection, setExpandedSection] = useState<string | null>('response');

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  if (!agentResult && !isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#080d1c] border border-cyan-500/20 rounded-xl font-mono">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <Bot className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1">
          Agent Reasoning Log Standby
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Select or type a mission goal on the left console to trigger the autonomous multi-agent pipeline in real-time.
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 max-w-xs text-left">
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-cyan-400 font-bold block">1. Coordinator</span>
            LLM Brain / Task Split
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-rose-400 font-bold block">2. Debris ML</span>
            SGP4 Orbit Math
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-emerald-400 font-bold block">3. Ground RAG</span>
            Hospital Semantic Map
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-amber-400 font-bold block">4. Response</span>
            ΔV Burn & Twilio SMS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#080d1c] border border-cyan-500/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.06)]">
      {/* Top Header */}
      <div className="bg-[#0b1329] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold text-slate-200 tracking-wider">
            LIVE AGENT REASONING LOG
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              ORCHESTRATING...
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ALL 4 AGENTS COMPLETE
            </span>
          )}
        </div>
      </div>

      {/* Mission Summary Banner */}
      {agentResult && (
        <div className="bg-cyan-950/30 border-b border-cyan-500/20 p-3 font-mono text-xs">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Activity className="w-3 h-3" />
            Synthesized Mission Vector:
          </div>
          <div className="text-slate-200 leading-relaxed font-sans text-xs">
            {agentResult.missionSummary}
          </div>
        </div>
      )}

      {/* Agents Scrollable Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {/* AGENT 1: MISSION COORDINATOR */}
        {agentResult?.coordinatorAgent && (
          <div className="border border-slate-800 rounded-lg bg-[#0c142b] overflow-hidden">
            <div 
              onClick={() => toggleSection('coordinator')}
              className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-[10px] font-bold">
                  1
                </div>
                <span className="font-bold text-cyan-300 text-xs">
                  {agentResult.coordinatorAgent.agentName}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-200">
                  LLM BRAIN
                </span>
              </div>
              {expandedSection === 'coordinator' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {expandedSection === 'coordinator' && (
              <div className="p-3 space-y-2 text-[11px] text-slate-300">
                <div className="text-slate-400">
                  <strong className="text-slate-200">Primary Goal:</strong> {agentResult.coordinatorAgent.goal}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Delegated Sub-Agent Pipelines:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {agentResult.coordinatorAgent.delegatedTasks.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 text-[10px]">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
                  <div className="text-slate-500 font-semibold">Coordinator Thought Log:</div>
                  {agentResult.coordinatorAgent.thoughtLog.map((log, i) => (
                    <div key={i} className="text-slate-300 flex items-start gap-1.5">
                      <span className="text-cyan-500">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AGENT 2: DEBRIS & TRAJECTORY ANALYST (ML & SGP4) */}
        {agentResult?.debrisMlAgent && (
          <div className="border border-rose-900/40 rounded-lg bg-[#0c142b] overflow-hidden">
            <div 
              onClick={() => toggleSection('debris_ml')}
              className="px-3 py-2 bg-rose-950/30 border-b border-rose-900/40 flex items-center justify-between cursor-pointer hover:bg-rose-950/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400 text-[10px] font-bold">
                  2
                </div>
                <span className="font-bold text-rose-300 text-xs">
                  {agentResult.debrisMlAgent.agentName}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                  SGP4 + ML COVARIANCE
                </span>
              </div>
              {expandedSection === 'debris_ml' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {expandedSection === 'debris_ml' && (
              <div className="p-3 space-y-3 text-[11px]">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">
                    Engine: <strong className="text-cyan-300">XGBoost CDM Classifier + SGP4 API</strong>
                  </span>
                  {onOpenMlWorkbench && (
                    <button
                      onClick={onOpenMlWorkbench}
                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition-colors"
                    >
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      <span>Live ML Engine Workbench</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Miss Distance:</span>
                    <span className="text-rose-400 font-bold text-xs">
                      {agentResult.debrisMlAgent.missDistanceMeters.toFixed(1)} m
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Time to TCA:</span>
                    <span className="text-amber-300 font-bold text-xs">
                      {agentResult.debrisMlAgent.timeToClosestApproachMinutes.toFixed(1)} min
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Relative Velocity:</span>
                    <span className="text-cyan-300 font-bold text-xs">
                      {agentResult.debrisMlAgent.relativeVelocityKmS} km/s
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Collision Prob (Pc):</span>
                    <span className="text-rose-400 font-bold text-xs">
                      {(agentResult.debrisMlAgent.collisionProbability * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Maneuver Delta-V Vectors */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      Calculated Avoidance Burn Vector (ΔV):
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Total Δv: <strong>{agentResult.debrisMlAgent.maneuverVector.totalDeltaV_ms} m/s</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-300">
                    <div className="bg-slate-900 p-1.5 rounded">
                      ΔVx: <strong className="text-cyan-400">{agentResult.debrisMlAgent.maneuverVector.deltaVx_ms} m/s</strong> (Prograde)
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded">
                      ΔVy: <strong className="text-cyan-400">{agentResult.debrisMlAgent.maneuverVector.deltaVy_ms} m/s</strong> (Cross-track)
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded">
                      ΔVz: <strong className="text-cyan-400">{agentResult.debrisMlAgent.maneuverVector.deltaVz_ms} m/s</strong> (Radial)
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Propellant Cost: {agentResult.debrisMlAgent.maneuverVector.propellantRequiredKg} kg Hydrazine</span>
                    <span>Safe Target Perigee: +{agentResult.debrisMlAgent.maneuverVector.newSafePerigeeKm} km</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AGENT 3: GROUND IMPACT ASSESSOR (VECTOR RAG) */}
        {agentResult?.groundImpactAgent && (
          <div className="border border-emerald-900/40 rounded-lg bg-[#0c142b] overflow-hidden">
            <div 
              onClick={() => toggleSection('ground_rag')}
              className="px-3 py-2 bg-emerald-950/30 border-b border-emerald-900/40 flex items-center justify-between cursor-pointer hover:bg-emerald-950/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-[10px] font-bold">
                  3
                </div>
                <span className="font-bold text-emerald-300 text-xs">
                  {agentResult.groundImpactAgent.agentName}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  VECTOR DB RAG & MAPS
                </span>
              </div>
              {expandedSection === 'ground_rag' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {expandedSection === 'ground_rag' && (
              <div className="p-3 space-y-3 text-[11px]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Lives Dependent on Downlink: <strong className="text-rose-400">{agentResult.groundImpactAgent.totalLivesAtRisk}</strong>
                  </span>
                  <button
                    onClick={onOpenGroundMaps}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 transition-colors"
                  >
                    <span>Launch Google Maps Grounding</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Vulnerable ground facilities list */}
                <div className="space-y-2">
                  {agentResult.groundImpactAgent.vulnerableAssets.map((asset, i) => (
                    <div key={i} className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">{asset.facility}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          asset.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}>
                          {asset.severity}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{asset.location}</div>
                      <div className="text-[11px] text-amber-300/90 font-sans">{asset.blackoutImpact}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AGENT 4: AUTONOMOUS RESPONSE BROKER */}
        {agentResult?.responseAutomationAgent && (
          <div className="border border-amber-900/40 rounded-lg bg-[#0c142b] overflow-hidden">
            <div 
              onClick={() => toggleSection('response')}
              className="px-3 py-2 bg-amber-950/30 border-b border-amber-900/40 flex items-center justify-between cursor-pointer hover:bg-amber-950/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 text-[10px] font-bold">
                  4
                </div>
                <span className="font-bold text-amber-300 text-xs">
                  {agentResult.responseAutomationAgent.agentName}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                  EXECUTION & FAILOVER
                </span>
              </div>
              {expandedSection === 'response' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {expandedSection === 'response' && (
              <div className="p-3 space-y-3 text-[11px]">
                {/* Burn Code Box */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-cyan-300 font-bold">
                      <FileCode2 className="w-3.5 h-3.5" />
                      Generated CCSDS OEM Satellite Burn Script:
                    </span>
                    <button
                      onClick={onTriggerBurn}
                      className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                    >
                      {maneuverExecuted ? 'Re-fire Burn' : 'Execute Burn On-Orbit'}
                    </button>
                  </div>
                  <pre className="p-2.5 rounded bg-[#060a16] border border-cyan-500/20 text-cyan-300 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {agentResult.responseAutomationAgent.deltaVBurnScript}
                  </pre>
                </div>

                {/* Twilio SMS Dispatched Simulation */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      Automated Twilio SMS & PagerDuty Alert Trigger:
                    </span>
                    <span className="text-[9px] text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      DISPATCHED 200 OK
                    </span>
                  </div>
                  <div className="bg-[#111936] p-2 rounded text-[11px] text-slate-200 border-l-2 border-emerald-400 font-sans">
                    "{agentResult.responseAutomationAgent.groundAlertDispatched.smsPayload}"
                  </div>
                  <div className="text-[9px] text-slate-500 flex items-center justify-between">
                    <span>Target Group: {agentResult.responseAutomationAgent.groundAlertDispatched.recipientGroup}</span>
                    <span>Sent: {agentResult.responseAutomationAgent.groundAlertDispatched.sentTimestamp}</span>
                  </div>
                </div>

                {/* Terrestrial Failover Route */}
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80 text-[10px]">
                  <span className="text-slate-400 block font-semibold mb-0.5">Active Ground Failover Routing:</span>
                  <span className="text-cyan-300">{agentResult.responseAutomationAgent.failoverRoute}</span>
                </div>

                {/* Mitigation Result */}
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{agentResult.responseAutomationAgent.mitigationSummary}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
