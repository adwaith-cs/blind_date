import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Radio, 
  Volume2, 
  Loader2, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { float32ToPcm16Base64, PcmPlayer } from '../utils/audioUtils';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBirdName: string;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  activeBirdName,
}) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isMicActive, setIsMicActive] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcriptLogs, setTranscriptLogs] = useState<{ role: 'user' | 'flight_director'; text: string; time: string }[]>([
    {
      role: 'flight_director',
      text: `OrbitSentinel Flight Director online. Monitoring target ${activeBirdName}. Speak into your microphone or enter telemetry commands.`,
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [textInput, setTextInput] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pcmPlayerRef = useRef<PcmPlayer | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isMicActiveRef = useRef<boolean>(true);

  isMicActiveRef.current = isMicActive;

  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      return;
    }

    startLiveSession();

    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  const cleanupAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (pcmPlayerRef.current) {
      pcmPlayerRef.current.close();
      pcmPlayerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('idle');
    setIsSpeaking(false);
  };

  const startLiveSession = async () => {
    setStatus('connecting');
    setErrorMessage(null);

    try {
      pcmPlayerRef.current = new PcmPlayer();

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setStatus('connected');
        // Setup microphone capture (16kHz)
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              sampleRate: 16000,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          mediaStreamRef.current = stream;

          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const inputCtx = new AudioContextClass({ sampleRate: 16000 });
          audioCtxRef.current = inputCtx;

          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (!isMicActiveRef.current || ws.readyState !== WebSocket.OPEN) return;
            const inputChannel = e.inputBuffer.getChannelData(0);
            const base64Pcm = float32ToPcm16Base64(inputChannel);
            ws.send(JSON.stringify({ audio: base64Pcm }));
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);
        } catch (micErr: any) {
          console.warn('Microphone permission denied or unavailable:', micErr);
          // Still allow text input to Live API
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setErrorMessage(msg.error);
            return;
          }
          if (msg.audio) {
            setIsSpeaking(true);
            pcmPlayerRef.current?.playChunk(msg.audio);
          }
          if (msg.interrupted) {
            pcmPlayerRef.current?.stop();
            setIsSpeaking(false);
          }
        } catch (e) {
          console.error('Error handling WebSocket message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket Live API error:', e);
        setStatus('error');
        setErrorMessage('Failed to connect to Live API backend.');
      };

      ws.onclose = () => {
        if (isOpen) {
          setStatus('idle');
        }
      };
    } catch (err: any) {
      console.error('Failed to start Live session:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Error connecting to Gemini Live API');
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ text: textInput.trim() }));
    setTranscriptLogs((prev) => [
      ...prev,
      {
        role: 'user',
        text: textInput.trim(),
        time: new Date().toLocaleTimeString(),
      },
    ]);
    setTextInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#090f22] border border-indigo-500/30 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.2)] overflow-hidden font-mono flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-[#0d1633] border-b border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-400/30 text-indigo-300">
              <Radio className="w-5 h-5 animate-pulse text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">
                  GEMINI 3.8 LIVE // VOICE CONVERSATION
                </h2>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                  LIVE API (WS)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Real-time bidirectional 16kHz audio streaming with Autonomous Flight Director
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

        {/* Live Audio Visualizer Banner */}
        <div className="p-6 bg-gradient-to-b from-[#090e21] to-[#060914] flex flex-col items-center justify-center border-b border-slate-800 gap-3">
          {/* Waveform bars */}
          <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-xs">
            {[40, 65, 85, 45, 95, 70, 50, 80, 60, 90, 45, 75, 55, 85, 65, 40].map((h, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  status === 'connected'
                    ? isSpeaking
                      ? 'bg-amber-400 animate-pulse'
                      : isMicActive
                      ? 'bg-indigo-400'
                      : 'bg-slate-700'
                    : 'bg-slate-800'
                }`}
                style={{
                  height: status === 'connected' ? (isSpeaking || isMicActive ? `${Math.random() * h + 15}%` : '15%') : '10%',
                }}
              />
            ))}
          </div>

          {/* Status Label */}
          <div className="flex items-center gap-2 text-xs">
            {status === 'connecting' && (
              <span className="text-amber-400 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Connecting to Gemini 3.8 Live WebSocket...
              </span>
            )}
            {status === 'connected' && (
              <span className="text-indigo-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {isSpeaking ? 'Flight Director is Speaking (24kHz PCM)...' : isMicActive ? 'Listening to Mic (16kHz PCM)...' : 'Microphone Muted'}
              </span>
            )}
            {status === 'error' && (
              <span className="text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMessage || 'Connection failed'}
              </span>
            )}
          </div>

          {/* Mic Toggle Button */}
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => setIsMicActive(!isMicActive)}
              className={`p-3 rounded-full transition-all shadow-lg ${
                isMicActive
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white ring-4 ring-indigo-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
              title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <span className="text-[11px] text-slate-400">
              {isMicActive ? 'Mic Active' : 'Mic Muted'}
            </span>
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080d1c] text-xs">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
            Real-Time Flight Controller Logs:
          </div>
          {transcriptLogs.map((log, index) => (
            <div
              key={index}
              className={`p-2.5 rounded-lg max-w-[85%] ${
                log.role === 'flight_director'
                  ? 'bg-[#0f1738] border border-indigo-500/20 text-indigo-100 ml-0'
                  : 'bg-cyan-950/80 border border-cyan-500/30 text-cyan-100 ml-auto'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                <span className="font-bold uppercase text-slate-300">
                  {log.role === 'flight_director' ? 'OrbitSentinel Flight Director' : 'Operator Ground Lead'}
                </span>
                <span>{log.time}</span>
              </div>
              <p className="font-sans leading-relaxed">{log.text}</p>
            </div>
          ))}
        </div>

        {/* Text fallback input to Live API */}
        <form onSubmit={handleSendText} className="p-3 bg-[#0b1329] border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type telemetry message to Flight Director (or speak into mic)..."
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || status !== 'connected'}
            className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
