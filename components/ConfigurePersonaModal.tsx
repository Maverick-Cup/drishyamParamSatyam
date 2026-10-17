import React, { useState } from 'react';
import {
  X,
  UploadSimple,
  Microphone,
  HardDrive,
  FileText,
  ShieldCheck,
  CheckCircle,
  Play,
  SpeakerHigh,
} from '@phosphor-icons/react';
import { RepresentedPersonProfileData } from './RepresentedPersonProfileCard';

export interface CustomPersonaInitialMemory {
  title: string;
  year: number | string;
  provenance: string;
  text: string;
  audioClipUrl?: string;
}

interface ConfigurePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: RepresentedPersonProfileData;
  onSaveProfile: (
    updatedProfile: RepresentedPersonProfileData,
    initialMemory?: CustomPersonaInitialMemory
  ) => void;
}

export const ConfigurePersonaModal: React.FC<ConfigurePersonaModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  const [fullName, setFullName] = useState(currentProfile.fullName || 'Prof. Anand Sharma');
  const [relationship, setRelationship] = useState(currentProfile.relationship || 'Grandfather');
  const [birthYear, setBirthYear] = useState(currentProfile.birthYear || '1945');
  const [passedYear, setPassedYear] = useState(currentProfile.passedYear || '2022');
  const [portraitUrl, setPortraitUrl] = useState(
    currentProfile.portraitUrl || '/avatar_RajeshBadePapa_clean.jpg'
  );

  // Audio voice tab state
  const [audioSourceTab, setAudioSourceTab] = useState<'MIC' | 'FILE' | 'DRIVE'>('MIC');
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(
    '/audio_samples/grandpa_authentic.wav'
  );
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioNotice, setAudioNotice] = useState<string>('Authentic elder audio sample loaded.');

  // Transcribed memory passage state
  const [memoryTitle, setMemoryTitle] = useState('First Digital Remembrance Recording (2019)');
  const [memoryYear, setMemoryYear] = useState('2019');
  const [memoryProvenance, setMemoryProvenance] = useState('First-Person Verified');
  const [memoryText, setMemoryText] = useState(
    'Keep your heart open to the small quiet things in the garden. When the afternoon breeze touches the wind chimes, remember how much joy we shared over tea.'
  );

  // Mandatory Ethical Consent Checkbox
  const [consentConfirmed, setConsentConfirmed] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleApplyPreset = (name: string, rel: string, bYear: string, pYear: string, img: string) => {
    setFullName(name);
    setRelationship(rel);
    setBirthYear(bYear);
    setPassedYear(pYear);
    setPortraitUrl(img);
  };

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPortraitUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setVoiceAudioUrl(reader.result as string);
      setAudioNotice(`✓ Voice reference audio loaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleSimulateRecording = () => {
    setIsRecording(true);
    setAudioNotice('Simulating 5-second elder voice recording...');
    setTimeout(() => {
      setIsRecording(false);
      setVoiceAudioUrl('/audio_samples/grandpa_authentic.wav');
      setAudioNotice('✓ Simulated voice reference captured (grandpa_authentic.wav)');
    }, 1500);
  };

  const handleSave = () => {
    if (!consentConfirmed) return;

    const updated: RepresentedPersonProfileData = {
      id: currentProfile.id || 'prof_anand_sharma_1945',
      fullName: fullName.trim() || 'Prof. Anand Sharma',
      relationship: relationship.trim() || 'Grandfather',
      birthYear,
      passedYear,
      portraitUrl,
      consentVersion: 'v2.2_custom_adult_consent_grant',
      isSynced: true,
    };

    const initialMem: CustomPersonaInitialMemory = {
      title: memoryTitle.trim() || 'First Digital Remembrance Recording (2019)',
      year: memoryYear,
      provenance: memoryProvenance,
      text: memoryText.trim(),
      audioClipUrl: voiceAudioUrl || '/audio_samples/grandpa_authentic.wav',
    };

    onSaveProfile(updated, initialMem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0f1118] border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-200">
        {/* MODAL HEADER */}
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141722]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Configure Custom Remembrance Persona
              </h2>
              <p className="text-xs text-slate-400">
                Upload portrait, voice clip, and verified memory passage for evidence-grounded talk-back.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close configuration modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="text-base" />
          </button>
        </header>

        {/* MODAL BODY */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          {/* QUICK SAMPLE PROFILES BAR */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Quick Sample Profiles for Testing:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'Dr. Maya Patel',
                    'Mother',
                    '1952',
                    '2021',
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
                  )
                }
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700"
              >
                Dr. Maya Patel (Mother)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'Robert Vance',
                    'Father',
                    '1940',
                    '2018',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
                  )
                }
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700"
              >
                Robert Vance (Father)
              </button>
            </div>
          </div>

          {/* BASIC PROFILE INFORMATION */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Prof. Anand Sharma"
                className="w-full bg-[#161924] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full bg-[#161924] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Grandfather">Grandfather</option>
                <option value="Grandmother">Grandmother</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Uncle / Bade Papa">Uncle / Bade Papa</option>
                <option value="Mentor / Elder">Mentor / Elder</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                  Birth Year
                </label>
                <input
                  type="text"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full bg-[#161924] border border-white/10 rounded-lg px-2 py-2 text-xs text-white font-mono text-center focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                  Passed Year
                </label>
                <input
                  type="text"
                  value={passedYear}
                  onChange={(e) => setPassedYear(e.target.value)}
                  className="w-full bg-[#161924] border border-white/10 rounded-lg px-2 py-2 text-xs text-white font-mono text-center focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* PORTRAIT PHOTOGRAPH LIKENESS */}
          <div className="bg-[#141722] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                🖼️ Portrait Photograph (Likeness)
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Presets:</span>
                <button
                  type="button"
                  onClick={() => setPortraitUrl('/avatar_RajeshBadePapa_clean.jpg')}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] hover:text-white"
                >
                  Portrait A
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPortraitUrl(
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] hover:text-white"
                >
                  Portrait B
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-500/50 bg-black shrink-0">
                <img src={portraitUrl} alt="Portrait" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition">
                  <UploadSimple className="text-sm" />
                  <span>Upload Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortraitUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  Recommended: clear frontal portrait with gentle natural lighting (512x512 square crop).
                </p>
              </div>
            </div>
          </div>

          {/* VOICE REFERENCE AUDIO */}
          <div className="bg-[#141722] border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                🔊 Voice Reference Audio (Talk-Back Voice)
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setAudioSourceTab('MIC')}
                  className={`px-2.5 py-1 rounded transition ${
                    audioSourceTab === 'MIC'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Microphone
                </button>
                <button
                  type="button"
                  onClick={() => setAudioSourceTab('FILE')}
                  className={`px-2.5 py-1 rounded transition ${
                    audioSourceTab === 'FILE'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Device File
                </button>
                <button
                  type="button"
                  onClick={() => setAudioSourceTab('DRIVE')}
                  className={`px-2.5 py-1 rounded transition ${
                    audioSourceTab === 'DRIVE'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Google Drive
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {audioSourceTab === 'MIC' && (
                <>
                  <button
                    type="button"
                    onClick={handleSimulateRecording}
                    disabled={isRecording}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Microphone className="text-sm" />
                    <span>{isRecording ? 'Recording...' : 'Start Recording Sample'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateRecording}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium border border-slate-700 transition"
                  >
                    ✨ Record Simulated Sample (5s)
                  </button>
                </>
              )}

              {audioSourceTab === 'FILE' && (
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition">
                  <UploadSimple className="text-sm" />
                  <span>Choose Audio File (.wav, .mp3, .m4a)</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              {audioSourceTab === 'DRIVE' && (
                <span className="text-xs text-amber-300 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-700/40">
                  Google Drive integration active via Simulated Google Workspace Vault.
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400">{audioNotice}</p>
          </div>

          {/* TRANSCRIBED MEMORY PASSAGE */}
          <div className="bg-[#141722] border border-white/10 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              📜 Transcribed Memory Passage (Chat Talk-Back Source)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Source Title / Context</label>
                <input
                  type="text"
                  value={memoryTitle}
                  onChange={(e) => setMemoryTitle(e.target.value)}
                  className="w-full bg-[#161924] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Estimated Year</label>
                <input
                  type="text"
                  value={memoryYear}
                  onChange={(e) => setMemoryYear(e.target.value)}
                  className="w-full bg-[#161924] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Provenance</label>
                <select
                  value={memoryProvenance}
                  onChange={(e) => setMemoryProvenance(e.target.value)}
                  className="w-full bg-[#161924] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="First-Person Verified">First-Person Verified</option>
                  <option value="Attributed Family Oral History">Attributed Oral History</option>
                  <option value="Written Journal Excerpt">Written Journal Excerpt</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Verbatim Passage (Spoken in chat when recalled):
              </label>
              <textarea
                value={memoryText}
                onChange={(e) => setMemoryText(e.target.value)}
                rows={3}
                className="w-full bg-[#161924] border border-white/10 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans resize-none"
              />
            </div>
          </div>

          {/* ADULT CONSENT & ETHICAL GOVERNANCE DECLARATION */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-600/40 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-amber-500 focus:ring-0"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-amber-300">Adult Consent &amp; Ethical Governance Declaration:</strong> I
                confirm that I am an adult (18+) with familial and ethical authority to configure this
                remembrance profile. I understand that ParamSathya enforces strict provenance: the persona
                will never invent memories, speak present-day advice, or claim afterlife consciousness.
              </span>
            </label>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 font-mono pl-6">
              <CheckCircle className="text-xs text-amber-400" />
              <span>Permission grant version: v2.2_custom_adult_consent_grant</span>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <footer className="px-6 py-3.5 border-t border-white/10 flex items-center justify-end gap-3 bg-[#141722]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!consentConfirmed}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-amber-500/20"
          >
            <CheckCircle className="text-sm" weight="bold" />
            <span>Activate Custom Persona</span>
          </button>
        </footer>
      </div>
    </div>
  );
};
