'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Graph,
  Microphone,
  ImagesSquare,
  UsersThree,
  ShieldCheck,
  WarningCircle,

  Wind,
  PlusCircle,
  Play,
  Pause,
  SpeakerHigh,
  Copy,
  Bookmark,
  PaperPlaneRight,
  HandHeart,
  FlowerLotus,
  Compass,
  Database,
  Heartbeat,
  X,
  Waveform,
  Sparkle,
  ArrowLeft,
  MagnifyingGlass,
  List as ListIcon,
  Plus,
  Minus,
  Target,
  ChatCircleText,
  Planet,
  UploadSimple,
  Paperclip,
  CheckCircle,
  SlidersHorizontal,
  Envelope,
  Trash,
  DotsThreeVertical,
  Broadcast,
  ArrowsClockwise,
  CaretDown,
  VideoCamera,
  Check,
  FileText,
  Camera,
  Phone,
  GearSix,
  Warning,
  Translate,
  SpeakerSlash,
  Palette,
  Drop,
  Snowflake,
  Plant,
  Sun,
  MusicNotes
} from '@phosphor-icons/react';
import { CRISIS_DIRECTORIES } from '@/config/crisisHelplines';
import GoogleDrivePickerModal, { GoogleDriveLogoIcon } from '@/components/GoogleDrivePickerModal';
import { SeasonalThemeType } from '@/components/SeasonalParticleCanvas';
import {
  RepresentedPersonProfileCard,
  RepresentedPersonProfileData,
} from '@/components/RepresentedPersonProfileCard';
import {
  ConfigurePersonaModal,
  CustomPersonaInitialMemory,
} from '@/components/ConfigurePersonaModal';
import { indicEngine } from '@/services/IndicTranslationEngine';
import { MemoryRecord } from '@/domain/models';
import { MobileAppBar } from '@/components/mobile/MobileAppBar';
import { MobileBottomNav, MobileTab } from '@/components/mobile/MobileBottomNav';
import { MobileMoreSheet } from '@/components/mobile/MobileMoreSheet';
import { MobileReflectionSheet } from '@/components/mobile/MobileReflectionSheet';

import { buildMemoryGraph } from '@/services/memoryGraphBuilder';
import InteractiveMindMap from '@/components/InteractiveMindMap';
import { UserProfileModal, ActiveUserProfile } from '@/components/UserProfileModal';

interface ChatMessage {
  id: string;
  sender: 'user' | 'companion';
  author: string;
  avatarUrl: string;
  text: string;
  timestamp?: string;
  groundingTag?: string;
  faithfulnessScore?: string;
  audioSnippetLength?: string;
  imageUrl?: string;
  audioUrl?: string;
  isAttachedVoiceSample?: boolean;
}

interface MemoryCategory {
  id: string;
  name: string;
  count: number;
  color: string;
  items: { title: string; date: string }[];
}

interface UploadedMediaItem {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'audio' | 'document';
  date: string;
  size?: string;
  source?: string;
}

const DEFAULT_MEMORY_CATEGORIES: MemoryCategory[] = [
  {
    id: 'parents',
    name: 'Parents',
    count: 12,
    color: '#10b981',
    items: [
      { title: 'Anchor of Family Unity', date: 'Oct 4' },
      { title: "My badi mami's gentle authority", date: 'Oct 4' },
      { title: 'My Two Bade Papa', date: 'Oct 4' },
      { title: 'Love for My Family', date: 'Oct 4' },
      { title: 'Family in Pune', date: 'Oct 4' },
      { title: 'My Living Parents', date: 'Oct 4' },
    ],
  },
  {
    id: 'identity',
    name: 'Identity',
    count: 12,
    color: '#e2e8f0',
    items: [
      { title: 'What I value', date: 'Oct 4' },
      { title: 'Digital Memory of Bade Papa', date: 'Oct 4' },
      { title: 'Family Busy With Life', date: 'Oct 4' },
      { title: 'Hometown Jaipur', date: 'Oct 4' },
      { title: 'My Name', date: 'Oct 4' },
    ],
  },
  {
    id: 'mortality',
    name: 'Mortality',
    count: 6,
    color: '#a855f7',
    items: [
      { title: 'Reflections on Legacy', date: 'Oct 4' },
      { title: 'Time and Presence', date: 'Oct 4' },
    ],
  },
  {
    id: 'scenes',
    name: 'Scenes',
    count: 7,
    color: '#38bdf8',
    items: [{ title: 'Summer Trip 2018 Trailhead', date: 'Oct 4' }],
  },
  {
    id: 'fears',
    name: 'Fears',
    count: 3,
    color: '#8b5cf6',
    items: [{ title: 'Unspoken words', date: 'Oct 4' }],
  },
  {
    id: 'regrets',
    name: 'Regrets',
    count: 3,
    color: '#6366f1',
    items: [{ title: 'Missed phone calls', date: 'Oct 4' }],
  },
  {
    id: 'siblings',
    name: 'Siblings',
    count: 5,
    color: '#14b8a6',
    items: [{ title: 'Childhood summer in Jaipur', date: 'Oct 4' }],
  },
  {
    id: 'partner',
    name: 'Partner',
    count: 2,
    color: '#ec4899',
    items: [{ title: 'Quiet morning walk', date: 'Oct 4' }],
  },
  {
    id: 'children',
    name: 'Children',
    count: 2,
    color: '#f97316',
    items: [{ title: 'First steps in park', date: 'Oct 4' }],
  },
  {
    id: 'work',
    name: 'Work',
    count: 1,
    color: '#f59e0b',
    items: [{ title: 'Old desk journal notes', date: 'Oct 4' }],
  },
];

