import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Radio, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  Crosshair, 
  Globe2 
} from 'lucide-react';
import { OrbitalTarget, ManeuverVector } from '../types';

interface OrbitalVisualizerProps {
  primaryBird: OrbitalTarget;
  debrisTarget: OrbitalTarget;
  missDistanceMeters: number;
  collisionProbability: number;
  tcaMinutes: number;
  maneuverExecuted: boolean;
  maneuverVector?: ManeuverVector;
}

export const OrbitalVisualizer: React.FC<OrbitalVisualizerProps> = ({
  primaryBird,
  debrisTarget,
  missDistanceMeters,
  collisionProbability,
  tcaMinutes,
  maneuverExecuted,
  maneuverVector,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'3d_orbit' | 'b_plane' | 'ground_cone'>('3d_orbit');
  const animFrameId = useRef<number | null>(null);

  // Simulation time angle in radians
  const angleRef = useRef<number>(0);
  const burnParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const earthRadius = Math.min(width, height) * 0.22;

      if (isPlaying) {
        angleRef.current += 0.008 * simSpeed;
      }
      const t = angleRef.current;

      // Draw background space grid & starfield
      ctx.fillStyle = '#060914';
      ctx.fillRect(0, 0, width, height);

      // Subtle coordinate radar rings
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
      ctx.lineWidth = 1;
      for (let r = earthRadius * 1.3; r < Math.max(width, height); r += 45) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Earth body with glowing atmospheric ring
      const earthGlow = ctx.createRadialGradient(cx, cy, earthRadius * 0.7, cx, cy, earthRadius * 1.15);
      earthGlow.addColorStop(0, '#0a2540');
      earthGlow.addColorStop(0.7, '#07162c');
      earthGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = earthGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Earth sphere
      const earthBody = ctx.createRadialGradient(cx - earthRadius * 0.3, cy - earthRadius * 0.3, 10, cx, cy, earthRadius);
      earthBody.addColorStop(0, '#1e3a5f');
      earthBody.addColorStop(0.5, '#0f243d');
      earthBody.addColorStop(1, '#05101f');
      ctx.fillStyle = earthBody;
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric rim
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Earth Continent outlines (Stylized radar meridians)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
      ctx.clip();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        const yOffset = (lat / 90) * earthRadius;
        const rLat = Math.sqrt(Math.max(0, earthRadius * earthRadius - yOffset * yOffset));
        ctx.ellipse(cx, cy + yOffset, rLat, rLat * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Satellite Orbit parameters
      const satOrbitRadiusX = earthRadius * 1.65 + (maneuverExecuted ? 18 : 0);
      const satOrbitRadiusY = earthRadius * 1.15;
      const satTilt = 0.35; // orbital inclination visual tilt

      // Debris Orbit parameters
      const debOrbitRadiusX = earthRadius * 1.62;
      const debOrbitRadiusY = earthRadius * 1.25;
      const debTilt = -0.52; // opposite inclination cut

      // Draw Primary Satellite Orbit Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(satTilt);
      ctx.beginPath();
      ctx.ellipse(0, 0, satOrbitRadiusX, satOrbitRadiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = maneuverExecuted ? 'rgba(52, 211, 153, 0.7)' : 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = maneuverExecuted ? 2.5 : 2;
      ctx.setLineDash(maneuverExecuted ? [] : [6, 4]);
      ctx.stroke();
      ctx.restore();

      // Draw Debris Orbit Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(debTilt);
      ctx.beginPath();
      ctx.ellipse(0, 0, debOrbitRadiusX, debOrbitRadiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();

      // Satellite current position
      const satX = cx + Math.cos(satTilt) * (Math.cos(t) * satOrbitRadiusX) - Math.sin(satTilt) * (Math.sin(t) * satOrbitRadiusY);
      const satY = cy + Math.sin(satTilt) * (Math.cos(t) * satOrbitRadiusX) + Math.cos(satTilt) * (Math.sin(t) * satOrbitRadiusY);

      // Debris current position
      // Debris orbits with phasing towards conjunction point
      const debPhase = maneuverExecuted ? t * 1.05 + 1.2 : t * 1.05 + 0.15;
      const debX = cx + Math.cos(debTilt) * (Math.cos(debPhase) * debOrbitRadiusX) - Math.sin(debTilt) * (Math.sin(debPhase) * debOrbitRadiusY);
      const debY = cy + Math.sin(debTilt) * (Math.cos(debPhase) * debOrbitRadiusX) + Math.cos(debTilt) * (Math.sin(debPhase) * debOrbitRadiusY);

      // Distance between Satellite and Debris in canvas pixels
      const dx = debX - satX;
      const dy = debY - satY;
      const distPx = Math.sqrt(dx * dx + dy * dy);

      // Conjunction point marker (Intersection of orbits)
      const conjX = cx + satOrbitRadiusX * 0.72;
      const conjY = cy - satOrbitRadiusY * 0.65;

      // Draw ground coverage cone from satellite to Earth surface
      if (viewMode === '3d_orbit' || viewMode === 'ground_cone') {
        const targetGroundX = cx + 35;
        const targetGroundY = cy - 20;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(satX, satY);
        ctx.lineTo(targetGroundX - 45, targetGroundY + 15);
        ctx.lineTo(targetGroundX + 45, targetGroundY + 15);
        ctx.closePath();

        const coneGrad = ctx.createLinearGradient(satX, satY, targetGroundX, targetGroundY);
        coneGrad.addColorStop(0, maneuverExecuted ? 'rgba(52, 211, 153, 0.25)' : 'rgba(56, 189, 248, 0.2)');
        coneGrad.addColorStop(1, maneuverExecuted ? 'rgba(52, 211, 153, 0.02)' : 'rgba(56, 189, 248, 0.02)');
        ctx.fillStyle = coneGrad;
        ctx.fill();

        // Downlink beam pulse
        ctx.strokeStyle = maneuverExecuted ? 'rgba(52, 211, 153, 0.8)' : 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -t * 15;
        ctx.beginPath();
        ctx.moveTo(satX, satY);
        ctx.lineTo(targetGroundX, targetGroundY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Ground Target Station Icon
        ctx.fillStyle = maneuverExecuted ? '#34d399' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(targetGroundX, targetGroundY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Target Ground pulse ring
        ctx.strokeStyle = maneuverExecuted ? 'rgba(52, 211, 153, 0.6)' : 'rgba(56, 189, 248, 0.6)';
        ctx.beginPath();
        ctx.arc(targetGroundX, targetGroundY, 8 + (Math.sin(t * 4) + 1) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '10px monospace';
        ctx.fillStyle = '#bae6fd';
        ctx.fillText('Ground Station // Telemedicine Gateway', targetGroundX + 12, targetGroundY + 3);
      }

      // Draw Proximity Warning if close approach
      if (distPx < 85 && !maneuverExecuted) {
        // Red threat vector connecting satellite and debris
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(satX, satY);
        ctx.lineTo(debX, debY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Danger Ellipse
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc((satX + debX) / 2, (satY + debY) / 2, distPx * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        // Distance HUD Label
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`⚡ CLOSE CONJUNCTION: ${missDistanceMeters.toFixed(1)}m`, (satX + debX) / 2 - 60, (satY + debY) / 2 - 15);
      }

      // If maneuver executed: Thruster burn flame particles
      if (maneuverExecuted) {
        // Spawn particles
        if (burnParticlesRef.current.length < 30) {
          burnParticlesRef.current.push({
            x: satX,
            y: satY,
            vx: (Math.random() - 0.5) * 2 - Math.cos(satTilt) * 2,
            vy: (Math.random() - 0.5) * 2 - Math.sin(satTilt) * 2,
            life: 1.0,
          });
        }

        // Draw and update particles
        burnParticlesRef.current.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.04;
          ctx.fillStyle = `rgba(251, 146, 60, ${p.life})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.life * 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
        burnParticlesRef.current = burnParticlesRef.current.filter((p) => p.life > 0);

        // Green Safe Margin Radius
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(satX, satY, 28, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('AVOIDANCE ORBIT ACTIVE (+14.8km)', satX + 14, satY - 14);
      }

      // Draw Satellite
      ctx.save();
      ctx.translate(satX, satY);
      // Satellite core
      ctx.fillStyle = maneuverExecuted ? '#34d399' : '#38bdf8';
      ctx.fillRect(-6, -6, 12, 12);
      // Solar arrays
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-18, -3, 10, 6);
      ctx.fillRect(8, -3, 10, 6);
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1;
      ctx.strokeRect(-18, -3, 10, 6);
      ctx.strokeRect(8, -3, 10, 6);
      ctx.strokeRect(-6, -6, 12, 12);
      ctx.restore();

      // Satellite Label
      ctx.font = '11px monospace';
      ctx.fillStyle = '#e0f2fe';
      ctx.fillText(primaryBird.name, satX + 16, satY + 4);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`ALT: ${primaryBird.altitudeKm}km | V: ${primaryBird.velocityKmS}km/s`, satX + 16, satY + 16);

      // Draw Debris
      ctx.save();
      ctx.translate(debX, debY);
      ctx.rotate(t * 3); // Debris tumbling
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-7, -4);
      ctx.lineTo(8, -6);
      ctx.lineTo(5, 7);
      ctx.lineTo(-6, 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // Debris Label
      ctx.font = '11px monospace';
      ctx.fillStyle = '#fca5a5';
      ctx.fillText(debrisTarget.name, debX + 14, debY + 4);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#f87171';
      ctx.fillText(`REL V: 14.82 km/s | NORAD: ${debrisTarget.noradId}`, debX + 14, debY + 16);

      // Conjunction Node on trajectory intersection
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(conjX, conjY, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('PREDICTED TCA INTERSECTION', conjX + 16, conjY - 4);

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isPlaying, simSpeed, viewMode, primaryBird, debrisTarget, missDistanceMeters, maneuverExecuted, maneuverVector]);

  return (
    <div className="relative w-full h-[380px] lg:h-[430px] rounded-xl overflow-hidden border border-cyan-500/20 bg-[#060914] shadow-[0_0_25px_rgba(6,182,212,0.1)] flex flex-col">
      {/* Top Telemetry Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="bg-[#0b1329]/80 backdrop-blur-md border border-cyan-500/30 rounded px-2.5 py-1 flex items-center gap-2">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-cyan-200">
            SGP4 Orbit Canvas // LEO 580km
          </span>
        </div>

        <div className={`backdrop-blur-md rounded px-2.5 py-1 border flex items-center gap-1.5 font-mono text-[11px] ${
          maneuverExecuted 
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
        }`}>
          {maneuverExecuted ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Burn Executed: Radial Separation +14.8km</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Conjunction Alert: Miss Distance {missDistanceMeters.toFixed(1)}m</span>
            </>
          )}
        </div>
      </div>

      {/* Top Right Astrodynamics Quick Readout */}
      <div className="absolute top-3 right-3 z-10 bg-[#0b1329]/85 backdrop-blur-md border border-slate-700/60 rounded p-2 text-right font-mono text-[10px] space-y-0.5 pointer-events-none">
        <div className="text-slate-400">
          TCA Time: <span className="text-amber-300 font-bold">{tcaMinutes.toFixed(1)}m</span>
        </div>
        <div className="text-slate-400">
          Rel Speed: <span className="text-cyan-300 font-bold">14.82 km/s</span>
        </div>
        <div className="text-slate-400">
          Collision Pc: <span className={maneuverExecuted ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
            {maneuverExecuted ? '<0.000001' : (collisionProbability * 100).toFixed(2) + '%'}
          </span>
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full flex-1 block cursor-crosshair" />

      {/* Bottom Controls Bar */}
      <div className="bg-[#090f20]/90 backdrop-blur-sm border-t border-slate-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <button
            onClick={() => {
              angleRef.current = 0;
            }}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset Epoch Angle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-px bg-slate-800" />

          {/* Speed Selectors */}
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <span className="text-slate-500 mr-1">Speed:</span>
            {[1, 5, 20].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  simSpeed === spd
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* View Mode */}
        <div className="flex items-center gap-1 text-[10px] font-mono">
          <span className="text-slate-500">View:</span>
          {(['3d_orbit', 'ground_cone'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2 py-0.5 rounded uppercase transition-colors ${
                viewMode === mode
                  ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
