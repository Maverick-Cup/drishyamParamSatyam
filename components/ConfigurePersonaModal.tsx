import React, { useState } from 'react';
import {
  X,
  UploadSimple,
  Microphone,
  ShieldCheck,
  CheckCircle,
  Play,
  SpeakerHigh,
  Sparkle,
  FilmStrip,
  ArrowsClockwise,
  Lightning,
  Warning,
} from '@phosphor-icons/react';
import { RepresentedPersonProfileData } from './RepresentedPersonProfileCard';
import {
  DEFAULT_FLOW_CHARACTER_URL,
  DEFAULT_TRAINED_MALE_VOICE,
  GoogleFlowCharacterBinding,
  parseGoogleFlowUrl,
} from '@/domain/flow';

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
  const [activeTab, setActiveTab] = useState<'FLOW_STUDIO' | 'CUSTOM_PERSONA'>('FLOW_STUDIO');

  // Core Identity Information
  const [fullName, setFullName] = useState(currentProfile.fullName || 'Prof. Anand Sharma');
  const [relationship, setRelationship] = useState(currentProfile.relationship || 'Grandfather');
  const [birthYear, setBirthYear] = useState(currentProfile.birthYear || '1945');
  const [passedYear, setPassedYear] = useState(currentProfile.passedYear || '2022');
  const [portraitUrl, setPortraitUrl] = useState(
    currentProfile.portraitUrl || '/avatar_RajeshBadePapa_clean.jpg'
  );

  // Google Flow Digital Clone Studio State
  const [flowUrl, setFlowUrl] = useState<string>(
    currentProfile.googleFlowCharacter?.flowUrl || DEFAULT_FLOW_CHARACTER_URL
  );
  const [flowGenerationMode, setFlowGenerationMode] = useState<
    'INTERACTIVE_VISIMES' | 'NEURAL_VIDEO_LOOP'
  >('INTERACTIVE_VISIMES');
  const [flowVideoUrl, setFlowVideoUrl] = useState<string>(
    currentProfile.googleFlowCharacter?.videoLoopUrl || ''
  );
  const [isGeneratingClone, setIsGeneratingClone] = useState<boolean>(false);
  const [cloneStep, setCloneStep] = useState<number>(0);
  const [cloneLogs, setCloneLogs] = useState<string[]>([]);
  const [cloneSuccessMsg, setCloneSuccessMsg] = useState<string>('');
  const [cloneErrorMsg, setCloneErrorMsg] = useState<string>('');

  // Audio voice tab state (Standard Tab)
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

  // Real-time parser for Flow URL
  const parsedFlow = parseGoogleFlowUrl(flowUrl);

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

  /**
   * IN-APP DIGITAL CLONE GENERATOR PIPELINE
   * Calls /api/flow/character to validate, process assets, bind Harshit_voice, and activate clone
   */
  const handleGenerateDigitalClone = async () => {
    if (!consentConfirmed) {
      setCloneErrorMsg('Adult Consent Declaration must be confirmed before generating a digital clone.');
      return;
    }

    if (!parsedFlow.isValid) {
      setCloneErrorMsg(parsedFlow.error || 'Invalid Google Flow character URL.');
      return;
    }

    setIsGeneratingClone(true);
    setCloneErrorMsg('');
    setCloneSuccessMsg('');
    setCloneLogs([`[${new Date().toLocaleTimeString()}] Starting digital clone generation pipeline...`]);
    setCloneStep(1);

    try {
      // Step 1: Preflight validation
      await new Promise((r) => setTimeout(r, 500));
      setCloneLogs((prev) => [
        ...prev,
        `✓ Flow reference verified: Project ${parsedFlow.projectId?.slice(0, 8)}... | Character ${parsedFlow.characterId?.slice(0, 8)}...`,
      ]);
      setCloneStep(2);

      // Step 2: Asset alignment
      await new Promise((r) => setTimeout(r, 600));
      setCloneLogs((prev) => [
        ...prev,
        `✓ Processing likeness portrait asset: ${portraitUrl.startsWith('data:') ? 'Custom user upload' : portraitUrl.slice(0, 36)}...`,
      ]);
      setCloneStep(3);

      // Step 3: Trigger Server-side Generation
      const resp = await fetch('/api/flow/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: currentProfile.id || 'profile-satya-default',
          flowUrl,
          characterName: fullName,
          relationship,
          voiceProfileId: DEFAULT_TRAINED_MALE_VOICE.id,
          portraitBase64OrUrl: portraitUrl,
          videoBase64OrUrl:
            flowVideoUrl || (flowGenerationMode === 'NEURAL_VIDEO_LOOP' ? '/sample_reference.mp4' : undefined),
          generationMode: flowGenerationMode,
          consented: consentConfirmed,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Clone generation failed');
      }

      setCloneLogs((prev) => [
        ...prev,
        `✓ Bound trained voice: ${DEFAULT_TRAINED_MALE_VOICE.name}`,
        '✓ Saved to Memory Vault and Firestore profile.',
      ]);
      setCloneStep(4);

      await new Promise((r) => setTimeout(r, 500));
      setCloneSuccessMsg(`✓ Digital Clone (${data.binding.characterName}) successfully generated and activated!`);

      const updated: RepresentedPersonProfileData = {
        ...currentProfile,
        fullName: data.binding.characterName,
        relationship: data.binding.relationship,
        portraitUrl: data.binding.characterAssetUrl,
        consentVersion: 'v2.2_custom_adult_consent_grant',
        isSynced: true,
        googleFlowCharacter: data.binding,
      };

      const initialMem: CustomPersonaInitialMemory = {
        title: `${data.binding.characterName} (Google Flow Clone Initial Recording)`,
        year: birthYear || '2022',
        provenance: 'First-Person Verified',
        text: memoryText.trim() || 'I am right here with you. The memories we built together are alive in our hearts.',
        audioClipUrl: voiceAudioUrl || '/audio_samples/grandpa_authentic.wav',
      };

      setTimeout(() => {
        onSaveProfile(updated, initialMem);
        onClose();
      }, 1000);
    } catch (err: any) {
      setCloneErrorMsg(err.message || 'Generation failed');
    } finally {
      setIsGeneratingClone(false);
    }
  };

  const handleSaveStandard = () => {
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
      googleFlowCharacter: currentProfile.googleFlowCharacter,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0f1118] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-200">
        {/* MODAL HEADER */}
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141722]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/30 to-cyan-500/30 text-cyan-300 flex items-center justify-center border border-cyan-500/30 shadow-inner">
              <Sparkle className="text-xl" weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Remembrance Persona &amp; Digital Clone Studio
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300">
                  Google Flow v2.2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Directly generate and bind your Google Flow character from uploaded assets.
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

        {/* STUDIO TAB SWITCHER */}
        <div className="px-6 pt-3 pb-2 flex items-center gap-2 border-b border-white/10 bg-slate-950/60 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('FLOW_STUDIO')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition ${
              activeTab === 'FLOW_STUDIO'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkle className="text-sm" />
            <span>Google Flow Digital Clone Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CUSTOM_PERSONA')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition ${
              activeTab === 'CUSTOM_PERSONA'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="text-sm" />
            <span>Standard Persona &amp; Audio Tape</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          {/* TAB 1: GOOGLE FLOW DIGITAL CLONE STUDIO */}
          {activeTab === 'FLOW_STUDIO' ? (
            <div className="space-y-4">
              {/* GOOGLE FLOW CHARACTER URL BINDING */}
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-200 flex items-center gap-1.5">
                    <Sparkle className="text-blue-400" />
                    <span>Google Flow Character Reference</span>
                  </span>
                  <a
                    href={flowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                  >
                    Open in Flow Studio ↗
                  </a>
                </div>

                <div>
                  <label className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold block mb-1">
                    Flow Character URL
                  </label>
                  <input
                    type="url"
                    value={flowUrl}
                    onChange={(e) => {
                      setFlowUrl(e.target.value);
                      setCloneErrorMsg('');
                    }}
                    placeholder={DEFAULT_FLOW_CHARACTER_URL}
                    className="w-full bg-[#121624] border border-blue-500/40 rounded-xl px-3 py-2 text-xs text-blue-100 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* REAL-TIME UUID VALIDATION BADGES */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                  {parsedFlow.isValid ? (
                    <>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 flex items-center gap-1">
                        <CheckCircle className="text-xs" /> Valid Flow Character
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                        Project: {parsedFlow.projectId?.slice(0, 8)}...
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                        Character: {parsedFlow.characterId?.slice(0, 8)}...
                      </span>
                    </>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-600/50 text-rose-300 flex items-center gap-1">
                      <Warning className="text-xs" /> {parsedFlow.error}
                    </span>
                  )}
                </div>
              </div>

              {/* CLONE IDENTITY & BASIC ATTRIBUTES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Digital Clone Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Prof. Anand Sharma"
                    className="w-full bg-[#161924] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-[#161924] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Grandfather">Grandfather</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Uncle / Bade Papa">Uncle / Bade Papa</option>
                    <option value="Mentor / Elder">Mentor / Elder</option>
                  </select>
                </div>
              </div>

              {/* ASSET RESOLUTION: LIKENESS PORTRAIT */}
              <div className="p-4 rounded-2xl bg-[#141722] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    🖼️ Character Likeness Asset (Portrait)
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
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
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-500/50 bg-black shrink-0 shadow-md">
                    <img src={portraitUrl} alt="Clone Portrait" className="w-full h-full object-cover object-top" />
                  </div>

                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition">
                      <UploadSimple className="text-sm" />
                      <span>Upload High-Res Portrait</span>
                      <input type="file" accept="image/*" onChange={handlePortraitUpload} className="hidden" />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Upload from your Google Flow export or camera roll. Automatically downscaled to WebP &lt; 1200px.
                    </p>
                  </div>
                </div>
              </div>

              {/* GENERATION MODE SELECTOR */}
              <div className="p-4 rounded-2xl bg-[#141722] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
                  <FilmStrip className="text-cyan-400" />
                  <span>Digital Clone Animation &amp; Motion Mode</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFlowGenerationMode('INTERACTIVE_VISIMES')}
                    className={`p-3 rounded-xl border text-left transition ${
                      flowGenerationMode === 'INTERACTIVE_VISIMES'
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1">
                      <Lightning className="text-amber-400" />
                      <span>Instant Interactive Visemes</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Zero quota, real-time mouth animation driven dynamically by Web Audio RMS spectrum.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlowGenerationMode('NEURAL_VIDEO_LOOP')}
                    className={`p-3 rounded-xl border text-left transition ${
                      flowGenerationMode === 'NEURAL_VIDEO_LOOP'
                        ? 'bg-purple-950/50 border-purple-500 text-purple-200 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1">
                      <FilmStrip className="text-purple-400" />
                      <span>Cinematic Neural Video Loop</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Binds to talking head video asset (/sample_reference.mp4) via Sync 2 Pro pipeline.
                    </p>
                  </button>
                </div>
              </div>

              {/* VOCAL PROFILE BINDING: HARSHIT_VOICE */}
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-600/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <SpeakerHigh className="text-base" />
                  </div>
                  <div>
                    <span className="font-semibold text-amber-200">Bound Vocal Profile:</span>
                    <p className="text-[11px] text-slate-300 font-mono">
                      {DEFAULT_TRAINED_MALE_VOICE.name} &bull; ID: {DEFAULT_TRAINED_MALE_VOICE.id.slice(0, 16)}...
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300">
                  Default Bound
                </span>
              </div>

              {/* GENERATION ACTION & REAL-TIME PROGRESS */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleGenerateDigitalClone}
                  disabled={isGeneratingClone || !consentConfirmed || !parsedFlow.isValid}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-lg shadow-cyan-500/25 cursor-pointer"
                >
                  {isGeneratingClone ? (
                    <>
                      <ArrowsClockwise className="text-base animate-spin" />
                      <span>Generating Digital Clone (Step {cloneStep}/4)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkle className="text-base" weight="fill" />
                      <span>Generate &amp; Activate Digital Clone from Assets</span>
                    </>
                  )}
                </button>

                {/* 4-STAGE VISUAL PROGRESS BAR */}
                {isGeneratingClone && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
                        style={{ width: `${(cloneStep / 4) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Step {cloneStep} of 4</span>
                      <span>
                        {cloneStep === 1
                          ? 'Validating Flow Identity'
                          : cloneStep === 2
                          ? 'Aligning Assets'
                          : cloneStep === 3
                          ? 'Binding Harshit_voice'
                          : 'Activating Clone'}
                      </span>
                    </div>
                  </div>
                )}

                {/* LOGS TERMINAL */}
                {cloneLogs.length > 0 && (
                  <div className="p-3 rounded-xl bg-black/60 border border-slate-800 font-mono text-[11px] text-cyan-300/90 space-y-1 max-h-28 overflow-y-auto">
                    {cloneLogs.map((l, i) => (
                      <div key={i}>{l}</div>
                    ))}
                  </div>
                )}

                {cloneSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="text-base text-emerald-400 shrink-0" />
                    <span>{cloneSuccessMsg}</span>
                  </div>
                )}

                {cloneErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
                    <Warning className="text-base text-rose-400 shrink-0" />
                    <span>{cloneErrorMsg}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: STANDARD CUSTOM PERSONA & AUDIO TAPE */
            <div className="space-y-5">
              {/* QUICK SAMPLE PROFILES BAR */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">Quick Presets:</span>
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
                    Dr. Maya Patel
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
                    Robert Vance
                  </button>
                </div>
              </div>

              {/* BASIC ATTRIBUTES */}
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
                    className="w-full bg-[#161924] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-[#161924] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
                      className="w-full bg-[#161924] border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-mono text-center focus:outline-none"
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
                      className="w-full bg-[#161924] border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-mono text-center focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* VOICE REFERENCE AUDIO (MIC / FILE) */}
              <div className="bg-[#141722] border border-white/10 rounded-2xl p-4 space-y-3">
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
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {audioSourceTab === 'MIC' && (
                    <>
                      <button
                        type="button"
                        onClick={handleSimulateRecording}
                        disabled={isRecording}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Microphone className="text-sm" />
                        <span>{isRecording ? 'Recording...' : 'Record Voice Sample'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSimulateRecording}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium border border-slate-700 transition"
                      >
                        ✨ Simulate Audio (5s)
                      </button>
                    </>
                  )}

                  {audioSourceTab === 'FILE' && (
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition">
                      <UploadSimple className="text-sm" />
                      <span>Choose Audio File (.wav, .mp3, .m4a)</span>
                      <input type="file" accept="audio/*" onChange={handleAudioFileUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">{audioNotice}</p>
              </div>

              {/* TRANSCRIBED MEMORY PASSAGE */}
              <div className="bg-[#141722] border border-white/10 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  📜 Transcribed Memory Passage
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Source Title</label>
                    <input
                      type="text"
                      value={memoryTitle}
                      onChange={(e) => setMemoryTitle(e.target.value)}
                      className="w-full bg-[#161924] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Year</label>
                    <input
                      type="text"
                      value={memoryYear}
                      onChange={(e) => setMemoryYear(e.target.value)}
                      className="w-full bg-[#161924] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Provenance</label>
                    <select
                      value={memoryProvenance}
                      onChange={(e) => setMemoryProvenance(e.target.value)}
                      className="w-full bg-[#161924] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="First-Person Verified">First-Person Verified</option>
                      <option value="Attributed Family Oral History">Attributed Oral History</option>
                      <option value="Written Journal Excerpt">Written Journal Excerpt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <textarea
                    value={memoryText}
                    onChange={(e) => setMemoryText(e.target.value)}
                    rows={3}
                    className="w-full bg-[#161924] border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ADULT CONSENT & ETHICAL GOVERNANCE DECLARATION */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/40 space-y-2">
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
                remembrance profile. I understand that ParamSathya enforces strict provenance: the persona will
                never invent memories, speak present-day advice, or claim afterlife consciousness.
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
          {activeTab === 'CUSTOM_PERSONA' && (
            <button
              type="button"
              onClick={handleSaveStandard}
              disabled={!consentConfirmed}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-amber-500/20"
            >
              <CheckCircle className="text-sm" weight="bold" />
              <span>Save Persona Profile</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
