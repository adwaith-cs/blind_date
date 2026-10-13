import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  Orbit, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  Sliders, 
  Activity, 
  Code2, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Loader2,
  Database
} from 'lucide-react';
import { OrbitalTarget } from '../types';

interface MlWorkbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: OrbitalTarget[];
  selectedSatId: string;
  selectedDebId: string;
}

export const MlWorkbenchModal: React.FC<MlWorkbenchModalProps> = ({
  isOpen,
  onClose,
  catalog,
  selectedSatId,
  selectedDebId,
}) => {
  const [activeTab, setActiveTab] = useState<'propagation' | 'xgboost' | 'isolation_forest'>('xgboost');

  // SGP4 State
  const [selectedNorad, setSelectedNorad] = useState<string>('25544');
  const [tleLine1, setTleLine1] = useState<string>('1 25544U 98067A   24065.52222222  .00016717  00000-0  30123-3 0  9993');
  const [tleLine2, setTleLine2] = useState<string>('2 25544  51.6416 250.1234 0004567 120.4567 240.1234 15.49812345421232');
  const [propResult, setPropResult] = useState<any>(null);
  const [isPropagating, setIsPropagating] = useState<boolean>(false);

  // XGBoost State
  const [missDistanceKm, setMissDistanceKm] = useState<number>(0.35);
  const [relativeVelocityKms, setRelativeVelocityKms] = useState<number>(14.2);
  const [covarianceUncertainty, setCovarianceUncertainty] = useState<number>(240.0);
  const [riskResult, setRiskResult] = useState<any>(null);
  const [isAssessing, setIsAssessing] = useState<boolean>(false);

  // Isolation Forest State
  const [telemetryAltitudeKm, setTelemetryAltitudeKm] = useState<number>(552.4);
  const [telemetryVelocityKms, setTelemetryVelocityKms] = useState<number>(7.585);
  const [telemetryDriftRate, setTelemetryDriftRate] = useState<number>(0.0012);
  const [anomalyResult, setAnomalyResult] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  // Run initial XGBoost assessment on open
  useEffect(() => {
    if (isOpen) {
      handleAssessRisk();
      handleDetectAnomaly();
      handlePropagate();
    }
  }, [isOpen]);

  const handlePropagate = async () => {
    setIsPropagating(true);
    try {
      const res = await fetch('/api/v1/propagate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          norad_id: selectedNorad,
          tle_line1: tleLine1,
          tle_line2: tleLine2,
        }),
      });
      const data = await res.json();
      setPropResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPropagating(false);
    }
  };

  const handleAssessRisk = async () => {
    setIsAssessing(true);
    try {
      const res = await fetch('/api/v1/assess-conjunction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_norad: `NORAD-${selectedSatId}`,
          secondary_norad: `NORAD-${selectedDebId}`,
          miss_distance_km: Number(missDistanceKm),
          relative_velocity_kms: Number(relativeVelocityKms),
          covariance_uncertainty: Number(covarianceUncertainty),
        }),
      });
      const data = await res.json();
      setRiskResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssessing(false);
    }
  };

  const handleDetectAnomaly = async () => {
    setIsDetecting(true);
    try {
      const res = await fetch('/api/v1/detect-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          norad_id: `NORAD-${selectedSatId}`,
          altitude_km: Number(telemetryAltitudeKm),
          velocity_kms: Number(telemetryVelocityKms),
          drift_rate: Number(telemetryDriftRate),
        }),
      });
      const data = await res.json();
      setAnomalyResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDetecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#090f22] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden font-mono flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#0d1633] border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-400">
              <Cpu className="w-5 h-5 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">
                  ORBIT SENTINEL // MACHINE LEARNING BACKEND ENGINE
                </h2>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                  v2.4.0 REST API
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                SGP4 Orbit Propagator • XGBoost Conjunction Classifier • Isolation Forest Anomaly Detector
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-[#060a16] px-4 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('xgboost')}
            className={`px-3 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'xgboost'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>XGBoost Conjunction Classifier</span>
            <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">/api/v1/assess-conjunction</span>
          </button>

          <button
            onClick={() => setActiveTab('isolation_forest')}
            className={`px-3 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'isolation_forest'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Isolation Forest Anomaly Detector</span>
            <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">/api/v1/detect-anomaly</span>
          </button>

          <button
            onClick={() => setActiveTab('propagation')}
            className={`px-3 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'propagation'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Orbit className="w-3.5 h-3.5 text-emerald-400" />
            <span>SGP4 Orbital Propagator</span>
            <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">/api/v1/propagate</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* TAB 1: XGBOOST RISK CLASSIFIER */}
          {activeTab === 'xgboost' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#0d162d] border border-slate-800 text-slate-300 flex items-start justify-between gap-3 font-sans">
                <div>
                  <span className="font-bold text-cyan-300 font-mono text-xs block mb-0.5">
                    Conjunction Risk Classifier (Supervised XGBoost)
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluates collision probability using Conjunction Data Message (CDM) features: Euclidean miss distance, relative velocity, and covariance uncertainty tensor sum. Autonomously triggers maneuver recommendation at P &ge; 0.40.
                  </p>
                </div>
                <div className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-right font-mono text-[10px] shrink-0">
                  <span className="text-slate-500 block">n_estimators: 100</span>
                  <span className="text-cyan-400 font-bold">eval_metric: logloss</span>
                </div>
              </div>

              {/* Parameter Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Miss Distance */}
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Miss Distance (km):</span>
                    <span className="font-bold text-amber-300">{missDistanceKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="5.0"
                    step="0.05"
                    value={missDistanceKm}
                    onChange={(e) => {
                      setMissDistanceKm(parseFloat(e.target.value));
                    }}
                    className="w-full accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.05 km (50m)</span>
                    <span>5.0 km</span>
                  </div>
                </div>

                {/* Relative Velocity */}
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Relative Velocity (km/s):</span>
                    <span className="font-bold text-cyan-300">{relativeVelocityKms} km/s</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="16.0"
                    step="0.2"
                    value={relativeVelocityKms}
                    onChange={(e) => {
                      setRelativeVelocityKms(parseFloat(e.target.value));
                    }}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1.0 km/s</span>
                    <span>16.0 km/s</span>
                  </div>
                </div>

                {/* Covariance Uncertainty */}
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Covariance Uncertainty (m²):</span>
                    <span className="font-bold text-purple-300">{covarianceUncertainty} m²</span>
                  </div>
                  <input
                    type="range"
                    min="10.0"
                    max="500.0"
                    step="10.0"
                    value={covarianceUncertainty}
                    onChange={(e) => {
                      setCovarianceUncertainty(parseFloat(e.target.value));
                    }}
                    className="w-full accent-purple-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10.0 m² (Precise)</span>
                    <span>500.0 m² (High error)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleAssessRisk}
                  disabled={isAssessing}
                  className="px-4 py-2 rounded bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  {isAssessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Run Live Model Assessment</span>
                </button>
              </div>

              {/* Assessment Output Display */}
              {riskResult?.assessment && (
                <div className="p-4 rounded-xl bg-[#060a16] border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase">Collision Probability (Pc)</span>
                    <div className="text-2xl font-bold font-mono text-cyan-300">
                      {(riskResult.assessment.collision_probability * 100).toFixed(2)}%
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Raw: {riskResult.assessment.collision_probability}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase">Classified Risk Level</span>
                    <div className={`text-xl font-bold font-mono ${
                      riskResult.assessment.risk_level === 'Critical'
                        ? 'text-rose-400'
                        : riskResult.assessment.risk_level === 'High'
                        ? 'text-amber-400'
                        : riskResult.assessment.risk_level === 'Medium'
                        ? 'text-yellow-400'
                        : 'text-emerald-400'
                    }`}>
                      {riskResult.assessment.risk_level.toUpperCase()}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Threshold &ge; 0.40 triggers burn
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase">Maneuver Recommendation</span>
                    <div className="flex items-center gap-2">
                      {riskResult.assessment.maneuver_recommended ? (
                        <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/50 font-bold flex items-center gap-1 text-xs">
                          <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                          EXECUTE BURN
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold flex items-center gap-1 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          NOMINAL DRIFT
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Evaluated: {riskResult.evaluated_at}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ISOLATION FOREST ANOMALY DETECTOR */}
          {activeTab === 'isolation_forest' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#0d162d] border border-slate-800 text-slate-300 flex items-start justify-between gap-3 font-sans">
                <div>
                  <span className="font-bold text-purple-300 font-mono text-xs block mb-0.5">
                    Orbital Anomaly Detector (Isolation Forest)
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Unsupervised anomaly detector trained on nominal telemetry distributions (550±10km altitude, 7.59±0.05km/s orbital speed, 0.001±0.0005 drift rate). Detects uncoordinated station-keeping burns, space weather drag, or rapid orbit decay.
                  </p>
                </div>
                <div className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-right font-mono text-[10px] shrink-0">
                  <span className="text-slate-500 block">contamination: 0.05</span>
                  <span className="text-purple-400 font-bold">Unsupervised Tree</span>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Telemetry Altitude:</span>
                    <span className="font-bold text-cyan-300">{telemetryAltitudeKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="480.0"
                    max="620.0"
                    step="1.0"
                    value={telemetryAltitudeKm}
                    onChange={(e) => setTelemetryAltitudeKm(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>480 km (Decay)</span>
                    <span>550 km (Nominal)</span>
                    <span>620 km</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Orbital Velocity:</span>
                    <span className="font-bold text-purple-300">{telemetryVelocityKms} km/s</span>
                  </div>
                  <input
                    type="range"
                    min="7.30"
                    max="7.85"
                    step="0.01"
                    value={telemetryVelocityKms}
                    onChange={(e) => setTelemetryVelocityKms(parseFloat(e.target.value))}
                    className="w-full accent-purple-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>7.30 km/s</span>
                    <span>7.59 km/s (Nominal)</span>
                    <span>7.85 km/s</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Drift Rate:</span>
                    <span className="font-bold text-emerald-300">{telemetryDriftRate}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0001"
                    max="0.0040"
                    step="0.0001"
                    value={telemetryDriftRate}
                    onChange={(e) => setTelemetryDriftRate(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.0001</span>
                    <span>0.0010 (Nominal)</span>
                    <span>0.0040</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setTelemetryAltitudeKm(510.0);
                    setTelemetryVelocityKms(7.72);
                    setTelemetryDriftRate(0.0035);
                  }}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  Inject Anomaly Trigger
                </button>
                <button
                  onClick={handleDetectAnomaly}
                  disabled={isDetecting}
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  {isDetecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Evaluate Isolation Forest</span>
                </button>
              </div>

              {/* Anomaly Result Output */}
              {anomalyResult?.analysis && (
                <div className="p-4 rounded-xl bg-[#060a16] border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase">Telemetry Status</span>
                    <div className={`text-base font-bold font-mono ${
                      anomalyResult.analysis.is_anomaly ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {anomalyResult.analysis.status}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Classification: {anomalyResult.analysis.is_anomaly ? 'Outlier (-1)' : 'Inlier (1)'}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase">Anomaly Score</span>
                    <div className="text-2xl font-bold font-mono text-purple-300">
                      {anomalyResult.analysis.anomaly_score}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Contamination threshold ~ 0.48
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase">Timestamp</span>
                    <div className="text-xs font-mono text-slate-300">
                      {anomalyResult.timestamp}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Target: {anomalyResult.norad_id}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SGP4 ORBIT PROPAGATOR */}
          {activeTab === 'propagation' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#0d162d] border border-slate-800 text-slate-300 font-sans text-xs">
                <span className="font-bold text-emerald-300 font-mono text-xs block mb-0.5">
                  SGP4 / Simplified General Perturbations Model 4
                </span>
                <p className="text-slate-400">
                  Propagates Two-Line Elements (TLEs) using gravitational zonal harmonics ($J_2, J_3, J_4$) and atmospheric drag modeling to compute instantaneous 3D Earth-Centered Inertial (ECI) coordinates.
                </p>
              </div>

              {/* TLE Inputs */}
              <div className="space-y-2 font-mono text-xs">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">TLE Line 1:</label>
                  <input
                    type="text"
                    value={tleLine1}
                    onChange={(e) => setTleLine1(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-emerald-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">TLE Line 2:</label>
                  <input
                    type="text"
                    value={tleLine2}
                    onChange={(e) => setTleLine2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-emerald-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePropagate}
                  disabled={isPropagating}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  {isPropagating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Propagate State Vectors</span>
                </button>
              </div>

              {/* SGP4 Output */}
              {propResult?.position_eci_km && (
                <div className="p-4 rounded-xl bg-[#060a16] border border-slate-800 space-y-3 font-mono">
                  <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                    <span>SGP4 Output Vector // Epoch {propResult.timestamp}</span>
                    <span>Altitude: {propResult.altitude_km} km</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 block">3D ECI Position Vector [x, y, z] (km):</span>
                      <div className="text-cyan-300 font-bold">
                        X: {propResult.position_eci_km.x} km
                      </div>
                      <div className="text-cyan-300 font-bold">
                        Y: {propResult.position_eci_km.y} km
                      </div>
                      <div className="text-cyan-300 font-bold">
                        Z: {propResult.position_eci_km.z} km
                      </div>
                    </div>

                    <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 block">Velocity Vector [vx, vy, vz] (km/s):</span>
                      <div className="text-amber-300 font-bold">
                        Vx: {propResult.velocity_kms.vx} km/s
                      </div>
                      <div className="text-amber-300 font-bold">
                        Vy: {propResult.velocity_kms.vy} km/s
                      </div>
                      <div className="text-amber-300 font-bold">
                        Vz: {propResult.velocity_kms.vz} km/s
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