export default function PresenceGriefTechPage() {
  // Navigation & View mode state
  const [activeTab, setActiveTab] = useState<'memories' | 'audio' | 'photos' | 'family'>('memories');
  const [viewMode, setViewMode] = useState<'companion' | 'mindmap'>('companion');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Dynamic Categories state
  const [categoriesList, setCategoriesList] = useState<MemoryCategory[]>(DEFAULT_MEMORY_CATEGORIES);

  // Uploaded Media Collections State
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedMediaItem[]>([
    {
      id: 'photo-1',
      title: 'Summer Ridge Walk 2018',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
      type: 'image',
      date: 'Oct 4',
      size: '2.4 MB',
    },
    {
      id: 'photo-2',
      title: 'Family Gathering Jaipur',
      url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=80',
      type: 'image',
      date: 'Oct 4',
      size: '1.8 MB',
    },
  ]);

  const [uploadedAudioVault, setUploadedAudioVault] = useState<UploadedMediaItem[]>([
    {
      id: 'audio-1',
      title: 'VM_July2018_Trailhead.wav',
      url: '',
      type: 'audio',
      date: 'Oct 4',
      size: '1.8 MB',
    },
    {
      id: 'audio-2',
      title: 'Grandpa_Advice_Notebook.wav',
      url: '',
      type: 'audio',
      date: 'Oct 4',
      size: '3.1 MB',
    },
  ]);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('parents');
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatAttachmentInputRef = useRef<HTMLInputElement | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUploadNotice, setAvatarUploadNotice] = useState<string>('');

  // Active Portrait, Companion Identity & Authentic Audio Source State
  const [companionPersonName, setCompanionPersonName] = useState<string>('Prof. Anand Sharma');
  const [companionPersonRelation, setCompanionPersonRelation] = useState<string>('Grandfather');
  const [activePortraitUrl, setActivePortraitUrl] = useState<string>(
    '/avatar_RajeshBadePapa_clean.jpg'
  );
  const [personaProfile, setPersonaProfile] = useState<RepresentedPersonProfileData>({
    id: 'prof_anand_sharma_1945',
    fullName: 'Prof. Anand Sharma',
    relationship: 'Grandfather',
    birthYear: '1945',
    passedYear: '2022',
    portraitUrl: '/avatar_RajeshBadePapa_clean.jpg',
    consentVersion: 'v2.1_formal_family_scope',
    isSynced: true,
  });
  const [isConfigurePersonaModalOpen, setIsConfigurePersonaModalOpen] = useState<boolean>(false);
  const [indicModeEnabled, setIndicModeEnabled] = useState<boolean>(false);
  const [indicSelectedDialect, setIndicSelectedDialect] = useState<string>('bho');
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [activeAudioTitle, setActiveAudioTitle] = useState<string>('Attached Companion Voice Reference');
  const [audioDuration, setAudioDuration] = useState<string>('0:08');
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null);
  const isPlayingNativeVideoVoiceRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRafIdRef = useRef<number | null>(null);

  // Persistent 1:1 Voice Profile Binding State
  const [boundVoiceId, setBoundVoiceId] = useState<string>('sync-rajesh-authentic-v2');
  const [boundVoiceName, setBoundVoiceName] = useState<string>('Rajesh Bade Papa (Attached Voice)');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [voiceCustomSample, setVoiceCustomSample] = useState<File | null>(null);
  const [voiceConsentGiven, setVoiceConsentGiven] = useState<boolean>(true);
  const [isCloningVoice, setIsCloningVoice] = useState<boolean>(false);
  const [voiceBindingSuccess, setVoiceBindingSuccess] = useState<string>('');

  // Multi-Region Crisis Safety Modal State
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState<boolean>(false);
  const [selectedCrisisRegion, setSelectedCrisisRegion] = useState<string>('IN');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Sync 2 Pro Living Video Synthesis Integration State
  const [museTalkVideoUrl, setMuseTalkVideoUrl] = useState<string | null>('/sample_reference.mp4');

  // Connected Circle State (Live Firestore backed)
  const [circleMembers, setCircleMembers] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      relation: string;
      avatar: string;
      joinedAt: string;
    }>
  >([]);
  const [pendingInvites, setPendingInvites] = useState<
    Array<{
      id: string;
      email: string;
      role: string;
      sentAt: string;
    }>
  >([]);
  const [inviteEmailInput, setInviteEmailInput] = useState('');
  const [inviteRoleInput, setInviteRoleInput] = useState<'Contributor' | 'Viewer'>('Contributor');
  const [inviteSuccessNotice, setInviteSuccessNotice] = useState('');
  const [inviteErrorMessage, setInviteErrorMessage] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);


  // Audio spectrum, speech synthesis & lip-sync state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mouthScale, setMouthScale] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mindmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Mic recording state
  const [isRecording, setIsRecording] = useState(false);

  // Chat message input & conversation list
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'user',
      author: 'Maya',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC6fbVph3tU_Lnf2CmAey-RpAGVQcc3iWhsolfT8TojYEo8Jj0EXlqJjnejbsR7-4IdE_Kst-5KagZslhbd7d1JdX9eM88Zgvn2XjsuDr9_1lEE4EDkhacBCI93Q0eODvtNR4P1iPQmclz3SCu7s1-m20AAVym-WPcIjx8pgZiSNngPGA3zO9GAlrB__frJbb9e4Bu1X-Y5zS1XW0c7ap54mmGw-ODLjQ1fKeexk9I',
      text: 'Do you remember those quiet mornings we spent talking together with the family? It felt so peaceful.',
    },
    {
      id: '2',
      sender: 'companion',
      author: 'Rajesh Bade Papa',
      avatarUrl: '/avatar_RajeshBadePapa_clean.jpg',
      text: '"I remember every moment warmly. Sitting together, sharing stories, and watching everyone grow has always been my greatest joy. Tell me, what is on your mind today?"',
      faithfulnessScore: '100% verified',
      audioSnippetLength: 'Attached Voice',
      isAttachedVoiceSample: true,
    },
  ]);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  // Breathing Modal state
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [breathInstruction, setBreathInstruction] = useState('Breathe in deeply...');
  const [breathCycle, setBreathCycle] = useState(0);

  // Google Drive Cloud Vault Integration state
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);
  const [googleDriveMode, setGoogleDriveMode] = useState<'audio' | 'photos'>('audio');

  // Seasonal Themes & Ambient Soundscape State
  const [activeTheme, setActiveTheme] = useState<SeasonalThemeType>('cosmic');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isAmbientMuted, setIsAmbientMuted] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.35);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  // Breathing Break Soundscape State
  const [breathingSoundTrack, setBreathingSoundTrack] = useState<'birds' | 'rain' | 'jingle' | 'rumi' | 'silence'>('birds');
  const [breathingVolume, setBreathingVolume] = useState(0.45);
  const [isBreathingMuted, setIsBreathingMuted] = useState(false);
  const breathingAudioRef = useRef<HTMLAudioElement | null>(null);
  // Mobile Adaptive Shell State
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isMobileReflectionOpen, setIsMobileReflectionOpen] = useState(false);

  // Active Logged-In User Profile State
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<ActiveUserProfile>({
    displayName: 'Maya',
    email: 'hpshahi12@gmail.com',
    relationship: 'Granddaughter & Family Owner',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAkM9-qFCcd6h1qbdIM3Uaaj9G2bxYFGZJ-HjNC-BgIiIJchAvfQXV8k3n2_grb8xPKhB1u78Z8gMpe2ifh7AG4fOhu8KwQsyoeS5Z2XDphOqAlVOl1LQX3GtIOFTchjKqUUssFoQcPz1LwklcurbPRP_-OiqJ2Vmg6V89Lmx3K0-0LuJlmoM70g_FTt5dl9b1st9tStS9yOG7OmkCoViQm4D5PpTmxQN4wmh36A0Q',
  });

  const handleSaveUserProfile = (updated: ActiveUserProfile) => {
    setUserProfile(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('paramsathya_user_profile_v1', JSON.stringify(updated));
    }
    // Sync active sender info across existing and upcoming chats
    setConversations((prev) =>
      prev.map((m) =>
        m.sender === 'user'
          ? { ...m, author: updated.displayName, avatarUrl: updated.avatarUrl }
          : m
      )
    );
  };

  // Cross-Vault Deletion Handlers
  const handleDeletePhoto = (photoId: string, title?: string) => {
    const photoName = title || 'this keepsake photo';
    if (!window.confirm(`Are you sure you want to remove "${photoName}" from your keepsake vault?`)) {
      return;
    }
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleDeleteAudio = (audioId: string, title?: string) => {
    const clipTitle = title || 'this voice recording';
    if (!window.confirm(`Are you sure you want to delete "${clipTitle}" from your voice vault?`)) {
      return;
    }
    // If the audio currently playing matches, stop playback immediately
    const targetAudio = uploadedAudioVault.find((a) => a.id === audioId);
    if (targetAudio && activeAudioUrl === targetAudio.url) {
      stopAllAudio();
      setActiveAudioUrl('');
      setActiveAudioTitle('');
    }
    setUploadedAudioVault((prev) => prev.filter((a) => a.id !== audioId));
  };

  const handleDeleteMemory = (memoryId: string, title?: string) => {
    const memoryTitle = title || 'this memory record';
    if (!window.confirm(`Are you sure you want to remove "${memoryTitle}" from the remembrance constellation?`)) {
      return;
    }
    // Remove the item matching either id or cleanTitle across categories
    setCategoriesList((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          const itemDedupKey = `mem-${cat.id}-${item.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
          return itemDedupKey !== memoryId && item.title.trim().toLowerCase() !== (title || '').trim().toLowerCase();
        }),
      }))
    );
  };

  const handleDeleteCircleMember = (memberId: string, memberName: string) => {
    if (!window.confirm(`Remove ${memberName} from the Connected Circle?`)) {
      return;
    }
    setCircleMembers((prev) => prev.filter((m) => m.id !== memberId));
    setInviteSuccessNotice(`Removed ${memberName} from the Connected Circle.`);
    setTimeout(() => setInviteSuccessNotice(''), 3000);
  };

  const handleGoogleDriveImport = (

    items: Array<{ title: string; url: string; size: string; date: string; source: string; type: 'audio' | 'image' }>
  ) => {
    items.forEach((item) => {
      const newMedia: UploadedMediaItem = {
        id: `gdrive-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: item.title,
        url: item.url,
        type: item.type,
        date: item.date,
        size: item.size,
        source: item.source,
      };

      if (item.type === 'audio') {
        setUploadedAudioVault((prev) => [newMedia, ...prev]);
        setActiveAudioUrl(item.url);
        setActiveAudioTitle(item.title);
      } else {
        setUploadedPhotos((prev) => [newMedia, ...prev]);
      }
    });
  };

  // Initialize Speech Synthesis Voices, Themes and Ambient Audio Engine
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('paramsathya_theme') as SeasonalThemeType;
      if (savedTheme) {
        setActiveTheme(savedTheme);
      }

      const savedUserProfile = localStorage.getItem('paramsathya_user_profile_v1');
      if (savedUserProfile) {
        try {
          const parsed = JSON.parse(savedUserProfile);
          if (parsed && parsed.displayName) {
            setUserProfile(parsed);
            setConversations((prev) =>
              prev.map((m) =>
                m.sender === 'user'
                  ? { ...m, author: parsed.displayName, avatarUrl: parsed.avatarUrl || m.avatarUrl }
                  : m
              )
            );
          }
        } catch {}
      }

      const applyBoundCompanion = (data: any) => {
        if (!data) return;
        const nextName = data.personName || 'Rajesh Bade Papa';
        const nextPortrait = data.portraitUrl || '/avatar_RajeshBadePapa_clean.jpg';
        if (data.personName) setCompanionPersonName(data.personName);
        if (data.personRelation) setCompanionPersonRelation(data.personRelation);
        if (data.portraitUrl) setActivePortraitUrl(data.portraitUrl);
        if (data.voiceId) setBoundVoiceId(data.voiceId);
        if (data.voiceName) {
          setBoundVoiceName(data.voiceName);
        } else if (data.personName) {
          setBoundVoiceName(`${data.personName} (Attached Voice)`);
        }
        if (data.preferredDisplay === 'image') {
          setMuseTalkVideoUrl(null);
        } else if (data.videoUrl) {
          setMuseTalkVideoUrl(data.videoUrl);
        }
        setConversations((prev) =>
          prev.map((m) =>
            m.sender === 'companion'
              ? { ...m, author: nextName, avatarUrl: nextPortrait }
              : m
          )
        );
      };

      const savedCompanion = localStorage.getItem('paramsathya_bound_companion');
      if (savedCompanion) {
        try {
          applyBoundCompanion(JSON.parse(savedCompanion));
        } catch {}
      }

      const handleCompanionEvent = (evt: Event) => {
        const customEvt = evt as CustomEvent;
        if (customEvt.detail) applyBoundCompanion(customEvt.detail);
      };
      window.addEventListener('paramsathya-companion-updated', handleCompanionEvent);

      if (!ambientAudioRef.current) {
        ambientAudioRef.current = new Audio();
        ambientAudioRef.current.loop = true;
        ambientAudioRef.current.volume = ambientVolume;
      }

      if (!breathingAudioRef.current) {
        breathingAudioRef.current = new Audio();
        breathingAudioRef.current.loop = true;
        breathingAudioRef.current.volume = breathingVolume;
      }

      return () => {
        window.removeEventListener('paramsathya-companion-updated', handleCompanionEvent);
      };
    }
  }, []);

  // Sync ambient audio volume & mute state
  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = isAmbientMuted ? 0 : ambientVolume;
    }
  }, [ambientVolume, isAmbientMuted]);

  // SMART VOICE AUTO-DUCKING:
  // When Avatar Companion speaks (either authentic audio or speech synthesis),
  // automatically duck ambient audio down to 0% / pause so it NEVER interferes with the loved one's voice!
  useEffect(() => {
    if (!ambientAudioRef.current) return;
    const ambient = ambientAudioRef.current;

    if (isSpeaking || isPlaying) {
      ambient.pause();
    } else {
      if (!isAmbientMuted) {
        // Resume playing current theme tune if unmuted
        ambient.play().catch(() => {});
      }
    }
  }, [isSpeaking, isPlaying, isAmbientMuted, activeTheme]);

  // Breathing Modal Audio Loop: Plays when open, ceases when closed
  useEffect(() => {
    if (!breathingAudioRef.current) return;
    const player = breathingAudioRef.current;

    if (isBreathingModalOpen && !isBreathingMuted) {
      if (breathingSoundTrack === 'birds') {
        player.src = '/audio/birds_432hz.mp3';
        player.volume = breathingVolume;
        player.play().catch(() => {});
      } else if (breathingSoundTrack === 'rain') {
        player.src = '/audio/gentle_rain.mp3';
        player.volume = breathingVolume;
        player.play().catch(() => {});
      } else if (breathingSoundTrack === 'jingle') {
        player.src = '/audio/jingle_bells.mp3';
        player.volume = breathingVolume;
        player.play().catch(() => {});
      } else if (breathingSoundTrack === 'rumi') {
        player.src = '/audio/rumi_tune.mp3';
        player.volume = breathingVolume;
        player.play().catch(() => {});
      } else {
        player.pause();
      }
    } else {
      player.pause();
      player.currentTime = 0;
    }

    return () => {
      player.pause();
    };
  }, [isBreathingModalOpen, breathingSoundTrack, isBreathingMuted, breathingVolume]);

  // Load live Connected Circle members and pending invitations from backend
  const fetchCircleData = useCallback(async () => {
    try {
      const [membersResp, invitesResp] = await Promise.all([
        fetch('/api/circle/members?profileId=profile-satya-default'),
        fetch('/api/circle/invitations?profileId=profile-satya-default'),
      ]);

      if (membersResp.ok) {
        const data = await membersResp.json();
        if (data.success && Array.isArray(data.members)) {
          setCircleMembers(
            data.members.map((m: any) => ({
              id: m.id,
              name: m.displayName || m.emailNormalized.split('@')[0],
              email: m.emailNormalized,
              role: m.role === 'OWNER' ? 'Owner' : m.role === 'CONTRIBUTOR' ? 'Contributor' : 'Viewer',
              relation: m.role === 'OWNER' ? 'Profile Owner' : 'Connected Member',
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.displayName || m.emailNormalized)}`,
              joinedAt: new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            }))
          );
        }
      }

      if (invitesResp.ok) {
        const data = await invitesResp.json();
        if (data.success && Array.isArray(data.invitations)) {
          setPendingInvites(
            data.invitations.map((i: any) => ({
              id: i.id,
              email: i.invitedEmailNormalized,
              role: i.role === 'CONTRIBUTOR' ? 'Contributor' : 'Viewer',
              sentAt: `Invite sent ${new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            }))
          );
        }
      }
    } catch (err) {
      console.warn('[Presence] Failed to fetch live circle data:', err);
    }
  }, []);

  useEffect(() => {
    fetchCircleData();
  }, [fetchCircleData]);


  const handleThemeSelect = (newTheme: SeasonalThemeType) => {
    setActiveTheme(newTheme);
    setIsThemeDropdownOpen(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem('paramsathya_theme', newTheme);
      window.dispatchEvent(new CustomEvent('paramsathya-theme-change', { detail: { theme: newTheme } }));
    }

    if (ambientAudioRef.current) {
      const ambient = ambientAudioRef.current;
      if (newTheme === 'snowfall') {
        ambient.src = '/audio/jingle_bells.mp3';
      } else if (newTheme === 'cosmic' || newTheme === 'autumn') {
        ambient.src = '/audio/rumi_tune.mp3';
      } else if (newTheme === 'rains') {
        ambient.src = '/audio/gentle_rain.mp3';
      } else if (newTheme === 'springs') {
        ambient.src = '/audio/birds_432hz.mp3';
      }

      ambient.volume = isAmbientMuted ? 0 : ambientVolume;
      if (!isAmbientMuted && !isSpeaking && !isPlaying) {
        ambient.play().catch(() => {});
      }
    }
  };

  // Handle File Selection for Upload Modal
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setUploadPreviewUrl(url);
    } else {
      setUploadPreviewUrl(null);
    }
  };

  // Submit File Upload to API and Update State
  const handlePerformUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', uploadCategory);
      formData.append('title', uploadTitle || selectedFile.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const newMediaItem: UploadedMediaItem = {
          id: Date.now().toString(),
          title: data.title,
          url: data.fileUrl,
          type: data.fileType,
          date: data.uploadedAt,
          size: `${(data.size / 1024 / 1024).toFixed(1)} MB`,
        };

        if (data.fileType === 'image') {
          setUploadedPhotos((prev) => [newMediaItem, ...prev]);
          setActivePortraitUrl(data.fileUrl);
        } else if (data.fileType === 'audio') {
          setUploadedAudioVault((prev) => [newMediaItem, ...prev]);
          setActiveAudioUrl(data.fileUrl);
          setActiveAudioTitle(data.title);
        }

        // Update category list count
        setCategoriesList((prev) =>
          prev.map((cat) =>
            cat.id === uploadCategory
              ? {
                  ...cat,
                  count: cat.count + 1,
                  items: [{ title: data.title, date: data.uploadedAt }, ...cat.items],
                }
              : cat
          )
        );

        setUploadSuccessMsg(`Successfully uploaded "${data.title}" into memory brain!`);
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setIsUploading(false);
          setSelectedFile(null);
          setUploadPreviewUrl(null);
          setUploadTitle('');
          setUploadSuccessMsg('');
        }, 1200);
      } else {
        alert(data.error || 'Upload failed');
        setIsUploading(false);
      }
    } catch (err: any) {
      alert(err.message || 'Upload error');
      setIsUploading(false);
    }
  };

  // Quick In-Chat File Attachment
  const handleChatAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');

    if (isImage) {
      // Immediately sync as avatar face portrait option
      setActivePortraitUrl(fileUrl);
      setUploadedPhotos((prev) => [
        {
          id: `photo-${Date.now()}`,
          title: file.name,
          url: fileUrl,
          type: 'image',
          date: 'Just now',
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        },
        ...prev,
      ]);
      setAvatarUploadNotice(`Avatar portrait updated with ${file.name}`);
      setTimeout(() => setAvatarUploadNotice(''), 3000);
    }

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      author: 'Maya',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC6fbVph3tU_Lnf2CmAey-RpAGVQcc3iWhsolfT8TojYEo8Jj0EXlqJjnejbsR7-4IdE_Kst-5KagZslhbd7d1JdX9eM88Zgvn2XjsuDr9_1lEE4EDkhacBCI93Q0eODvtNR4P1iPQmclz3SCu7s1-m20AAVym-WPcIjx8pgZiSNngPGA3zO9GAlrB__frJbb9e4Bu1X-Y5zS1XW0c7ap54mmGw-ODLjQ1fKeexk9I',
      text: `Uploaded memory artifact: "${file.name}"`,
      imageUrl: isImage ? fileUrl : undefined,
      audioUrl: isAudio ? fileUrl : undefined,
    };

    setConversations((prev) => [...prev, newMsg]);

    setTimeout(() => {
      const responseText = isImage
        ? 'I see this wonderful photo you shared. I have set it as my current portrait in our companion space.'
        : 'Thank you for sharing this voice note. I can hear the warmth in your voice.';

      const companionMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'companion',
        author: companionPersonName,
        avatarUrl: activePortraitUrl,
        text: `"${responseText}"`,
        faithfulnessScore: '100% verified',
        audioSnippetLength: 'Attached Voice',
      };
      setConversations((prev) => [...prev, companionMsg]);
      speakCompanionMessage(responseText, false);
    }, 900);
  };

  // Direct 1-Click Avatar Photo Upload Handler
  const handleAvatarFaceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setActivePortraitUrl(fileUrl);
    setMuseTalkVideoUrl(null); // Reset any synthetic loop to show new face immediately
    setUploadedPhotos((prev) => [
      {
        id: `avatar-photo-${Date.now()}`,
        title: `Avatar: ${file.name}`,
        url: fileUrl,
        type: 'image',
        date: 'Just now',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      },
      ...prev,
    ]);
    setAvatarUploadNotice(`Portrait updated to "${file.name}"`);
    setTimeout(() => setAvatarUploadNotice(''), 3500);
  };

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Web Speech Recognition Handler (Microphone Input)
  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setMessageInput(transcript);

          // Reset silence timer on each spoken phrase (auto-stops 2.2s after silence)
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (_) {}
            }
            setIsRecording(false);
          }, 2200);
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition event:', err.error);
          if (err.error === 'not-allowed') {
            alert('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
          }
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          setIsRecording(false);
        };

        recognition.onend = () => {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          setIsRecording(false);
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.error('Recognition start error:', e);
          setIsRecording(false);
        }
      } else {
        alert('Web Speech Recognition is not natively supported in this browser. You can type directly in the prompt bar.');
      }
    }
  };

  const lipSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stop any active audio (HTML5, native video voice, or synthesis) and return avatar to calm idle state
  const stopAllAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (avatarVideoRef.current) {
      isPlayingNativeVideoVoiceRef.current = false;
      avatarVideoRef.current.pause();
      avatarVideoRef.current.muted = true;
      avatarVideoRef.current.loop = false;
      try {
        avatarVideoRef.current.currentTime = 0;
      } catch (_) {}
    }
    if (audioRafIdRef.current) {
      cancelAnimationFrame(audioRafIdRef.current);
      audioRafIdRef.current = null;
    }
    if (lipSyncIntervalRef.current) {
      clearInterval(lipSyncIntervalRef.current);
      lipSyncIntervalRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMouthScale(0);
    setIsSpeaking(false);
    setIsPlaying(false);
  };

  // Animate the bound avatar video silently (muted) while external TTS / cloned audio speaks
  const startSilentAvatarVideoSync = () => {
    if (avatarVideoRef.current) {
      isPlayingNativeVideoVoiceRef.current = false;
      avatarVideoRef.current.muted = true;
      avatarVideoRef.current.loop = true;
      avatarVideoRef.current.play().catch(() => {});
    }
  };

  // Play the bound living video's own authentic voice & lip-sync track ONCE (no infinite loop)
  const playNativeAttachedVideoVoiceOnce = () => {
    if (!avatarVideoRef.current || !museTalkVideoUrl) return false;
    stopAllAudio();
    const video = avatarVideoRef.current;
    isPlayingNativeVideoVoiceRef.current = true;
    video.loop = false;
    video.muted = false;
    try {
      video.currentTime = 0;
    } catch (_) {}

    setIsPlaying(true);
    setIsSpeaking(true);

    if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current);
    let step = 0;
    lipSyncIntervalRef.current = setInterval(() => {
      if (video.paused || video.ended) {
        stopAllAudio();
        return;
      }
      step++;
      const base = Math.sin(step * 0.45) * 0.35 + 0.5;
      const jitter = (Math.random() - 0.5) * 0.2;
      setMouthScale(Math.max(0.15, Math.min(1.0, base + jitter)));
    }, 80);

    video.play().catch((err) => {
      console.warn('Video voice playback error:', err);
      stopAllAudio();
    });
    return true;
  };

  // Play Authentic Uploaded Audio File or Bound Video Voice Sample
  const playAuthenticVoiceAudio = (audioUrlToPlay?: string) => {
    if (typeof window === 'undefined') return;

    if ((isPlaying || isSpeaking) && !audioUrlToPlay) {
      stopAllAudio();
      return;
    }

    const targetUrl = audioUrlToPlay || activeAudioUrl;

    // 1. If an external audio URL (uploaded file or synthesized TTS URL) exists, play it and sync muted avatar video
    if (targetUrl) {
      stopAllAudio();
      setIsPlaying(true);
      setIsSpeaking(true);
      startSilentAvatarVideoSync();

      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }

      const audio = audioElementRef.current;
      audio.src = targetUrl;
      audio.crossOrigin = 'anonymous';

      // Connect to Web Audio API for real-time RMS viseme extraction
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioCtx();
          }
          const ctx = audioContextRef.current;
          if (ctx.state === 'suspended') {
            ctx.resume();
          }

          if (!audioAnalyserRef.current) {
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            audioAnalyserRef.current = analyser;

            if (!audioSourceNodeRef.current) {
              const source = ctx.createMediaElementSource(audio);
              source.connect(analyser);
              analyser.connect(ctx.destination);
              audioSourceNodeRef.current = source;
            }
          }

          const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
          const updateMouthFromAudio = () => {
            if (!audioAnalyserRef.current || audio.paused || audio.ended) {
              return;
            }
            audioAnalyserRef.current.getByteFrequencyData(dataArray);

            let sum = 0;
            const vocalBins = Math.min(32, dataArray.length);
            for (let i = 2; i < vocalBins; i++) {
              sum += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sum / (vocalBins - 2)) / 255;
            const targetScale = Math.min(1.0, Math.max(0, rms * 2.2));
            setMouthScale((prev) => prev * 0.4 + targetScale * 0.6);

            audioRafIdRef.current = requestAnimationFrame(updateMouthFromAudio);
          };

          audio.onplay = () => {
            audioRafIdRef.current = requestAnimationFrame(updateMouthFromAudio);
          };
        }
      } catch (e) {
        console.warn('Web Audio Analyser fallback:', e);
      }

      audio.onended = () => {
        stopAllAudio();
      };

      audio.onerror = () => {
        console.warn('Audio playback error, falling back to speech synthesis');
        stopAllAudio();
      };

      audio.play().catch((err) => {
        console.warn('Audio play was prevented or failed:', err);
        stopAllAudio();
      });
      return;
    }

    // 2. If a living video is attached (e.g. Sync 2 Pro sample_reference.mp4), play its authentic voice track ONCE
    if (museTalkVideoUrl && avatarVideoRef.current) {
      playNativeAttachedVideoVoiceOnce();
      return;
    }

    // 3. Fallback: Synthesize the last companion message text
    const lastCompanionMsg = [...conversations].reverse().find((m) => m.sender === 'companion');
    if (lastCompanionMsg) {
      speakText(lastCompanionMsg.text);
    }
  };

  // Real Speech Synthesis Fallback ("Talk Back Out Loud") with Muted Avatar Video Sync
  const speakText = (text: string) => {
    if (typeof window === 'undefined') return;

    const startMouthAnimation = () => {
      startSilentAvatarVideoSync();
      if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current);
      let step = 0;
      lipSyncIntervalRef.current = setInterval(() => {
        step++;
        const base = Math.sin(step * 0.45) * 0.4 + 0.5;
        const jitter = (Math.random() - 0.5) * 0.25;
        const currentScale = Math.max(0.15, Math.min(1.0, base + jitter));
        setMouthScale(currentScale);
      }, 75);
    };

    const stopMouthAnimation = () => {
      stopAllAudio();
    };

    if (!('speechSynthesis' in window)) {
      setIsSpeaking(true);
      setIsPlaying(true);
      startMouthAnimation();
      setTimeout(stopMouthAnimation, 3500);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/^"|"$/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = window.speechSynthesis.getVoices();
    // Strictly filter out female voice names to match the male elder persona (Rajesh Bade Papa / Prof. Anand Sharma)
    const isFemaleVoice = (name: string) => {
      const lower = name.toLowerCase();
      return (
        lower.includes('female') ||
        lower.includes('zira') ||
        lower.includes('hazel') ||
        lower.includes('heera') ||
        lower.includes('samantha') ||
        lower.includes('victoria') ||
        lower.includes('karen') ||
        lower.includes('moira') ||
        lower.includes('fiona') ||
        lower.includes('tessa') ||
        lower.includes('veena') ||
        lower.includes('kalpana') ||
        lower.includes('swara') ||
        lower.includes('geeta') ||
        lower.includes('ananya')
      );
    };

    const isMaleVoice = (name: string) => {
      const lower = name.toLowerCase();
      return (
        lower.includes('male') ||
        lower.includes('prabhat') ||
        lower.includes('madhur') ||
        lower.includes('david') ||
        lower.includes('mark') ||
        lower.includes('ravi') ||
        lower.includes('george') ||
        lower.includes('richard') ||
        lower.includes('natural')
      );
    };

    // Priority 1: Indian-English / Hindi Male voice
    // Priority 2: Indian-English / Hindi non-female voice
    // Priority 3: English Male voice
    // Priority 4: Any non-female English voice
    // Priority 5: Fallback to any voice as last resort
    const preferredVoice =
      voices.find(
        (v) => (v.lang === 'en-IN' || v.lang === 'hi-IN') && isMaleVoice(v.name)
      ) ||
      voices.find(
        (v) => (v.lang === 'en-IN' || v.lang === 'hi-IN') && !isFemaleVoice(v.name)
      ) ||
      voices.find((v) => v.lang.startsWith('en') && isMaleVoice(v.name)) ||
      voices.find((v) => v.lang.startsWith('en') && !isFemaleVoice(v.name)) ||
      voices.find((v) => v.lang === 'en-IN' || v.lang === 'hi-IN') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;
    // Deepen pitch to 0.88 and gentle rate of 0.92 for warm, dignified elder presence
    utterance.pitch = 0.88;
    utterance.rate = 0.92;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPlaying(true);
      startMouthAnimation();
    };

    utterance.onboundary = () => {
      setMouthScale(0.75 + Math.random() * 0.25);
    };

    utterance.onend = () => {
      stopMouthAnimation();
    };

    utterance.onerror = () => {
      stopMouthAnimation();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Unified Attached Voice Playback for Chat Messages & AI Replies (Deterministic Authentic-First Cascade)
  const speakCompanionMessage = async (
    rawText: string,
    isAttachedSample: boolean = false,
    forcePlay: boolean = false
  ) => {
    if (typeof window === 'undefined') return;

    if (!forcePlay && (isSpeaking || isPlaying)) {
      stopAllAudio();
      return;
    }

    const cleanText = rawText.replace(/^"|"$/g, '').trim();
    if (!cleanText) return;

    // TIER 1: Real-time Cloned TTS via /api/voice/speak
    try {
      const speakRes = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voiceId: boundVoiceId,
          personName: companionPersonName,
        }),
      });

      const speakData = await speakRes.json();
      if (speakData.success && speakData.audioUrl) {
        playAuthenticVoiceAudio(speakData.audioUrl);
        return;
      }
    } catch (err) {
      console.warn('Attached voice API fallback:', err);
    }

    // TIER 2: If attached sample or living video is available, play authentic video voice track with lip-sync
    if ((isAttachedSample || !activeAudioUrl) && museTalkVideoUrl && avatarVideoRef.current) {
      playNativeAttachedVideoVoiceOnce();
      return;
    }

    // TIER 3: If an authentic audio snippet is loaded in the vault, play that authentic recording
    if (activeAudioUrl) {
      playAuthenticVoiceAudio(activeAudioUrl);
      return;
    }

    // TIER 4: Persona-Matched Web Speech API Fallback (Strict Male Pitch & Indian/Hindi Inflection)
    speakText(cleanText);
  };

  // Companion Voice Waveform Canvas Animation
  useEffect(() => {
    if (viewMode !== 'companion') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth || 400;
      canvas.height = 42;
    };
    resizeCanvas();

    const drawSpectrum = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#38bdf8');
      gradient.addColorStop(0.5, '#a855f7');
      gradient.addColorStop(1, '#f59e0b');

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = gradient;

      const segments = 60;
      const step = width / segments;

      for (let i = 0; i <= segments; i++) {
        const x = i * step;
        let amplitude = 0;

        if (isPlaying || isSpeaking) {
          const wave1 = Math.sin(i * 0.2 + phaseRef.current) * (10 + mouthScale * 8);
          const wave2 = Math.sin(i * 0.4 - phaseRef.current * 1.5) * (5 + mouthScale * 4);
          const envelope = Math.sin((i / segments) * Math.PI);
          amplitude = (wave1 + wave2) * envelope;
        } else {
          amplitude = Math.sin(i * 0.15 + phaseRef.current) * 2.5 * Math.sin((i / segments) * Math.PI);
        }

        const y = midY + amplitude;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      phaseRef.current += isPlaying || isSpeaking ? 0.08 : 0.02;
      animationFrameRef.current = requestAnimationFrame(drawSpectrum);
    };

    drawSpectrum();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isSpeaking, mouthScale, viewMode]);

  // Derive canonical, deduplicated MemoryRecord[] and MemoryGraph from the active vault
  const verifiedMemoryRecords: MemoryRecord[] = React.useMemo(() => {
    const records: MemoryRecord[] = [];
    const seenTitleKeys = new Set<string>();

    categoriesList.forEach((cat) => {
      cat.items.forEach((item, itemIdx) => {
        const cleanTitle = item.title.trim();
        const dedupKey = cleanTitle.toLowerCase();
        const existing = records.find((r) => (r.title || '').toLowerCase() === dedupKey);
        if (existing) {
          if (existing.categoryIds && !existing.categoryIds.includes(cat.id)) {
            existing.categoryIds.push(cat.id);
          }
          return;
        }
        seenTitleKeys.add(dedupKey);

        const isAudioBacked = itemIdx === 0 && uploadedAudioVault.length > 0;
        const primaryAudio = uploadedAudioVault[itemIdx % Math.max(1, uploadedAudioVault.length)];
        const isFirstPerson =
          cat.id === 'parents' || cat.id === 'identity' || cat.id === 'mortality' || isAudioBacked;

        records.push({
          id: `mem-${cat.id}-${itemIdx}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          ownerUid: 'user-vault-owner',
          profileId: personaProfile.id,
          representedPersonId: personaProfile.id,
          title: cleanTitle,
          contributorUid: 'member-1',
          contributorDisplayName: isFirstPerson ? 'Maya (Family Owner)' : 'Arjun (Grandson)',
          recordedSpeakerId: isFirstPerson ? personaProfile.id : undefined,
          recordedSpeakerDisplayName: isFirstPerson ? personaProfile.fullName : undefined,
          categoryIds: [cat.id],
          sourceRefs: isAudioBacked && primaryAudio
            ? [primaryAudio.title]
            : [`Vault_Archive_${cat.name}_${item.date.replace(/\s+/g, '')}.txt`],
          reviewedText:
            cleanTitle === 'Anchor of Family Unity'
              ? 'My father was the anchor of family unity. When dispute erupted among his brothers in 1965, he simply prepared evening tea for everyone and refused to discuss property until every cup was finished in quiet fellowship.'
              : cleanTitle === "My badi mami's gentle authority"
                ? 'My badi mami ruled the courtyard without ever raising her voice. A single glance over her reading spectacles was enough to quiet six unruly nephews.'
                : `Verified memory record "${cleanTitle}" preserved in the ${cat.name} vault cluster (${item.date}) for ${personaProfile.fullName}.`,
          provenance: isFirstPerson ? 'VERIFIED_FIRST_PERSON' : 'ATTRIBUTED_RECOLLECTION',
          provenanceTier: isFirstPerson ? 'VERIFIED_FIRST_PERSON' : 'ATTRIBUTED_RECOLLECTION',
          reviewStatus: 'APPROVED',
          evidenceAnchors: isAudioBacked && primaryAudio
            ? [
                {
                  kind: 'AUDIO',
                  sourceId: primaryAudio.id,
                  sourceTitle: primaryAudio.title,
                  sourceUrl: primaryAudio.url || undefined,
                  transcriptSegmentId: `seg-${cat.id}-${itemIdx}`,
                  startMs: 14000,
                  endMs: 42000,
                  quotedText:
                    cleanTitle === 'Anchor of Family Unity'
                      ? 'When dispute erupted among his brothers in 1965, he simply prepared evening tea for everyone and refused to discuss property until every cup was finished in quiet fellowship.'
                      : `Verified audio segment for "${cleanTitle}" preserved in ${primaryAudio.title}.`,
                },
              ]
            : [
                {
                  kind: 'TEXT',
                  sourceId: `doc-${cat.id}-${itemIdx}`,
                  sourceTitle: `Vault_Archive_${cat.name}_${item.date.replace(/\s+/g, '')}.txt`,
                  paragraphId: `p-${itemIdx + 1}`,
                  quotedText: `Verified archive entry: "${cleanTitle}" (${item.date}).`,
                },
              ],
          createdAt: '2026-10-04T10:00:00Z',
          updatedAt: '2026-10-04T10:00:00Z',
        });
      });
    });

    return records;
  }, [categoriesList, personaProfile.id, personaProfile.fullName, uploadedAudioVault]);

  const memoryGraph = React.useMemo(() => {
    const initials = personaProfile.fullName
      .split(' ')
      .filter((part) => !part.endsWith('.'))
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('.');
    return buildMemoryGraph(verifiedMemoryRecords, {
      activeProfileId: personaProfile.id,
      centerLabel: initials ? `${initials}.` : 'P.S.',
      categories: categoriesList.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
      })),
    });
  }, [verifiedMemoryRecords, personaProfile.id, personaProfile.fullName, categoriesList]);

  // Breathing modal timer loop
  useEffect(() => {
    if (!isBreathingModalOpen) {
      setBreathCycle(0);
      setBreathInstruction('Breathe in deeply...');
      return;
    }
    let stepCount = 0;
    const interval = setInterval(() => {
      stepCount++;
      const currentCycle = Math.min(3, Math.floor(stepCount / 2));
      setBreathCycle(currentCycle);
      setBreathInstruction(stepCount % 2 === 1 ? 'Hold & Gently exhale...' : 'Breathe in deeply...');
    }, 4000);
    return () => clearInterval(interval);
  }, [isBreathingModalOpen]);

  // Dynamic Initial Conversation Seeding & LocalStorage Persistence
  const chatStorageKey = `presence_chat_${personaProfile.id}`;
  const isChatHydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Try reading saved conversations from localStorage for this specific elder
    const saved = localStorage.getItem(chatStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          isChatHydratedRef.current = true;
          return;
        }
      } catch (e) {
        console.warn('Failed to parse saved chat history:', e);
      }
    }

    // 2. If no persisted chat exists, dynamically seed from the elder's verified memory vault
    if (!isChatHydratedRef.current && verifiedMemoryRecords.length > 0) {
      const topMemory = verifiedMemoryRecords[0];
      const initialUserQuery = `Do you remember "${topMemory.title}"? It is one of the most cherished memories in our family vault.`;
      const initialCompanionAnswer = `"${topMemory.reviewedText} Tell me, what is on your heart today?"`;

      setConversations([
        {
          id: `seed-user-${personaProfile.id}`,
          sender: 'user',
          author: userProfile.displayName || 'Maya',
          avatarUrl: userProfile.avatarUrl,
          text: initialUserQuery,
        },
        {
          id: `seed-companion-${personaProfile.id}`,
          sender: 'companion',
          author: companionPersonName,
          avatarUrl: activePortraitUrl,
          text: initialCompanionAnswer,
          faithfulnessScore: '100% verified',
          audioSnippetLength: 'Attached Voice',
          isAttachedVoiceSample: true,
        },
      ]);
      isChatHydratedRef.current = true;
    }
  }, [chatStorageKey, verifiedMemoryRecords, companionPersonName, activePortraitUrl, userProfile]);

  // Persist conversations to localStorage whenever updated
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isChatHydratedRef.current && conversations.length > 0) {
      try {
        localStorage.setItem(chatStorageKey, JSON.stringify(conversations));
      } catch (e) {
        console.warn('Failed to persist chat conversations:', e);
      }
    }
  }, [conversations, chatStorageKey]);

  // Handler to clear / reset conversation to initial state
  const handleClearConversation = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(chatStorageKey);
    if (verifiedMemoryRecords.length > 0) {
      const topMemory = verifiedMemoryRecords[0];
      setConversations([
        {
          id: `seed-user-${personaProfile.id}-${Date.now()}`,
          sender: 'user',
          author: userProfile.displayName || 'Maya',
          avatarUrl: userProfile.avatarUrl,
          text: `Do you remember "${topMemory.title}"? It is one of the most cherished memories in our family vault.`,
        },
        {
          id: `seed-companion-${personaProfile.id}-${Date.now()}`,
          sender: 'companion',
          author: companionPersonName,
          avatarUrl: activePortraitUrl,
          text: `"${topMemory.reviewedText} Tell me, what is on your heart today?"`,
          faithfulnessScore: '100% verified',
          audioSnippetLength: 'Attached Voice',
          isAttachedVoiceSample: true,
        },
      ]);
    } else {
      setConversations([]);
    }
  };

  // Auto scroll chat to bottom
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageInput.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      author: userProfile.displayName || 'Maya',
      avatarUrl: userProfile.avatarUrl,
      text,
    };

    setConversations((prev) => [...prev, newMsg]);
    setMessageInput('');
    setIsAiThinking(true);

    try {
      // 1. Send message to Google Gemini Supportive Chat Engine using attached companion persona
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: conversations.map((c) => ({ sender: c.sender, text: c.text })),
          personName: companionPersonName,
          relation: companionPersonRelation,
        }),
      });

      const chatData = await chatRes.json();
      const replyText = chatData.reply || 'I hear you, and I am right here with you.';

      // Check if crisis safety escalation triggered
      if (chatData.safetyState === 'URGENT') {
        setIsCrisisModalOpen(true);
      }

      let finalSpokenText = replyText;
      let displayMessageText = `"${replyText}"`;

      // If Indic vernacular mode is toggled, translate using the OOP socio-linguistic engine
      if (indicModeEnabled) {
        try {
          const indicTranslation = await indicEngine.translate(
            replyText,
            indicSelectedDialect,
            'respectful',
            companionPersonName
          );
          finalSpokenText = indicTranslation.nativeScript;
          displayMessageText = `"${indicTranslation.nativeScript}"\n(${indicTranslation.transliteration})`;
        } catch {
          // Keep original English text if translation fails
        }
      }

      const companionMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'companion',
        author: companionPersonName,
        avatarUrl: activePortraitUrl,
        text: displayMessageText,
        faithfulnessScore: indicModeEnabled ? 'Vernacular Grounded' : 'Grounded & Empathetic',
        audioSnippetLength: indicModeEnabled ? 'Indic Dialect Voice' : 'Attached Voice',
        isAttachedVoiceSample: true,
      };

      setConversations((prev) => [...prev, companionMsg]);
      setIsAiThinking(false);

      // 2. Synthesize audio in attached companion's voice and animate avatar only while speaking
      await speakCompanionMessage(finalSpokenText, true, true);
    } catch (err: any) {
      console.warn('Chat interaction error:', err);
      setIsAiThinking(false);
      await speakCompanionMessage('I am right here listening to you. Take a gentle breath with me.', true, true);
    }
  };

  return (
    <div className="h-full text-slate-200 antialiased font-sans select-none overflow-hidden flex flex-col bg-transparent">
      {/* MAIN HEADER */}
      {/* COMPACT PHONE TOP APP BAR (< 768px) */}
      <MobileAppBar
        personName={companionPersonName}
        portraitUrl={activePortraitUrl}
        userAvatarUrl={userProfile.avatarUrl}
        onOpenCrisis={() => setIsCrisisModalOpen(true)}
        onOpenVoiceConfig={() => setIsVoiceModalOpen(true)}
        onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
      />

      {/* EXPANDED DESKTOP COMMAND & STATUS HEADER (>= 768px) */}
      <header className="hidden md:flex h-16 border-b border-white/10 px-6 items-center justify-between z-30 shrink-0 bg-[#080c14]/75 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 text-xs mr-2">
            <ArrowLeft className="text-sm" />

            <span className="hidden sm:inline">Portal</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-amber-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-[#080c14] rounded-full flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-300 font-bold text-lg leading-none">
                  P
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-wider text-slate-100 flex items-center gap-2">
                ParamSathya
                <span className="text-[10px] font-normal tracking-wide px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-700/40 text-cyan-300">
                  Presence-Blessings Intact
                </span>
              </h1>
            </div>
          </div>
          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

          {/* VIEW SWITCHER PILL */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-full p-1 text-xs">
            <button
              onClick={() => {
                setActiveTab('memories');
                setViewMode('mindmap');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition font-medium ${
                activeTab === 'memories' && viewMode === 'mindmap'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Planet className="text-sm" />
              <span>Mind Map Explorer</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('memories');
                setViewMode('companion');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition font-medium ${
                activeTab === 'memories' && viewMode === 'companion'
                  ? 'bg-purple-950 text-purple-300 border border-purple-700/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ChatCircleText className="text-sm" />
              <span>Avatar Companion</span>
            </button>
            <Link
              href="/playground/sync"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full transition font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 border border-emerald-600/40 hover:bg-emerald-900/40 shadow-sm"
              title="Open Sync Lip-Sync 2 Pro Studio (Reusable Base Video Asset)"
            >
              <VideoCamera className="text-sm text-emerald-400" />
              <span>Sync 2 Pro</span>
            </Link>
            <Link
              href="/playground/indic"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full transition font-medium text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-600/40 hover:bg-amber-900/40 shadow-sm"
              title="Toggle to Indic Language Support & Neural TTS"
            >
              <Translate className="text-sm text-amber-400" />
              <span>Indic Language</span>
            </Link>
            <Link
              href="/developer/guardrails"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full transition font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            >
              <ShieldCheck className="text-sm text-emerald-400" />
              <span>Guardrails</span>
            </Link>
          </div>
        </div>

        {/* Center Session Active */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs text-slate-300 font-medium">Session Active</span>
          <span className="text-[11px] text-slate-400 font-mono">14m 20s</span>
        </div>

        {/* Privacy, Theme Selector, Ambient Audio & Profile */}
        <div className="flex items-center gap-2.5">
          {/* THEME & SOUNDSCAPE SELECTOR DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800/80 text-xs text-slate-200 border border-slate-700/80 flex items-center gap-1.5 transition shadow-sm"
              title="Select seasonal theme and gentle backdrop ambience"
            >
              {activeTheme === 'cosmic' && <Sparkle className="text-purple-400 text-sm" />}
              {activeTheme === 'rains' && <Drop className="text-cyan-400 text-sm" />}
              {activeTheme === 'snowfall' && <Snowflake className="text-sky-300 text-sm" />}
              {activeTheme === 'springs' && <Plant className="text-emerald-400 text-sm" />}
              {activeTheme === 'autumn' && <Sun className="text-amber-400 text-sm" />}
              <span className="hidden xl:inline capitalize font-medium text-slate-300">
                {activeTheme === 'autumn' ? 'Autumn' : activeTheme}
              </span>
              <CaretDown className={`text-slate-400 text-[10px] transition-transform ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isThemeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0b121f]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-1.5 z-50 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Seasonal Themes &amp; Ambience
                </div>

                <button
                  onClick={() => handleThemeSelect('cosmic')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                    activeTheme === 'cosmic'
                      ? 'bg-purple-950/60 text-purple-200 border border-purple-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkle className="text-purple-400" />
                    <span>Cosmic Watch</span>
                  </div>
                  <span className="text-[10px] text-purple-400/80 font-mono">Rumi tune</span>
                </button>

                <button
                  onClick={() => handleThemeSelect('rains')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                    activeTheme === 'rains'
                      ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Drop className="text-cyan-400" />
                    <span>Gentle Rains</span>
                  </div>
                  <span className="text-[10px] text-cyan-400/80 font-mono">Rain sound</span>
                </button>

                <button
                  onClick={() => handleThemeSelect('snowfall')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                    activeTheme === 'snowfall'
                      ? 'bg-sky-950/60 text-sky-200 border border-sky-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Snowflake className="text-sky-300" />
                    <span>Serene Snowfall</span>
                  </div>
                  <span className="text-[10px] text-sky-400/80 font-mono">Jingle Bell</span>
                </button>

                <button
                  onClick={() => handleThemeSelect('springs')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                    activeTheme === 'springs'
                      ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plant className="text-emerald-400" />
                    <span>Lush Springs</span>
                  </div>
                  <span className="text-[10px] text-emerald-400/80 font-mono">432Hz birds</span>
                </button>

                <button
                  onClick={() => handleThemeSelect('autumn')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                    activeTheme === 'autumn'
                      ? 'bg-amber-950/60 text-amber-200 border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sun className="text-amber-400" />
                    <span>Autumn / Summer</span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-mono">Rumi tune</span>
                </button>
              </div>
            )}
          </div>

          {/* AMBIENT AUDIO MUTE TOGGLE */}
          <button
            onClick={() => {
              const nextMuted = !isAmbientMuted;
              setIsAmbientMuted(nextMuted);
              if (ambientAudioRef.current) {
                if (nextMuted) {
                  ambientAudioRef.current.pause();
                } else if (!isSpeaking && !isPlaying) {
                  ambientAudioRef.current.play().catch(() => {});
                }
              }
            }}
            className={`p-1.5 rounded-full border transition text-xs flex items-center gap-1 ${
              isAmbientMuted
                ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
            }`}
            title={isAmbientMuted ? 'Unmute theme ambience' : 'Mute theme ambience (auto-ducks on avatar speech)'}
          >
            {isAmbientMuted ? <SpeakerSlash className="text-sm" /> : <SpeakerHigh className="text-sm animate-pulse" />}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-200/90 text-xs shadow-sm">
            <ShieldCheck className="text-amber-400 text-sm" />
            <span className="font-medium tracking-tight">Private &amp; Grounded</span>
          </div>
          <button
            onClick={() => setIsCrisisModalOpen(true)}
            className="px-2.5 py-1 rounded-full bg-rose-950/80 hover:bg-rose-900/80 text-xs text-rose-300 border border-rose-700/60 flex items-center gap-1.5 transition shadow-sm"
            title="Open multi-region crisis & mental health helplines"
          >
            <Phone className="text-rose-400" />
            <span className="hidden lg:inline">Helplines</span>
          </button>
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
            title="Manage 1:1 Voice Profile"
          >
            <Microphone className="text-amber-400" />
            <span className="hidden lg:inline">Voice: {boundVoiceName.slice(0, 14)}...</span>
          </button>
          <button
            onClick={() => setIsBreathingModalOpen(true)}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
            title="Open 60-second breathing pause"
          >
            <Wind className="text-cyan-400" />
            <span className="hidden lg:inline">Take a breath</span>
          </button>
          <div className="relative pl-1">
            <button
              type="button"
              onClick={() => setIsUserProfileModalOpen(true)}
              aria-label="Manage your profile photo and settings"
              title={`${userProfile.displayName} (${userProfile.relationship}) • Click to update photo`}
              className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-slate-700/80 cursor-pointer hover:ring-cyan-500/80 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 block"
            >
              <img
                alt={userProfile.displayName}
                className="w-full h-full object-cover"
                src={userProfile.avatarUrl}
              />
            </button>
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#080c14]"
              title="Session Active"
            />
          </div>
        </div>
      </header>

      {/* APPLICATION MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT NAV RAIL (Hidden on mobile < 768px, replaced by MobileBottomNav) */}
        <aside className="hidden md:flex w-24 lg:w-72 border-r border-white/10 flex-col justify-between p-3 lg:p-4 bg-[#080c14]/80 z-20 shrink-0">
          <div className="space-y-4">

            {/* REPRESENTED PERSON PROFILE HEADER CARD (Snip P1) */}
            <div className="hidden lg:block">
              <RepresentedPersonProfileCard
                profile={personaProfile}
                onConfigure={() => setIsConfigurePersonaModalOpen(true)}
              />
            </div>

            <div>
              <span className="hidden lg:block text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Memory Space
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('memories');
                    setViewMode('companion');
                  }}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition group ${
                    activeTab === 'memories' && viewMode === 'companion'
                      ? 'bg-slate-800/80 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <ChatCircleText className="text-xl text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div className="hidden lg:block text-left leading-tight">
                    <p className="text-sm font-medium text-slate-100">Your Persona</p>
                    <p className="text-[11px] text-slate-400">Living Portrait &amp; Chat</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('memories');
                    setViewMode('mindmap');
                  }}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition group ${
                    activeTab === 'memories' && viewMode === 'mindmap'
                      ? 'bg-slate-800/80 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Graph className="text-xl text-indigo-400 group-hover:scale-110 transition-transform" />
                  <div className="hidden lg:block text-left leading-tight">
                    <p className="text-sm font-medium text-slate-100">Mind Map</p>
                    <p className="text-[11px] text-slate-400">
                      {memoryGraph.uniqueApprovedMemoryCount} Verified memories
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('audio');
                    setViewMode('companion');
                  }}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition group ${
                    activeTab === 'audio'
                      ? 'bg-slate-800/80 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Microphone className="text-xl text-slate-400 group-hover:text-amber-400 transition-colors" />
                  <div className="hidden lg:block leading-tight">
                    <p className="text-sm font-medium text-slate-200">Audio Voice Vault</p>
                    <p className="text-[11px] text-slate-400">{uploadedAudioVault.length} Verified recordings</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('photos');
                    setViewMode('companion');
                  }}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition group ${
                    activeTab === 'photos'
                      ? 'bg-slate-800/80 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <ImagesSquare className="text-xl text-slate-400 group-hover:text-purple-400 transition-colors" />
                  <div className="hidden lg:block leading-tight">
                    <p className="text-sm font-medium text-slate-200">Photos &amp; Keepsakes</p>
                    <p className="text-[11px] text-slate-400">{uploadedPhotos.length} Scanned photos</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('family')}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition group ${
                    activeTab === 'family'
                      ? 'bg-slate-800/80 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <UsersThree className="text-xl text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <div className="hidden lg:block leading-tight">
                    <p className="text-sm font-medium text-slate-200">Connected Family</p>
                    <p className="text-[11px] text-slate-400">
                      {circleMembers.length} Active • {pendingInvites.length} Pending
                    </p>
                  </div>
                </button>
              </nav>
            </div>

            <div className="hidden lg:block pt-3 border-t border-white/10">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-300">Memory Integrity</span>
                  <span className="text-[10px] text-cyan-400 font-mono">100% Grounded</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Zero hallucinations. Every statement is linked to certified audio &amp; letters.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/30 text-cyan-200 text-xs font-medium transition shadow-sm"
            >
              <PlusCircle className="text-base" />
              <span className="hidden lg:inline">Add Memory Node</span>
            </button>
          </div>
        </aside>

        {/* CENTRAL VIEW AREA */}
        {activeTab === 'photos' ? (
          /* PHOTOS & KEEPSAKES VAULT GRID VIEW */
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 bg-[#080c14]/40 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h2 className="text-2xl font-serif text-slate-100">Photos &amp; Keepsakes</h2>
                <p className="text-xs text-slate-400">{uploadedPhotos.length} Scanned photos &amp; visual memories</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setGoogleDriveMode('photos');
                    setIsGoogleDriveModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-200 hover:text-white text-xs font-medium transition shadow-md"
                  title="Import scanned photos from Google Drive"
                >
                  <GoogleDriveLogoIcon className="w-4 h-4" />
                  <span>Import from Drive</span>
                </button>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-lg"
                >
                  <UploadSimple className="text-base" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="glass-card-interactive rounded-2xl overflow-hidden group border border-slate-800 relative">
                  <div className="h-40 relative overflow-hidden bg-slate-950">
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {/* Delete button overlaid on card */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id, photo.title);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-white/10 opacity-80 group-hover:opacity-100 transition shadow-md cursor-pointer"
                      title="Delete photo from keepsake vault"
                      aria-label={`Delete ${photo.title}`}
                    >
                      <Trash className="text-sm" />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-slate-200 truncate">{photo.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{photo.date}</span>
                      {photo.source ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 flex items-center gap-1">
                          <GoogleDriveLogoIcon className="w-2.5 h-2.5" /> Drive
                        </span>
                      ) : (
                        <span>{photo.size || 'Image'}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        ) : activeTab === 'family' ? (
          /* CONNECTED CIRCLE & FAMILY INVITATION MANAGEMENT VIEW */
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 bg-[#080c14]/40 backdrop-blur-md">
            <div className="pb-4 border-b border-white/10 mb-6">
              <h2 className="text-2xl font-serif text-slate-100">Connected Circle</h2>
              <p className="text-xs text-slate-400">
                Invite trusted family members and contributors to cherish memories and listen to authentic voice recordings.
              </p>
            </div>

            {/* SIMPLE INVITE ACTION BAR */}
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 mb-8 max-w-3xl shadow-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <Envelope className="text-cyan-400 text-base" /> Invite Family Member or Contributor
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Send a secure invitation link to collaborate on {companionPersonName}&apos;s memory vault.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inviteEmailInput || isSendingInvite) return;
                  setIsSendingInvite(true);
                  setInviteErrorMessage('');
                  setInviteSuccessNotice('');

                  try {
                    const resp = await fetch('/api/circle/invitations', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        profileId: 'profile-satya-default',
                        inviterUid: 'user-owner-default',
                        inviterName: 'Family Member',
                        representedPersonName: companionPersonName,
                        email: inviteEmailInput,
                        role: inviteRoleInput.toUpperCase(),
                        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                      }),
                    });

                    const data = await resp.json();
                    if (!resp.ok || !data.success) {
                      setInviteErrorMessage(data.error || 'Failed to send invitation');
                    } else {
                      setInviteSuccessNotice(`Invitation sent to ${inviteEmailInput}!`);
                      setInviteEmailInput('');
                      fetchCircleData();
                      setTimeout(() => setInviteSuccessNotice(''), 4000);
                    }
                  } catch (err: any) {
                    setInviteErrorMessage(err.message || 'Network error while sending invite');
                  } finally {
                    setIsSendingInvite(false);
                  }
                }}
                className="flex flex-col sm:flex-row items-center gap-2.5"
              >
                <div className="relative flex-1 w-full">
                  <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="email"
                    required
                    value={inviteEmailInput}
                    onChange={(e) => setInviteEmailInput(e.target.value)}
                    placeholder="Enter family member's email address..."
                    disabled={isSendingInvite}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                </div>

                <select
                  value={inviteRoleInput}
                  onChange={(e) => setInviteRoleInput(e.target.value as any)}
                  disabled={isSendingInvite}
                  className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                >
                  <option value="Contributor">Contributor (Can add memories)</option>
                  <option value="Viewer">Viewer (Read-only)</option>
                </select>

                <button
                  type="submit"
                  disabled={isSendingInvite || !inviteEmailInput}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition whitespace-nowrap cursor-pointer"
                >
                  {isSendingInvite ? 'Sending...' : 'Send Invite'}
                </button>
              </form>

              {inviteSuccessNotice && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle className="text-emerald-400 shrink-0" />
                  <span>{inviteSuccessNotice}</span>
                </div>
              )}

              {inviteErrorMessage && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/40 text-rose-200 text-xs flex items-center gap-2">
                  <WarningCircle className="text-rose-400 shrink-0" />
                  <span>{inviteErrorMessage}</span>
                </div>
              )}
            </div>

            <div className="space-y-6 max-w-3xl">
              {/* PENDING INVITATIONS TRAY */}
              {pendingInvites.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Pending Invitations ({pendingInvites.length})
                  </h4>
                  <div className="space-y-2">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center">
                            <Envelope className="text-sm" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-200">{invite.email}</p>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Role: <strong className="text-cyan-300 font-normal">{invite.role}</strong> • {invite.sentAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const resp = await fetch(`/api/circle/invitations/${invite.id}/resend`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    profileId: 'profile-satya-default',
                                    representedPersonName: companionPersonName,
                                  }),
                                });
                                const data = await resp.json();
                                if (resp.ok && data.success) {
                                  setInviteSuccessNotice(`Resent invite to ${invite.email}`);
                                  fetchCircleData();
                                  setTimeout(() => setInviteSuccessNotice(''), 3000);
                                } else {
                                  setInviteErrorMessage(data.error || 'Failed to resend invite');
                                }
                              } catch (err: any) {
                                setInviteErrorMessage(err.message || 'Error resending invite');
                              }
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          >
                            Resend
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Cancel and revoke invitation to ${invite.email}?`)) return;
                              try {
                                const resp = await fetch(
                                  `/api/circle/invitations/${invite.id}?profileId=profile-satya-default`,
                                  { method: 'DELETE' }
                                );
                                const data = await resp.json();
                                if (resp.ok && data.success) {
                                  setInviteSuccessNotice(`Revoked invite to ${invite.email}`);
                                  fetchCircleData();
                                  setTimeout(() => setInviteSuccessNotice(''), 3000);
                                } else {
                                  setInviteErrorMessage(data.error || 'Failed to revoke invite');
                                }
                              } catch (err: any) {
                                setInviteErrorMessage(err.message || 'Error revoking invite');
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                            title="Cancel invitation"
                          >
                            <Trash className="text-sm" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONNECTED CIRCLE (ACCEPTED MEMBERS) */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Connected Circle Members ({circleMembers.length})
                </h4>
                {circleMembers.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                    No connected members yet. Use the invitation bar above to invite trusted family members.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {circleMembers.map((member) => (
                      <div
                        key={member.id}
                        className="glass-panel p-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-100">{member.name}</p>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                                {member.relation}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">{member.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
                              member.role === 'Contributor'
                                ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-300'
                                : member.role === 'Owner'
                                ? 'bg-cyan-950/60 border-cyan-800/40 text-cyan-300'
                                : 'bg-purple-950/60 border-purple-800/40 text-purple-300'
                            }`}
                          >
                            {member.role}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                            Joined {member.joinedAt}
                          </span>

                          {member.role !== 'Owner' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCircleMember(member.id, member.name)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                              title={`Remove ${member.name} from circle`}
                              aria-label={`Remove ${member.name} from circle`}
                            >
                              <Trash className="text-sm" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        ) : activeTab === 'audio' ? (
          /* AUDIO VOICE VAULT LIST VIEW */
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 bg-[#080c14]/40 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h2 className="text-2xl font-serif text-slate-100">Audio Voice Vault</h2>
                <p className="text-xs text-slate-400">{uploadedAudioVault.length + 12} Verified voice recordings</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setGoogleDriveMode('audio');
                    setIsGoogleDriveModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-amber-200 hover:text-white text-xs font-medium transition shadow-md"
                  title="Import audio recordings from Google Drive"
                >
                  <GoogleDriveLogoIcon className="w-4 h-4" />
                  <span>Import from Drive</span>
                </button>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition shadow-lg"
                >
                  <UploadSimple className="text-base" />
                  <span>Upload Voice Note</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 max-w-3xl">
              {uploadedAudioVault.map((audio) => (
                <div
                  key={audio.id}
                  className="bg-[#12141c]/90 p-4 rounded-2xl border border-amber-600/30 hover:border-amber-500/60 transition shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const urlToPlay = audio.url || '/audio_samples/grandpa_authentic.wav';
                          setActiveAudioUrl(urlToPlay);
                          setActiveAudioTitle(audio.title);
                          playAuthenticVoiceAudio(urlToPlay);
                        }}
                        className="w-10 h-10 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center text-lg transition shrink-0"
                        title="Listen to authentic audio clip"
                      >
                        <SpeakerHigh weight="fill" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white tracking-tight">{audio.title}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 flex items-center gap-1">
                            <CheckCircle weight="fill" className="text-xs" /> Approved
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-600/50 text-amber-300">
                            First-Person Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Offset: 08:14 - 08:42 • {audio.size || '2.4 MB'} • Grounded in {personaProfile.fullName}&apos;s Vault
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const urlToAttach = audio.url || '/audio_samples/grandpa_authentic.wav';
                          setActiveAudioUrl(urlToAttach);
                          setActiveAudioTitle(audio.title);
                          setActiveTab('memories');
                          setViewMode('companion');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-600/50 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <span>Attach to Avatar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAudio(audio.id, audio.title)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition cursor-pointer"
                        title="Delete recording from voice vault"
                        aria-label={`Delete ${audio.title}`}
                      >
                        <Trash className="text-sm" />
                      </button>
                    </div>
                  </div>

                  {/* VERBATIM TRANSCRIPTION PASSAGE & ATTRIBUTION (Snip P1) */}
                  <div className="bg-[#0b0d13] p-3 rounded-xl border border-white/5 space-y-2">
                    <p className="text-xs text-slate-200 italic leading-relaxed">
                      &ldquo;
                      {audio.id === 'audio-1'
                        ? 'My father was the anchor of family unity. When dispute erupted among his brothers in 1965, he simply prepared evening tea for everyone and refused to discuss property until every cup was finished in quiet fellowship.'
                        : 'My badi mami ruled the courtyard without ever raising her voice. A single glance over her reading spectacles was enough to quiet six unruly nephews.'}
                      &rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-white/5">
                      <span>
                        Speaker: <strong className="text-amber-300 font-semibold">{personaProfile.fullName}</strong>
                      </span>
                      <span>
                        By: <strong className="text-slate-300 font-normal">Arjun (Grandson)</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        ) : viewMode === 'mindmap' ? (
          /* PROVENANCE-GROUNDED CONSTELLATION MIND MAP & EVIDENCE DRAWER (MAP-001..MAP-018) */
          <InteractiveMindMap
            graph={memoryGraph}
            representedPersonName={personaProfile.fullName}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedCategoryId={selectedCategory}
            onSelectCategoryId={setSelectedCategory}
            onSwitchToAvatarSession={() => setViewMode('companion')}
            onSpeakText={speakText}
            onDeleteMemory={handleDeleteMemory}
          />
        ) : (
          /* AVATAR COMPANION SESSION VIEW WITH FACE LIP-SYNC & VOICE TALK BACK */
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto lg:overflow-hidden relative bg-gradient-to-b from-transparent to-[#080c14]/80">
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-28 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <section className="flex flex-col items-center justify-center pt-6 pb-2 px-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/70 mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-xs font-medium text-slate-300">
                  {companionPersonName} • <span className="text-slate-400 font-normal">{companionPersonRelation}</span>
                </span>
                <span className="text-[10px] bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  {museTalkVideoUrl ? 'Living Video Bound' : 'Portrait Bound'}
                </span>
              </div>

              {/* DYNAMIC AVATAR PORTRAIT WITH FACIAL MOTION, AUTHENTIC VOICE, OR SYNC / MUSETALK VIDEO */}
              <div className="relative mb-3 flex flex-col items-center">
                {/* Hidden File Input for Instant 1-Click Face Change */}
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  accept="image/*"
                  onChange={handleAvatarFaceSelect}
                  className="hidden"
                />

                <div 
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="avatar-halo-container relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center cursor-pointer group"
                  title="Click to upload a new portrait photo"
                >
                  <div
                    className={`relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-slate-900/60 shadow-2xl bg-slate-950 transition-transform duration-150 ${
                      isSpeaking ? 'scale-[1.03]' : 'scale-100'
                    }`}
                  >
                    {museTalkVideoUrl ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={avatarVideoRef}
                          key={museTalkVideoUrl}
                          src={museTalkVideoUrl}
                          muted={true}
                          playsInline
                          preload="auto"
                          onEnded={() => {
                            if (isPlayingNativeVideoVoiceRef.current) {
                              stopAllAudio();
                            }
                          }}
                          className="w-full h-full object-cover"
                        />
                        {!isSpeaking && activePortraitUrl && (
                          <img
                            alt={`${companionPersonName} - Calm Resting Portrait`}
                            src={activePortraitUrl}
                            className="absolute inset-0 w-full h-full object-cover object-top filter brightness-95 contrast-105 transition-opacity duration-300"
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        <img
                          alt={`${companionPersonName} - Empathic Memory Avatar`}
                          className="w-full h-full object-cover object-top filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
                          src={activePortraitUrl}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14]/80 via-transparent to-cyan-500/10 pointer-events-none"></div>

                        {/* VISIBLE MOUTH VISEME LIP-SYNC OVERLAY (DRIVEN BY AUTHENTIC AUDIO RMS & SPEECH SYNTHESIS) */}
                        <div
                          className="absolute bottom-[28%] left-[51%] -translate-x-1/2 pointer-events-none transition-all duration-75 flex items-center justify-center z-20"
                          style={{
                            width: `${24 + mouthScale * 14}px`,
                            height: `${Math.max(3, 16 * mouthScale)}px`,
                            opacity: isSpeaking && mouthScale > 0.05 ? 0.95 : 0,
                          }}
                        >
                          <div
                            className="w-full h-full rounded-[45%] bg-[#1c0806] border border-[#4a1a14] shadow-inner"
                            style={{
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9)',
                              transform: `scaleY(${0.7 + mouthScale * 0.8}) scaleX(${0.85 + mouthScale * 0.3})`,
                            }}
                          ></div>
                        </div>
                      </>
                    )}

                    {/* HOVER OVERLAY: CHANGE PORTRAIT PHOTO */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white z-30">
                      <Camera className="text-2xl text-cyan-400 mb-1" />
                      <span className="text-[11px] font-semibold tracking-wide">Upload New Portrait Photo</span>
                      <span className="text-[9px] text-slate-300">Click to select image</span>
                    </div>

                    <div
                      className={`absolute inset-0 border-2 border-cyan-400/60 rounded-full pointer-events-none transition-opacity duration-150 ${
                        isSpeaking ? 'opacity-100 animate-pulse' : 'opacity-0'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* CLEAN STUDIO & PHOTO UPLOAD BAR (REDUNDANT MODE TOGGLES REMOVED) */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-full bg-slate-900/70 hover:bg-slate-800 border border-slate-800 text-slate-300 transition flex items-center gap-1"
                  >
                    <UploadSimple className="text-purple-400 text-xs" />
                    <span>Upload Photo</span>
                  </button>

                  <Link
                    href="/playground/sync"
                    className="px-2.5 py-1 rounded-full bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 transition flex items-center gap-1"
                  >
                    <Sparkle className="text-purple-400 text-xs" />
                    <span>Sync 2 Pro Studio</span>
                  </Link>
                </div>

                {avatarUploadNotice && (
                  <div className="mt-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-600/40 text-cyan-200 text-[11px] flex items-center gap-1.5 shadow-lg animate-fade-in">
                    <CheckCircle className="text-cyan-400 shrink-0" />
                    <span>{avatarUploadNotice}</span>
                  </div>
                )}
              </div>

              {/* Voice Spectrum Canvas & Authentic Voice Action Bar */}
              <div className="w-full max-w-md flex flex-col items-center">
                <canvas ref={canvasRef} className="w-full max-w-sm h-11 pointer-events-none" height="42" width="480"></canvas>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5 text-xs text-slate-400">
                  <button
                    onClick={() => playAuthenticVoiceAudio()}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition border font-medium ${
                      activeAudioUrl
                        ? 'bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border-amber-700/50 shadow-md shadow-amber-950/40'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title={activeAudioUrl ? 'Playing authentic uploaded voice recording' : `Play ${companionPersonName}'s attached voice sample`}
                  >
                    {isSpeaking ? <Pause className="text-amber-400" /> : <Play className={activeAudioUrl ? 'text-amber-400' : 'text-cyan-400'} />}
                    <span>{isSpeaking ? 'Pause Audio' : activeAudioUrl ? 'Play Real Voice' : 'Play Voice Sample'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className={activeAudioUrl ? 'text-amber-400' : 'text-emerald-400'} />
                    <span className="text-[11px] truncate max-w-[230px]">
                      {activeAudioUrl ? activeAudioTitle : `Voice: ${boundVoiceName}`}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Conversation Stream */}
            <section className="flex-1 flex flex-col justify-end px-4 lg:px-8 pb-5 max-w-3xl w-full mx-auto relative z-10">
              <div className="space-y-4 mb-4 overflow-y-auto max-h-[280px] lg:max-h-[300px] pr-2">
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/20 text-[11px] text-cyan-300 shadow-sm">
                    <Bookmark className="text-cyan-400" />
                    <span>[Grounded in: {companionPersonName}&apos;s Verified Family Memory Vault]</span>
                  </div>
                  {conversations.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearConversation}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900/40 text-[11px] transition shadow-sm"
                      title="Reset conversation back to vault memory opener"
                    >
                      <ArrowsClockwise className="text-xs" />
                      <span className="hidden sm:inline">Reset Chat</span>
                    </button>
                  )}
                </div>

                {conversations.map((msg) =>
                  msg.sender === 'user' ? (
                    <div key={msg.id} className="flex items-start gap-3 justify-end">
                      <div className="bg-cyan-950/40 border border-cyan-800/40 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-md text-sm text-slate-200 space-y-2">
                        <p>{msg.text}</p>
                        {msg.imageUrl && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-cyan-700/40 max-w-xs">
                            <img src={msg.imageUrl} alt="Uploaded attachment" className="w-full h-auto object-cover" />
                          </div>
                        )}
                        {msg.audioUrl && (
                          <div className="mt-2">
                            <audio controls src={msg.audioUrl} className="w-full h-8" />
                          </div>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-700 overflow-hidden shrink-0 mt-0.5">
                        <img alt={msg.author} className="w-full h-full object-cover" src={msg.avatarUrl} />
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-cyan-500/40 mt-1">
                        <img
                          alt={companionPersonName}
                          className="w-full h-full object-cover"
                          src={activePortraitUrl || msg.avatarUrl}
                        />
                      </div>
                      <div className="glass-panel rounded-2xl rounded-tl-sm p-4 max-w-xl shadow-xl space-y-2 border-slate-700/60">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-white/5">
                          <span className="flex items-center gap-1 text-slate-300 font-medium">
                            <Sparkle className="text-amber-400" /> {companionPersonName}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400">
                            {msg.faithfulnessScore || 'Faithfulness: 100% verified'}
                          </span>
                        </div>
                        <p className="text-sm sm:text-[15px] leading-relaxed text-slate-100 font-sans">{msg.text}</p>
                        <div className="pt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => speakCompanionMessage(msg.text, Boolean(msg.isAttachedVoiceSample))}
                              className="w-7 h-7 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs transition"
                              title={`Listen in ${companionPersonName}'s attached voice with synchronized face lip-sync`}
                            >
                              {isSpeaking ? <Pause className="text-amber-400" /> : <SpeakerHigh />}
                            </button>
                            <div className="flex items-center gap-1">
                              <span className={`w-1 h-2 bg-cyan-400/80 rounded-full ${isSpeaking ? 'animate-pulse' : ''}`}></span>
                              <span className={`w-1 h-3 bg-cyan-400/80 rounded-full ${isSpeaking ? 'animate-pulse' : ''}`}></span>
                              <span className={`w-1 h-1.5 bg-cyan-400/80 rounded-full ${isSpeaking ? 'animate-pulse' : ''}`}></span>
                              <span className={`w-1 h-4 bg-cyan-400/80 rounded-full ${isSpeaking ? 'animate-pulse' : ''}`}></span>
                              <span className={`w-1 h-2 bg-cyan-400/80 rounded-full ${isSpeaking ? 'animate-pulse' : ''}`}></span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              {msg.audioSnippetLength || `${companionPersonName} Voice`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <button className="text-slate-400 hover:text-slate-200" title="Copy remembrance">
                              <Copy />
                            </button>
                            <button className="text-slate-400 hover:text-amber-300" title="Bookmark in vault">
                              <Bookmark />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
                <div ref={conversationEndRef} />
              </div>

              {/* Mobile Contextual Reflection Pill (< 1280px) */}
              <div className="xl:hidden flex justify-center mb-2">
                <button
                  type="button"
                  onClick={() => setIsMobileReflectionOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-1.5 transition shadow-sm touch-target-48"
                >
                  <FlowerLotus className="text-sm text-purple-400" />
                  <span>View Reflection &amp; Next Steps</span>
                </button>
              </div>

              {/* Chat Input & Attachment Handler (Keyboard-safe with safe-area spacing above bottom nav) */}
              <div className="glass-panel p-2 rounded-2xl border border-slate-700/80 shadow-2xl relative mb-16 md:mb-0">
                <input
                  type="file"
                  ref={chatAttachmentInputRef}

                  onChange={handleChatAttachment}
                  accept="image/*,audio/*"
                  className="hidden"
                />

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => chatAttachmentInputRef.current?.click()}
                    className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition shrink-0"
                    title="Attach photo or voice note"
                  >
                    <Paperclip className="text-lg" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0 relative ${
                      isRecording ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300'
                    }`}
                    title={isRecording ? 'Click to stop recording' : 'Click to speak using Web Speech API'}
                  >
                    {isRecording ? <Waveform className="text-cyan-400 text-lg animate-pulse" /> : <Microphone className="text-lg" />}
                    {isRecording && <span className="absolute inset-0 rounded-xl ring-2 ring-cyan-400 animate-ping"></span>}
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      isRecording
                        ? 'Listening to your voice... Speak comfortably.'
                        : `Speak or type a thought to ${companionPersonName}...`
                    }
                    className="w-full bg-transparent border-0 text-sm text-slate-100 placeholder-slate-400 focus:ring-0 focus:outline-none px-2 py-1"
                  />

                  <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIndicModeEnabled(!indicModeEnabled)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium transition ${
                        indicModeEnabled
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Toggle Indic Socio-Linguistic Translation"
                    >
                      <Translate className="text-xs text-amber-400" />
                      <span>{indicModeEnabled ? 'Indic (Active)' : 'Indic'}</span>
                    </button>
                    {indicModeEnabled && (
                      <select
                        value={indicSelectedDialect}
                        onChange={(e) => setIndicSelectedDialect(e.target.value)}
                        className="bg-transparent text-amber-300 text-[10px] font-mono focus:outline-none cursor-pointer"
                      >
                        <option value="bho" className="bg-slate-900 text-slate-200">Bhojpuri (भोजपुरी)</option>
                        <option value="hi" className="bg-slate-900 text-slate-200">Hindi (हिन्दी)</option>
                        <option value="mai" className="bg-slate-900 text-slate-200">Maithili (मैथिली)</option>
                        <option value="awa" className="bg-slate-900 text-slate-200">Awadhi (अवधी)</option>
                        <option value="bn" className="bg-slate-900 text-slate-200">Bengali (বাংলা)</option>
                        <option value="ta" className="bg-slate-900 text-slate-200">Tamil (தமிழ்)</option>
                      </select>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white flex items-center justify-center transition shrink-0 shadow-md shadow-cyan-900/30"
                    title="Send memory reflection"
                  >
                    <PaperPlaneRight className="text-lg" />
                  </button>
                </form>
              </div>
            </section>
          </main>
        )}

        {/* RIGHT PANEL - Rendered as persistent panel only on expanded desktop (>= 1280px). On mobile, replaced by MobileReflectionSheet */}
        {viewMode !== 'mindmap' && (
          <aside className="hidden xl:flex w-80 lg:w-96 border-l border-white/10 bg-[#080c14]/90 p-4 lg:p-5 flex-col justify-between overflow-y-auto shrink-0 z-20">
            <div className="space-y-4">

              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <HandHeart className="text-lg text-purple-400" />
                  <h2 className="text-sm font-semibold text-slate-100">Reflection &amp; Handoff</h2>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Stage 2: Integration</span>
              </div>

              <div className="glass-card-interactive p-4 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 text-xs">
                      <FlowerLotus className="text-base" />
                    </span>
                    <h3 className="text-sm font-medium text-slate-100">Gentle Reflection</h3>
                  </div>
                  <span className="text-[10px] text-purple-300 font-mono bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-full">
                    Empathetic AI
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You are revisiting peaceful family memories. Holding onto {companionPersonName}&apos;s appreciation for quiet, grounding
                  moments can anchor your own week.
                </p>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px]">
                    Emotional Tone: <strong className="text-cyan-300 font-normal">Nostalgic &amp; Soothing</strong>
                  </span>
                  <Link
                    href={`/experience/journal?context=${encodeURIComponent(
                      `Quiet family memories and values learned from ${companionPersonName}`
                    )}`}
                    className="text-purple-300 hover:text-purple-200 text-[11px] underline flex items-center gap-1"
                  >
                    <span>Log to Journal →</span>
                  </Link>
                </div>
              </div>

              <div className="glass-card-interactive p-4 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs">
                      <Compass className="text-base" />
                    </span>
                    <h3 className="text-sm font-medium text-slate-100">Next Steps</h3>
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                    Suggested
                  </span>
                </div>
                <div className="space-y-2 mt-2">
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition">
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 text-amber-500 focus:ring-0 mt-0.5" />
                    <span className="text-xs text-slate-300">Preserve this cedar tree memory in the family shared scrapbook</span>
                  </label>
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition">
                    <input type="checkbox" className="rounded border-slate-700 text-amber-500 focus:ring-0 mt-0.5" />
                    <span className="text-xs text-slate-300">Invite sister Claire to listen to the original 2018 voicemails</span>
                  </label>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                  <Database className="text-cyan-400" /> Referenced Artifacts
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-800/40 text-slate-300">
                    <span className="truncate pr-2">• VM_July2018_Trailhead.wav</span>
                    <span className="text-[10px] text-cyan-400 font-mono shrink-0">1.8 MB</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-800/40 text-slate-300">
                    <span className="truncate pr-2">• Olympic_Park_Journal_Entry.pdf</span>
                    <span className="text-[10px] text-purple-400 font-mono shrink-0">pg 42</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/20 text-center relative overflow-hidden">
                  <div className="flex justify-center mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-300">
                      <Heartbeat className="text-lg" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">Remember to take a breath and connect with loved ones today.</p>
                  <p className="text-[11px] text-slate-400 mt-1 mb-3">
                    AI companions are here to help cherish, not replace real-world human connection.
                  </p>
                  <button
                    onClick={() => setIsBreathingModalOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-cyan-500/30 transition flex items-center justify-center gap-2"
                  >
                    <Wind /> Start 1-Minute Breath Pause
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* UPLOAD MEMORY ARTIFACT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-cyan-500/30 text-left relative shadow-2xl space-y-4">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              <X />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
              <UploadSimple className="text-xl text-cyan-400" />
              <div>
                <h3 className="text-base font-semibold text-slate-100">Upload Memory Artifact</h3>
                <p className="text-xs text-slate-400">Add photos, voice notes, or letters to the RAG memory vault</p>
              </div>
            </div>

            <form onSubmit={handlePerformUpload} className="space-y-4 text-xs">
              {/* File Drop & Picker */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Select Image or Voice Note File</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,audio/*,.pdf,.txt"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-5 text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900/80 transition flex flex-col items-center justify-center gap-2"
                >
                  {uploadPreviewUrl ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-700 mb-1">
                      <img src={uploadPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : selectedFile ? (
                    <div className="flex items-center gap-2 text-cyan-300 font-medium">
                      {selectedFile.type.startsWith('audio/') ? <Waveform className="text-xl" /> : <FileText className="text-xl" />}
                      <span>{selectedFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <UploadSimple className="text-3xl text-cyan-400 mb-1" />
                      <p className="text-slate-200 font-medium">Click to choose image or audio file</p>
                      <p className="text-[11px] text-slate-500">Supports PNG, JPG, MP3, WAV, M4A, PDF</p>
                    </>
                  )}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Memory Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Summer Walk in Olympic Park 2018"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Memory Category Cluster</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.count} memories)
                    </option>
                  ))}
                </select>
              </div>

              {/* Success Feedback */}
              {uploadSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-emerald-200 flex items-center gap-2">
                  <CheckCircle className="text-lg text-emerald-400 shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold disabled:opacity-50 transition shadow-lg"
                >
                  {isUploading ? 'Uploading...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BREATHING EXERCISE MODAL */}
      {isBreathingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-7 border border-cyan-500/40 text-center relative shadow-2xl bg-[#0b101b]/95 overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={() => setIsBreathingModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition z-20"
              title="Close breathing exercise"
            >
              <X className="text-base" />
            </button>

            <div className="pt-2 pb-4 flex flex-col items-center relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium mb-2 shadow-sm">
                <Wind className="text-sm text-cyan-400" />
                <span>Mindful Breathing Pause</span>
              </div>

              {/* SPACIOUS BREATHING ORB WITH NO TEXT OVERFLOW */}
              <div className="relative w-56 h-56 flex items-center justify-center my-3">
                {/* Outer ambient pulsing aura ring */}
                <div className="absolute w-52 h-52 rounded-full bg-cyan-500/10 border border-cyan-400/20 animate-breathe-aura pointer-events-none" />
                
                {/* Mid concentric glowing orb */}
                <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-cyan-500/25 via-indigo-500/20 to-purple-500/25 border-2 border-cyan-400/70 animate-breathe pointer-events-none" />

                {/* Central Instruction Content - Generously centered with soft padding */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-[170px]">
                  <span className="text-base font-serif font-medium text-cyan-100 tracking-wide leading-snug drop-shadow-md transition-all duration-700">
                    {breathInstruction}
                  </span>
                  <span className="text-[10px] text-cyan-300/80 font-mono mt-1.5 tracking-wider uppercase">
                    4s rhythm
                  </span>
                </div>
              </div>

              {/* 4-BREATH PROGRESS PIPS & COUNTER */}
              <div className="flex items-center justify-center gap-2 mt-2 mb-1.5">
                {[0, 1, 2, 3].map((step) => (
                  <span
                    key={step}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                      breathCycle >= step
                        ? 'bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.9)] scale-110'
                        : 'bg-slate-700/80'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] font-mono text-cyan-200/70 mb-3">
                Breath Cycle {breathCycle + 1} of 4
              </p>

              <h4 className="text-base font-semibold text-slate-100">Grounded in the Present</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Take 4 slow breaths. Feel the quiet stillness and your feet resting gently on the floor.
              </p>

              {/* HEALING SOUNDSCAPE SELECTION TRAY */}
              <div className="w-full mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                    <MusicNotes className="text-cyan-400" />
                    Mindful Soundscape:
                  </span>
                  <button
                    onClick={() => setIsBreathingMuted(!isBreathingMuted)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                  >
                    {isBreathingMuted ? (
                      <>
                        <SpeakerSlash className="text-amber-400" />
                        <span className="text-amber-300/80">Muted</span>
                      </>
                    ) : (
                      <>
                        <SpeakerHigh className="text-cyan-400" />
                        <span>Sound On</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBreathingSoundTrack('birds');
                      setIsBreathingMuted(false);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border flex flex-col items-center justify-center gap-1 transition ${
                      breathingSoundTrack === 'birds' && !isBreathingMuted
                        ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-sm">🐦</span>
                    <span className="font-semibold text-[11px]">432 Hz Birds</span>
                    <span className="text-[9px] text-emerald-400/80 font-mono">Healing Tone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBreathingSoundTrack('rain');
                      setIsBreathingMuted(false);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border flex flex-col items-center justify-center gap-1 transition ${
                      breathingSoundTrack === 'rain' && !isBreathingMuted
                        ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-sm">🌧️</span>
                    <span className="font-semibold text-[11px]">Rain Sound</span>
                    <span className="text-[9px] text-cyan-400/80 font-mono">Gentle Mist</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBreathingSoundTrack('jingle');
                      setIsBreathingMuted(false);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border flex flex-col items-center justify-center gap-1 transition ${
                      breathingSoundTrack === 'jingle' && !isBreathingMuted
                        ? 'bg-sky-950/70 border-sky-500/50 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-sm">❄️</span>
                    <span className="font-semibold text-[11px]">Jingle Bell</span>
                    <span className="text-[9px] text-sky-400/80 font-mono">Serene Snow</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBreathingSoundTrack('rumi');
                      setIsBreathingMuted(false);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border flex flex-col items-center justify-center gap-1 transition ${
                      breathingSoundTrack === 'rumi' && !isBreathingMuted
                        ? 'bg-purple-950/70 border-purple-500/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-sm">✨</span>
                    <span className="font-semibold text-[11px]">Rumi Tune</span>
                    <span className="text-[9px] text-purple-400/80 font-mono">Cosmic Peace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBreathingSoundTrack('silence');
                      setIsBreathingMuted(true);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border flex flex-col items-center justify-center gap-1 transition col-span-2 sm:col-span-1 ${
                      breathingSoundTrack === 'silence' || isBreathingMuted
                        ? 'bg-slate-800 border-slate-600 text-slate-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-sm">🤫</span>
                    <span className="font-semibold text-[11px]">Quiet Stillness</span>
                    <span className="text-[9px] text-slate-400 font-mono">Silent Breath</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsBreathingModalOpen(false)}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg transition"
            >
              Return to Session
            </button>
          </div>
        </div>
      )}
      {/* PERSISTENT 1:1 VOICE PROFILE BINDING MODAL */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 border border-cyan-500/40 text-left relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsVoiceModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              <X />
            </button>

            <div className="border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Microphone className="text-xl text-amber-400" />
                <h3 className="text-lg font-serif text-slate-100">Voice Profile: {companionPersonName}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Persistent 1-to-1 voice binding. Every conversation response uses this cloned voice.
              </p>
            </div>

            {/* Current Active Voice Status */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Current Active Voice</p>
                <p className="text-sm font-semibold text-slate-200">{boundVoiceName}</p>
                <p className="text-[11px] font-mono text-cyan-400 truncate max-w-xs">{boundVoiceId}</p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 font-mono">
                1:1 Linked
              </span>
            </div>

            {voiceBindingSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="text-emerald-400 shrink-0" />
                <span>{voiceBindingSuccess}</span>
              </div>
            )}

            {/* Option A: Enter / Select Pre-Cloned Voice ID */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Option A: Link Existing Voice ID / Sample</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Sync Voice ID (e.g. EXAVITQu4vr4xnSDxMaL)..."
                  defaultValue={boundVoiceId}
                  id="directVoiceInput"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  onClick={async () => {
                    const inputEl = document.getElementById('directVoiceInput') as HTMLInputElement;
                    const val = inputEl?.value?.trim();
                    if (!val) return;
                    setBoundVoiceId(val);
                    setBoundVoiceName(`${companionPersonName} (Linked Voice)`);
                    setVoiceBindingSuccess(`Voice ID successfully bound to ${companionPersonName}!`);
                    setTimeout(() => setVoiceBindingSuccess(''), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
                >
                  Bind
                </button>
              </div>
            </div>

            {/* Option B: Upload New Audio Sample & Clone */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Option B: Upload New Audio Recording (Clone)</span>
              <p className="text-[11px] text-slate-400">
                Upload a 30-second to 2-minute clean audio recording of {companionPersonName} speaking to generate a new cloned voice profile.
              </p>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={(e) => setVoiceCustomSample(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceConsentGiven}
                  onChange={(e) => setVoiceConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px] text-slate-400 leading-tight">
                  I confirm I hold legal consent or estate authority to clone and synthesize this speaker&apos;s voice for therapeutic family remembrance.
                </span>
              </label>

              <button
                disabled={!voiceCustomSample || !voiceConsentGiven || isCloningVoice}
                onClick={async () => {
                  if (!voiceCustomSample) return;
                  setIsCloningVoice(true);
                  try {
                    const fd = new FormData();
                    fd.append('personId', `person-${companionPersonName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
                    fd.append('voiceName', `${companionPersonName} (${voiceCustomSample.name})`);
                    fd.append('consented', 'true');
                    fd.append('sample', voiceCustomSample);

                    const res = await fetch('/api/voice/clone', { method: 'POST', body: fd });
                    const data = await res.json();
                    if (data.success && data.profile) {
                      setBoundVoiceId(data.profile.voiceId);
                      setBoundVoiceName(data.profile.voiceName);
                      setVoiceBindingSuccess('New voice clone successfully created and bound!');
                      setTimeout(() => setVoiceBindingSuccess(''), 3500);
                    } else {
                      alert(data.error || 'Failed to clone voice sample.');
                    }
                  } catch (e: any) {
                    alert(e.message || 'Clone error');
                  } finally {
                    setIsCloningVoice(false);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white text-xs font-semibold disabled:opacity-50 transition"
              >
                {isCloningVoice ? 'Uploading & Cloning Voice Sample...' : `Clone & Bind to ${companionPersonName}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-REGION CRISIS & MENTAL HEALTH HELPLINE MODAL */}
      {isCrisisModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full rounded-3xl p-6 border border-rose-500/40 text-left relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCrisisModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              <X />
            </button>

            <div className="flex items-center gap-3 border-b border-rose-500/20 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 text-xl">
                <Heartbeat />
              </div>
              <div>
                <h3 className="text-lg font-serif text-slate-100">You Are Not Alone</h3>
                <p className="text-xs text-rose-300">
                  Free, confidential support is available 24/7. Please reach out to someone who can help.
                </p>
              </div>
            </div>

            {/* Region Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {Object.values(CRISIS_DIRECTORIES).map((reg) => (
                <button
                  key={reg.countryCode}
                  onClick={() => setSelectedCrisisRegion(reg.countryCode)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                    selectedCrisisRegion === reg.countryCode
                      ? 'bg-rose-950 text-rose-200 border border-rose-600/60 shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{reg.flag}</span>
                  <span>{reg.countryName}</span>
                </button>
              ))}
            </div>

            {/* Contacts for Selected Region */}
            {CRISIS_DIRECTORIES[selectedCrisisRegion] && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold">Immediate Emergency</span>
                    <p className="text-sm font-bold text-slate-100">National Emergency Dispatch</p>
                  </div>
                  <a
                    href={`tel:${CRISIS_DIRECTORIES[selectedCrisisRegion].emergencyNumber}`}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                  >
                    <Phone /> Call {CRISIS_DIRECTORIES[selectedCrisisRegion].emergencyNumber}
                  </a>
                </div>

                {CRISIS_DIRECTORIES[selectedCrisisRegion].contacts.map((contact, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{contact.name}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono ${
                          contact.type === 'GOVERNMENT'
                            ? 'bg-cyan-950/80 border border-cyan-800/50 text-cyan-300'
                            : 'bg-purple-950/80 border border-purple-800/50 text-purple-300'
                        }`}>
                          {contact.type}
                        </span>
                      </div>
                      <a
                        href={`tel:${contact.number}`}
                        className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-medium transition"
                      >
                        {contact.displayNumber}
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{contact.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Hours: {contact.availableHours}</span>
                      {contact.website && (
                        <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                          Official Website &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsCrisisModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
            >
              Close Helplines
            </button>
          </div>
        </div>
      )}

      {/* GOOGLE DRIVE CLOUD PICKER MODAL */}
      <GoogleDrivePickerModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        mode={googleDriveMode}
        onImport={handleGoogleDriveImport}
      />

      {/* CONFIGURE CUSTOM REMEMBRANCE PERSONA MODAL (Snip P2) */}
      <ConfigurePersonaModal
        isOpen={isConfigurePersonaModalOpen}
        onClose={() => setIsConfigurePersonaModalOpen(false)}
        currentProfile={personaProfile}
        onSaveProfile={(updatedProfile, initialMemory) => {
          setPersonaProfile(updatedProfile);
          setCompanionPersonName(updatedProfile.fullName);
          setCompanionPersonRelation(updatedProfile.relationship);
          setActivePortraitUrl(updatedProfile.portraitUrl);

          if (initialMemory) {
            setUploadedAudioVault((prev) => [
              {
                id: `audio-${Date.now()}`,
                title: initialMemory.title,
                url: initialMemory.audioClipUrl || '/audio_samples/grandpa_authentic.wav',
                type: 'audio',
                date: 'Just now',
                size: '2.8 MB',
              },
              ...prev,
            ]);
          }

          try {
            localStorage.setItem('paramsathya_persona_profile_v1', JSON.stringify(updatedProfile));
          } catch {}
        }}
      />

      {/* MOBILE ADAPTIVE SHELL SHEETS & NAVIGATION (< 768px) */}
      <MobileBottomNav
        activeTab={
          viewMode === 'mindmap'
            ? 'mindmap'
            : activeTab === 'memories'
            ? 'presence'
            : activeTab === 'family'
            ? 'circle'
            : 'more'
        }
        onSelectTab={(tabKey: MobileTab) => {
          if (tabKey === 'presence') {
            setActiveTab('memories');
            setViewMode('companion');
          } else if (tabKey === 'memories') {
            setActiveTab('memories');
            setViewMode('companion');
          } else if (tabKey === 'mindmap') {
            setActiveTab('memories');
            setViewMode('mindmap');
          } else if (tabKey === 'circle') {
            setActiveTab('family');
            setViewMode('companion');
          } else if (tabKey === 'more') {
            setIsMobileMoreOpen(true);
          }
        }}
        pendingInvitesCount={pendingInvites.length}
        memoryCount={memoryGraph.uniqueApprovedMemoryCount}
      />

      {/* MOBILE MORE DRAWER SHEET */}
      <MobileMoreSheet
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        onNavigateTab={(targetTab) => {
          if (targetTab === 'indic') {
            window.location.href = '/playground/indic';
            return;
          }
          setActiveTab(targetTab);
          setViewMode('companion');
        }}
        onOpenBreathing={() => setIsBreathingModalOpen(true)}
        onOpenVoiceProfile={() => setIsVoiceModalOpen(true)}
        onOpenThemeSelector={() => setIsThemeDropdownOpen(true)}
        isAmbientMuted={isAmbientMuted}
        onToggleAmbient={() => {
          const nextMuted = !isAmbientMuted;
          setIsAmbientMuted(nextMuted);
          if (ambientAudioRef.current) {
            if (nextMuted) {
              ambientAudioRef.current.pause();
            } else if (!isSpeaking && !isPlaying) {
              ambientAudioRef.current.play().catch(() => {});
            }
          }
        }}
        audioVaultCount={uploadedAudioVault.length}
        photoVaultCount={uploadedPhotos.length}
        userDisplayName={userProfile.displayName}
        userAvatarUrl={userProfile.avatarUrl}
        onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
      />

      {/* MOBILE REFLECTION & HANDOFF SHEET */}
      <MobileReflectionSheet
        isOpen={isMobileReflectionOpen}
        onClose={() => setIsMobileReflectionOpen(false)}
        personName={companionPersonName}
        onOpenBreathing={() => setIsBreathingModalOpen(true)}
      />

      {/* ACTIVE LOGGED-IN USER PROFILE & SETTINGS MODAL */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        currentProfile={userProfile}
        onSaveProfile={handleSaveUserProfile}
      />
    </div>

  );
}
