import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Radio, 
  Loader2, 
  Search, 
  CheckCircle2, 
  ShieldAlert,
  Navigation
} from 'lucide-react';
import { MapsGroundingResult, GroundDependent } from '../types';

interface GroundImpactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dependents: GroundDependent[];
  targetLocation: string;
}

export const GroundImpactDrawer: React.FC<GroundImpactDrawerProps> = ({
  isOpen,
  onClose,
  dependents,
  targetLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(targetLocation || 'Sylhet, Bangladesh');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<MapsGroundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMapsGrounding = async (queryText: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const activeDep = dependents[0];
      const res = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: queryText,
          query: `Major emergency trauma centers, regional hospital telemedicine hubs, and sat-com earth ground stations in ${queryText}`,
          lat: activeDep?.lat,
          lng: activeDep?.lng,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to fetch Maps Grounding data');
      }

      const data: MapsGroundingResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error executing Google Maps grounding search');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !result && !isLoading) {
      fetchMapsGrounding(searchQuery);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg bg-[#080d1c] border-l border-cyan-500/30 h-full flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-4 bg-[#0b1329] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                GOOGLE MAPS GROUNDING // INFRASTRUCTURE
              </h2>
              <span className="text-[10px] text-slate-400">
                Model: gemini-3.5-flash with googleMaps tool
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

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-800 bg-[#060a16]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) fetchMapsGrounding(searchQuery.trim());
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location (e.g. Sylhet, Bangladesh)..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>Verify</span>
            </button>
          </form>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Static Ground Telemetry Dependents */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              Primary Sat-Com Transponder Dependents:
            </h3>
            <div className="space-y-2">
              {dependents.map((dep, i) => (
                <div key={i} className="p-2.5 rounded bg-[#0d162d] border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-200">{dep.name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                      {dep.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{dep.location} ({dep.lat.toFixed(4)}°, {dep.lng.toFixed(4)}°)</span>
                  </div>
                  <div className="text-[10px] text-rose-300">
                    Population Impact: {dep.popAtRisk}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maps Grounding Results */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Verified Places from Google Maps:
            </h3>

            {isLoading && (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <span>Querying Google Maps Grounding via gemini-3.5-flash...</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300">
                {error}
              </div>
            )}

            {/* Extracted Google Maps Links */}
            {result?.mapLinks && result.mapLinks.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  Clickable Maps Links (Extracted Grounding Chunks):
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {result.mapLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-2 rounded bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-emerald-500/60 transition-all flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-200 group-hover:text-emerald-300 font-medium truncate">
                          {link.title}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Grounding Analysis Text */}
            {result?.analysis && (
              <div className="bg-[#0b1329] p-3 rounded-lg border border-slate-800 text-slate-300 font-sans leading-relaxed text-xs space-y-2 whitespace-pre-wrap">
                <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  Ground Facility Intelligence Report:
                </div>
                {result.analysis}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
