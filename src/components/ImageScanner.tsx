import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { AccessibilitySettings } from '../types/index.ts';
import { PRESET_ROOMS, PresetRoom } from '../utils/presets.ts';

interface ImageScannerProps {
  accessibility: AccessibilitySettings;
  isAnalyzing: boolean;
  onAnalyze: (imageData: string, mimeType: string, roomTypeHint?: string) => void;
  onSelectPreset: (preset: PresetRoom) => void;
}

export const ImageScanner: React.FC<ImageScannerProps> = ({
  accessibility,
  isAnalyzing,
  onAnalyze,
  onSelectPreset,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [roomHint, setRoomHint] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    setErrorMsg(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Could not read image file. Please try another.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePresetClick = (preset: PresetRoom) => {
    setSelectedImage(preset.thumbnail);
    setRoomHint(preset.type);
    setErrorMsg(null);
    onSelectPreset(preset);
  };

  const handleTriggerAnalyze = () => {
    if (!selectedImage) {
      setErrorMsg('Please select or upload a room image first.');
      return;
    }
    setErrorMsg(null);
    onAnalyze(selectedImage, mimeType, roomHint);
  };

  return (
    <section
      aria-label="Room Image Input and Analysis Station"
      className={`p-6 rounded-2xl border transition-colors ${
        accessibility.highContrast
          ? 'bg-black border-2 border-yellow-400 text-white'
          : 'bg-[#0b0e1a]/80 border-cyan-500/30 text-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
      }`}
    >
      <div className="flex flex-col gap-6">
        {/* Title and Intro */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                accessibility.highContrast
                  ? 'bg-yellow-400'
                  : 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]'
              }`}
              aria-hidden="true"
            />
            <h2 className="font-mono text-lg sm:text-xl font-bold tracking-wide uppercase text-white">
              Tactical Room Decomposition
            </h2>
          </div>
          <p className="text-sm text-slate-300">
            Feed an image of your messy space. Our neural engine bypasses executive overload by breaking it into 2-5 minute micro-missions.
          </p>
        </div>

        {/* 1-Click ADHD Presets */}
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Quick Test Presets (Instant Analysis)</span>
            <span className="text-[10px] text-cyan-400">Zero Effort Start</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESET_ROOMS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                  selectedImage === preset.thumbnail
                    ? accessibility.highContrast
                      ? 'bg-yellow-400 text-black border-white font-bold'
                      : 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : accessibility.highContrast
                    ? 'bg-black border-yellow-400/60 hover:border-yellow-400 text-white'
                    : 'bg-[#101424] border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white'
                }`}
                aria-label={`Select preset ${preset.name}: ${preset.description}`}
              >
                <img
                  src={preset.thumbnail}
                  alt={preset.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        accessibility.highContrast
                          ? 'bg-white text-black'
                          : 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40'
                      }`}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs truncate text-white">{preset.name}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {preset.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Upload or Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            isDragOver
              ? accessibility.highContrast
                ? 'bg-yellow-400/20 border-yellow-400'
                : 'bg-cyan-950/40 border-cyan-400'
              : accessibility.highContrast
              ? 'bg-black border-yellow-400'
              : 'bg-[#0f1322] border-slate-700 hover:border-cyan-500/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="sr-only"
            id="room-image-upload"
            aria-label="Upload photo of your messy room"
          />

          {selectedImage ? (
            <div className="flex flex-col items-center">
              {/* Image Preview with Cyberpunk HUD reticle */}
              <div className="relative max-w-md w-full rounded-xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-black">
                <img
                  src={selectedImage}
                  alt="Room to de-clutter"
                  className="w-full max-h-72 object-cover"
                />

                {/* Reticle Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none border border-cyan-400/40 flex flex-col justify-between p-3"
                  aria-hidden="true"
                >
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400 bg-black/60 px-2 py-0.5 rounded w-max">
                    [TARGET ACQUIRED: CLUTTER SCAN]
                  </div>
                  {/* Cyber corners */}
                  <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-400 self-start" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-400 self-end" />
                </div>

                {/* Laser scan line if analyzing */}
                {isAnalyzing && !accessibility.reducedMotion && (
                  <div
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-bounce"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none p-1"
                >
                  Change Image
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setRoomHint('');
                  }}
                  className="text-xs font-mono text-red-400 hover:text-red-300 underline focus-visible:ring-2 focus-visible:ring-red-400 focus:outline-none p-1"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                  accessibility.highContrast
                    ? 'bg-yellow-400 text-black border-2 border-white'
                    : 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-400'
                }`}
                aria-hidden="true"
              >
                <Upload className="w-7 h-7" />
              </div>

              <h3 className="font-mono font-bold text-sm text-white mb-1">
                Drop your messy room photo here
              </h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm">
                Take a quick snap with your phone or drag and drop any image (kitchen, bedroom, closet, desk)
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                    accessibility.highContrast
                      ? 'bg-yellow-400 text-black border-2 border-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" aria-hidden="true" />
                  Select File
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                    accessibility.highContrast
                      ? 'bg-black text-white border-yellow-400'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-200'
                  }`}
                >
                  <Camera className="w-4 h-4" aria-hidden="true" />
                  Take Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Room Type Hint Input (Optional) */}
        <div>
          <label htmlFor="room-hint-input" className="block text-xs font-mono text-slate-300 font-semibold mb-1.5">
            Room Type or Focus Request (Optional):
          </label>
          <input
            id="room-hint-input"
            type="text"
            value={roomHint}
            onChange={(e) => setRoomHint(e.target.value)}
            placeholder="e.g. Kitchen with dishes, Bedroom floor, Desk papers..."
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
              accessibility.highContrast
                ? 'bg-black text-white border-2 border-yellow-400 placeholder-slate-500'
                : 'bg-[#101424] text-white border border-slate-700 focus:border-cyan-400 placeholder-slate-500'
            }`}
          />
        </div>

        {/* Error message */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-center gap-2 p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-mono"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Analyze Action Button */}
        <button
          type="button"
          disabled={!selectedImage || isAnalyzing}
          onClick={handleTriggerAnalyze}
          className={`w-full py-4 rounded-xl font-mono text-base font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all focus-visible:ring-4 focus-visible:ring-cyan-400 focus:outline-none ${
            isAnalyzing
              ? 'opacity-80 cursor-wait bg-slate-800 text-slate-400'
              : !selectedImage
              ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
              : accessibility.highContrast
              ? 'bg-yellow-400 text-black border-2 border-white hover:bg-yellow-300 active:scale-[0.99]'
              : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 text-black shadow-[0_0_25px_rgba(0,240,255,0.6)] hover:shadow-[0_0_35px_rgba(0,240,255,0.8)] active:scale-[0.99]'
          }`}
          aria-label={
            isAnalyzing
              ? 'Analyzing room and decomposing tasks...'
              : 'Analyze room image and decompose tasks'
          }
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span>NEURAL SCAN IN PROGRESS...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-black" aria-hidden="true" />
              <span>DECOMPOSE ROOM INTO MICRO-STEPS</span>
            </>
          )}
        </button>

        {/* Live Status Region for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          {isAnalyzing
            ? 'Analyzing room image using artificial intelligence to produce ADHD-friendly micro-tasks...'
            : ''}
        </div>
      </div>
    </section>
  );
};
