'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Graph,
  Microphone,
  ImagesSquare,
  UsersThree,
  ShieldCheck,
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
  Camera
} from '@phosphor-icons/react';

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

  // Active Portrait & Authentic Audio Source State
  const [activePortraitUrl, setActivePortraitUrl] = useState<string>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAAZf-XDOFaVRVs8z4ta1azpn5uTYBtURgwW0i61rRDiMTqYZpjKJxULqkQxEBnknKvlBnnfIKnQEuWe0n9Dd9xv_r2FKIUaj26I8bTiYMial_HZPwrgsIHgcLgK2JOQKiIgfTiOSjz7rDIbBbDVpPNF_-yJVrZkOiEUXqtlHNrUBnPbVBlNKa4IneP4qyofcpLLj9PY0LfxoHPBSWtb5pLeSLOJp9vTfyKnCtzoRQ'
  );
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [activeAudioTitle, setActiveAudioTitle] = useState<string>('Thomas 2018 Memory Snippet (Authentic)');
  const [audioDuration, setAudioDuration] = useState<string>('0:08');
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRafIdRef = useRef<number | null>(null);

  // MuseTalk 1.5 Video Synthesis Integration State
  const [isMuseTalkPanelOpen, setIsMuseTalkPanelOpen] = useState<boolean>(false);
  const [museTalkBboxShift, setMuseTalkBboxShift] = useState<number>(0);
  const [museTalkStatus, setMuseTalkStatus] = useState<string>('IDLE');
  const [museTalkLogs, setMuseTalkLogs] = useState<string[]>([
    'MuseTalk 1.5 Pipeline ready within Companion view.',
  ]);
  const [museTalkVideoUrl, setMuseTalkVideoUrl] = useState<string | null>(null);
  const [isGeneratingMuseTalk, setIsGeneratingMuseTalk] = useState<boolean>(false);

  // Connected Circle Members State
  const [circleMembers, setCircleMembers] = useState([
    {
      id: 'member-1',
      name: 'Maya',
      email: 'maya@example.com',
      role: 'Contributor',
      relation: 'Daughter (Owner)',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC6fbVph3tU_Lnf2CmAey-RpAGVQcc3iWhsolfT8TojYEo8Jj0EXlqJjnejbsR7-4IdE_Kst-5KagZslhbd7d1JdX9eM88Zgvn2XjsuDr9_1lEE4EDkhacBCI93Q0eODvtNR4P1iPQmclz3SCu7s1-m20AAVym-WPcIjx8pgZiSNngPGA3zO9GAlrB__frJbb9e4Bu1X-Y5zS1XW0c7ap54mmGw-ODLjQ1fKeexk9I',
      joinedAt: 'Active now',
    },
    {
      id: 'member-2',
      name: 'Claire',
      email: 'claire.family@gmail.com',
      role: 'Contributor',
      relation: 'Sister',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCPrQZI86P-lCAqlJIQq834CG5Uw4YDsSat59s4pB003oUoGeCWd0n4JR4hbsKz_hgBzz9iol0TwRbldMKGbCQWct5gEjxoYMEdqxzEzJZ6egWSNiQf6KMJaE9Scd4tcg2OXEtKD1_Y3wXWcMWhbITSjrzx_GxKsfoG-s4ognBOH8hS6BtRwF1fHh1etk5Hw3DJaphLSdD15XMvtECGDQVG_qEsFfQC6v6hXv8I5Sg',
      joinedAt: 'Joined Oct 5',
    },
    {
      id: 'member-3',
      name: 'Arjun',
      email: 'arjun.k@domain.org',
      role: 'Viewer',
      relation: 'Grandson',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      joinedAt: 'Joined Oct 8',
    },
  ]);
  const [pendingInvites, setPendingInvites] = useState([
    {
      id: 'invite-1',
      email: 'uncle.dev@familymail.com',
      role: 'Contributor',
      sentAt: 'Invite sent 2d ago',
    },
  ]);
  const [inviteEmailInput, setInviteEmailInput] = useState('');
  const [inviteRoleInput, setInviteRoleInput] = useState<'Contributor' | 'Viewer'>('Contributor');
  const [inviteSuccessNotice, setInviteSuccessNotice] = useState('');

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
      text: 'Dad, do you remember that morning we walked up the ridge at Olympic Park? It was so quiet.',
    },
    {
      id: '2',
      sender: 'companion',
      author: 'Thomas',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCPrQZI86P-lCAqlJIQq834CG5Uw4YDsSat59s4pB003oUoGeCWd0n4JR4hbsKz_hgBzz9iol0TwRbldMKGbCQWct5gEjxoYMEdqxzEzJZ6egWSNiQf6KMJaE9Scd4tcg2OXEtKD1_Y3wXWcMWhbITSjrzx_GxKsfoG-s4ognBOH8hS6BtRwF1fHh1etk5Hw3DJaphLSdD15XMvtECGDQVG_qEsFfQC6v6hXv8I5Sg',
      text: '"I remember the smell of the pine trees after the rain, too... We sat on that cedar bench by the trailhead for nearly an hour. Tell me, what else do you recall about that afternoon?"',
      faithfulnessScore: '100% verified',
      audioSnippetLength: '0:09 snippet',
    },
  ]);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  // Breathing Modal state
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [breathInstruction, setBreathInstruction] = useState('Breathe in deeply...');

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

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
        : 'Thank you for sharing this voice note. I can hear the joy in your voice.';

      const companionMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'companion',
        author: 'Thomas',
        avatarUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCPrQZI86P-lCAqlJIQq834CG5Uw4YDsSat59s4pB003oUoGeCWd0n4JR4hbsKz_hgBzz9iol0TwRbldMKGbCQWct5gEjxoYMEdqxzEzJZ6egWSNiQf6KMJaE9Scd4tcg2OXEtKD1_Y3wXWcMWhbITSjrzx_GxKsfoG-s4ognBOH8hS6BtRwF1fHh1etk5Hw3DJaphLSdD15XMvtECGDQVG_qEsFfQC6v6hXv8I5Sg',
        text: `"${responseText}"`,
        faithfulnessScore: '100% verified',
        audioSnippetLength: '0:08 snippet',
      };
      setConversations((prev) => [...prev, companionMsg]);
      speakText(responseText);
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

  // Stop any active audio (HTML5 or synthesis)
  const stopAllAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
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

  // Play Authentic Uploaded Audio File with True RMS Web Audio Analyser
  const playAuthenticVoiceAudio = (audioUrlToPlay?: string) => {
    if (typeof window === 'undefined') return;

    if (isPlaying || isSpeaking) {
      stopAllAudio();
      return;
    }

    const targetUrl = audioUrlToPlay || activeAudioUrl;

    // If an authentic audio recording exists, play the REAL voice
    if (targetUrl) {
      stopAllAudio();
      setIsPlaying(true);
      setIsSpeaking(true);

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

          // Real-time loop reading audio frequency data
          const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
          const updateMouthFromAudio = () => {
            if (!audioAnalyserRef.current || audio.paused || audio.ended) {
              return;
            }
            audioAnalyserRef.current.getByteFrequencyData(dataArray);

            // Calculate RMS energy across vocal speech range (bins 2 to 32)
            let sum = 0;
            const vocalBins = Math.min(32, dataArray.length);
            for (let i = 2; i < vocalBins; i++) {
              sum += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sum / (vocalBins - 2)) / 255;
            // Map RMS to natural mouth scale
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
        speakText(conversations[conversations.length - 1]?.text || 'I remember sitting on that cedar bench with you.');
      };

      audio.play().catch((err) => {
        console.warn('Audio play was prevented or failed:', err);
        stopAllAudio();
      });
      return;
    }

    // Fallback: If no real audio file is uploaded yet, synthesize the message text
    const lastCompanionMsg = [...conversations].reverse().find((m) => m.sender === 'companion');
    if (lastCompanionMsg) {
      speakText(lastCompanionMsg.text);
    }
  };

  // Real Speech Synthesis Fallback ("Talk Back Out Loud") with Viseme Lip-Sync
  const speakText = (text: string) => {
    if (typeof window === 'undefined') return;

    // Helper to start continuous mouth oscillation while speaking
    const startMouthAnimation = () => {
      if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current);
      let step = 0;
      lipSyncIntervalRef.current = setInterval(() => {
        step++;
        // Natural speech syllabic envelope simulation (alternating jaw drop and lip shapes)
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
      // Fallback: animate visually for text preview
      setIsSpeaking(true);
      setIsPlaying(true);
      startMouthAnimation();
      setTimeout(stopMouthAnimation, 3500);
      return;
    }

    window.speechSynthesis.cancel();

    if (isSpeaking) {
      stopMouthAnimation();
      return;
    }

    const cleanText = text.replace(/^"|"$/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google'))
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.pitch = 0.92;
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPlaying(true);
      startMouthAnimation();
    };

    utterance.onboundary = () => {
      // Trigger extra syllabic accent on word boundary
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

  // Constellation Mind Map Canvas Renderer
  useEffect(() => {
    if (viewMode !== 'mindmap') return;
    const canvas = mindmapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 500;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes = [
      { id: 'center', label: 'P.S.', x: 0.5, y: 0.5, radius: 24, color: '#ffffff', count: 25, isCenter: true },
      { id: 'parents', label: 'Parents', x: 0.45, y: 0.78, radius: 14, color: '#10b981', count: 12 },
      { id: 'identity', label: 'Identity', x: 0.42, y: 0.45, radius: 14, color: '#e2e8f0', count: 12 },
      { id: 'mortality', label: 'Mortality', x: 0.62, y: 0.35, radius: 12, color: '#a855f7', count: 6 },
      { id: 'scenes', label: 'Scenes', x: 0.52, y: 0.38, radius: 11, color: '#38bdf8', count: 7 },
      { id: 'fears', label: 'Fears', x: 0.48, y: 0.2, radius: 9, color: '#8b5cf6', count: 3 },
      { id: 'regrets', label: 'Regrets', x: 0.55, y: 0.28, radius: 9, color: '#6366f1', count: 3 },
      { id: 'siblings', label: 'Siblings', x: 0.32, y: 0.38, radius: 10, color: '#14b8a6', count: 5 },
      { id: 'partner', label: 'Partner', x: 0.34, y: 0.58, radius: 8, color: '#ec4899', count: 2 },
      { id: 'work', label: 'Work', x: 0.28, y: 0.65, radius: 7, color: '#f59e0b', count: 1 },
      { id: 'childhood', label: 'Childhood', x: 0.38, y: 0.68, radius: 7, color: '#059669', count: 1 },
      { id: 'children', label: 'Children', x: 0.62, y: 0.72, radius: 8, color: '#f97316', count: 2 },
      { id: 'pride', label: 'Pride', x: 0.65, y: 0.9, radius: 7, color: '#f43f5e', count: 1 },
    ];

    const draw = () => {
      t += 0.01;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < 70; i++) {
        const sx = (Math.sin(i * 99 + t * 0.1) * 0.5 + 0.5) * w;
        const sy = (Math.cos(i * 33 + t * 0.1) * 0.5 + 0.5) * h;
        const opacity = Math.sin(i + t) * 0.3 + 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.25})`;
        ctx.beginPath();
        ctx.arc(sx, sy, (i % 3) + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const centerNode = nodes[0];
      const cx = centerNode.x * w;
      const cy = centerNode.y * h;

      nodes.forEach((n) => {
        if (n.isCenter) return;
        const nx = n.x * w + Math.sin(t + n.radius) * 3;
        const ny = n.y * h + Math.cos(t + n.radius) * 3;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        const isSelected = selectedCategory === n.id;
        ctx.strokeStyle = isSelected ? n.color : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();
      });

      nodes.forEach((n) => {
        const nx = n.x * w + (n.isCenter ? 0 : Math.sin(t + n.radius) * 3);
        const ny = n.y * h + (n.isCenter ? 0 : Math.cos(t + n.radius) * 3);
        const isSelected = selectedCategory === n.id;

        const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.radius * (isSelected ? 3.5 : 2.5));
        gradient.addColorStop(0, n.color + (isSelected ? '77' : '33'));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nx, ny, n.radius * (isSelected ? 3.5 : 2.5), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(nx, ny, n.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
        ctx.font = n.isCenter ? '600 22px Newsreader, serif' : '500 13px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (n.isCenter) {
          ctx.fillText(n.label, nx, ny);
        } else {
          ctx.fillText(`${n.label} ${n.count}`, nx, ny + n.radius + 10);
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [viewMode, selectedCategory]);

  // Breathing modal timer loop
  useEffect(() => {
    if (!isBreathingModalOpen) return;
    let cycle = 0;
    const interval = setInterval(() => {
      cycle++;
      setBreathInstruction(cycle % 2 === 1 ? 'Hold & Gently exhale...' : 'Breathe in deeply...');
    }, 4000);
    return () => clearInterval(interval);
  }, [isBreathingModalOpen]);

  // Auto scroll chat to bottom
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageInput.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      author: 'Maya',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC6fbVph3tU_Lnf2CmAey-RpAGVQcc3iWhsolfT8TojYEo8Jj0EXlqJjnejbsR7-4IdE_Kst-5KagZslhbd7d1JdX9eM88Zgvn2XjsuDr9_1lEE4EDkhacBCI93Q0eODvtNR4P1iPQmclz3SCu7s1-m20AAVym-WPcIjx8pgZiSNngPGA3zO9GAlrB__frJbb9e4Bu1X-Y5zS1XW0c7ap54mmGw-ODLjQ1fKeexk9I',
      text,
    };

    setConversations((prev) => [...prev, newMsg]);
    setMessageInput('');

    setTimeout(() => {
      const responses = [
        'That was always such a special moment for us. I wrote about that in my leather notebook back in October 2018.',
        'You always noticed the little things, Maya. Thank you for holding onto that memory today.',
        'I remember how we laughed that afternoon. It brings such calm to look back on it with you.',
      ];
      const randomAnswer = responses[Math.floor(Math.random() * responses.length)];

      const companionMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'companion',
        author: 'Thomas',
        avatarUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCPrQZI86P-lCAqlJIQq834CG5Uw4YDsSat59s4pB003oUoGeCWd0n4JR4hbsKz_hgBzz9iol0TwRbldMKGbCQWct5gEjxoYMEdqxzEzJZ6egWSNiQf6KMJaE9Scd4tcg2OXEtKD1_Y3wXWcMWhbITSjrzx_GxKsfoG-s4ognBOH8hS6BtRwF1fHh1etk5Hw3DJaphLSdD15XMvtECGDQVG_qEsFfQC6v6hXv8I5Sg',
        text: `"${randomAnswer}"`,
        faithfulnessScore: 'Grounded in vault',
        audioSnippetLength: '0:07 snippet',
      };

      setConversations((prev) => [...prev, companionMsg]);
      speakText(randomAnswer);
    }, 800);
  };

  return (
    <div className="h-full text-slate-200 antialiased font-sans select-none overflow-hidden flex flex-col bg-[#080c14]">
      {/* MAIN HEADER */}
      <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between z-30 shrink-0 bg-[#080c14]/90 backdrop-blur-md">
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
                <span className="text-[10px] font-normal tracking-wide px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-700/40 text-cyan-300">
                  Presence
                </span>
              </h1>
            </div>
          </div>
          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

          {/* VIEW SWITCHER PILL */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-full p-1 text-xs">
            <button
              onClick={() => setViewMode('mindmap')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition font-medium ${
                viewMode === 'mindmap' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Planet className="text-sm" />
              <span>Mind Map Explorer</span>
            </button>
            <button
              onClick={() => setViewMode('companion')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition font-medium ${
                viewMode === 'companion' ? 'bg-purple-950 text-purple-300 border border-purple-700/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ChatCircleText className="text-sm" />
              <span>Avatar Companion</span>
            </button>
            <Link
              href="/playground/musetalk"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full transition font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            >
              <SlidersHorizontal className="text-sm text-cyan-400" />
              <span>MuseTalk 1.5</span>
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

        {/* Privacy & Profile */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-200/90 text-xs shadow-sm">
            <ShieldCheck className="text-amber-400 text-sm" />
            <span className="font-medium tracking-tight">Private &amp; Grounded</span>
          </div>
          <button
            onClick={() => setIsBreathingModalOpen(true)}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
            title="Open 60-second breathing pause"
          >
            <Wind className="text-cyan-400" />
            <span className="hidden lg:inline">Take a breath</span>
          </button>
          <div className="relative pl-1">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-slate-700/80 cursor-pointer hover:ring-cyan-500/60 transition">
              <img
                alt="Active family user"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkM9-qFCcd6h1qbdIM3Uaaj9G2bxYFGZJ-HjNC-BgIiIJchAvfQXV8k3n2_grb8xPKhB1u78Z8gMpe2ifh7AG4fOhu8KwQsyoeS5Z2XDphOqAlVOl1LQX3GtIOFTchjKqUUssFoQcPz1LwklcurbPRP_-OiqJ2Vmg6V89Lmx3K0-0LuJlmoM70g_FTt5dl9b1st9tStS9yOG7OmkCoViQm4D5PpTmxQN4wmh36A0Q"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#080c14]"></span>
          </div>
        </div>
      </header>

      {/* APPLICATION MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT NAV RAIL */}
        <aside className="w-20 lg:w-64 border-r border-white/10 flex flex-col justify-between p-3 lg:p-4 bg-[#080c14]/60 z-20 shrink-0">
          <div className="space-y-6">
            <div>
              <span className="hidden lg:block text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Memory Space
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('memories');
                    setViewMode('mindmap');
                  }}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition group ${
                    activeTab === 'memories'
                      ? 'bg-slate-800/80 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Graph className="text-xl text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div className="hidden lg:block text-left leading-tight">
                    <p className="text-sm font-medium text-slate-100">Memories</p>
                    <p className="text-[11px] text-slate-400">Timeline &amp; Mind Map</p>
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
                    <p className="text-[11px] text-slate-400">{uploadedAudioVault.length + 12} Verified recordings</p>
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
                    <p className="text-[11px] text-slate-400">{uploadedPhotos.length + 80} Scanned photos</p>
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
                    <p className="text-[11px] text-slate-400">4 Circle members</p>
                  </div>
                </button>
              </nav>
            </div>

            <div className="hidden lg:block pt-3 border-t border-white/10">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-300">Memory Integrity</span>
                  <span className="text-[10px] text-cyan-400 font-mono">98.4% grounded</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-1.5 rounded-full" style={{ width: '98%' }}></div>
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
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 bg-[#080c14]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h2 className="text-2xl font-serif text-slate-100">Photos &amp; Keepsakes</h2>
                <p className="text-xs text-slate-400">{uploadedPhotos.length + 80} Scanned photos &amp; visual memories</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-lg"
              >
                <UploadSimple className="text-base" />
                <span>Upload Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="glass-card-interactive rounded-2xl overflow-hidden group border border-slate-800">
                  <div className="h-40 relative overflow-hidden bg-slate-950">
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-slate-200 truncate">{photo.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{photo.date}</span>
                      <span>{photo.size || 'Image'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        ) : activeTab === 'family' ? (
          /* CONNECTED CIRCLE & FAMILY INVITATION MANAGEMENT VIEW */
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 bg-[#080c14]">
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
                Send a secure invitation link to collaborate on Thomas&apos;s memory vault.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!inviteEmailInput) return;
                  const newInvite = {
                    id: `invite-${Date.now()}`,
                    email: inviteEmailInput,
                    role: inviteRoleInput,
                    sentAt: 'Invite sent just now',
                  };
                  setPendingInvites((prev) => [newInvite, ...prev]);
                  setInviteSuccessNotice(`Invitation sent to ${inviteEmailInput}!`);
                  setInviteEmailInput('');
                  setTimeout(() => setInviteSuccessNotice(''), 3000);
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <select
                  value={inviteRoleInput}
                  onChange={(e) => setInviteRoleInput(e.target.value as any)}
                  className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Contributor">Contributor (Can add memories)</option>
                  <option value="Viewer">Viewer (Read-only)</option>
                </select>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-semibold shadow transition whitespace-nowrap"
                >
                  Send Invite
                </button>
              </form>

              {inviteSuccessNotice && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle className="text-emerald-400 shrink-0" />
                  <span>{inviteSuccessNotice}</span>
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
                            onClick={() => {
                              setInviteSuccessNotice(`Resent invite to ${invite.email}`);
                              setTimeout(() => setInviteSuccessNotice(''), 2500);
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => {
                              setPendingInvites((prev) => prev.filter((i) => i.id !== invite.id));
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
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
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
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
                              : 'bg-purple-950/60 border-purple-800/40 text-purple-300'
                          }`}
                        >
                          {member.role}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                          {member.joinedAt}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${member.name} from this memory circle?`)) {
                              setCircleMembers((prev) => prev.filter((m) => m.id !== member.id));
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                          title="Remove member"
                        >
                          <Trash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        ) : activeTab === 'audio' ? (
          /* AUDIO VOICE VAULT LIST VIEW */
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 bg-[#080c14]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h2 className="text-2xl font-serif text-slate-100">Audio Voice Vault</h2>
                <p className="text-xs text-slate-400">{uploadedAudioVault.length + 12} Verified voice recordings</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition shadow-lg"
              >
                <UploadSimple className="text-base" />
                <span>Upload Voice Note</span>
              </button>
            </div>

            <div className="space-y-3 max-w-3xl">
              {uploadedAudioVault.map((audio) => (
                <div key={audio.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-slate-700 transition">
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => {
                        if (audio.url) {
                          setActiveAudioUrl(audio.url);
                          setActiveAudioTitle(audio.title);
                          setViewMode('companion');
                          playAuthenticVoiceAudio(audio.url);
                        } else {
                          speakText(audio.title);
                        }
                      }}
                      className="w-10 h-10 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center text-lg transition"
                      title="Play in Avatar Companion"
                    >
                      <Play />
                    </button>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{audio.title}</p>
                      <span className="text-xs text-slate-400 font-mono">Recorded {audio.date} • Grounded in vault</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveAudioUrl(audio.url || null);
                        setActiveAudioTitle(audio.title);
                        setViewMode('companion');
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                    >
                      Attach to Avatar
                    </button>
                    {audio.url && (
                      <audio controls src={audio.url} className="h-8 max-w-xs" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>
        ) : viewMode === 'mindmap' ? (
          /* MIND MAP CONSTELLATION EXPLORER VIEW */
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#080c14]">
            <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between z-10 shrink-0">
              <div>
                <h2 className="text-2xl font-serif text-slate-100 tracking-wide font-normal">Mind Map</h2>
                <p className="text-xs text-slate-400">25 memories</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your memories"
                    className="bg-slate-900/90 border border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-700 w-56"
                  />
                </div>

                <button
                  onClick={() => setViewMode('companion')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
                >
                  <ListIcon className="text-sm" />
                  <span>List</span>
                </button>

                <button
                  onClick={() => setViewMode('companion')}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/40 transition"
                >
                  <Sparkle className="text-sm" />
                  <span>Talk on the map</span>
                </button>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <canvas ref={mindmapCanvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

              <div className="absolute bottom-6 right-6 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-300">
                <button className="p-2 hover:bg-slate-800 hover:text-white border-b border-slate-800 text-xs">
                  <Plus />
                </button>
                <button className="p-2 hover:bg-slate-800 hover:text-white border-b border-slate-800 text-xs">
                  <Minus />
                </button>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 hover:bg-slate-800 hover:text-white text-xs"
                  title="Reset view"
                >
                  <Target />
                </button>
              </div>
            </div>
          </main>
        ) : (
          /* AVATAR COMPANION SESSION VIEW WITH FACE LIP-SYNC & VOICE TALK BACK */
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto lg:overflow-hidden relative bg-gradient-to-b from-transparent to-[#080c14]/80">
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-28 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <section className="flex flex-col items-center justify-center pt-6 pb-2 px-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/70 mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-xs font-medium text-slate-300">
                  Grandfather Thomas • <span className="text-slate-400 font-normal">Born 1944</span>
                </span>
                <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Warm Persona</span>
              </div>

              {/* DYNAMIC AVATAR PORTRAIT WITH FACIAL MOTION, AUTHENTIC VOICE, OR MUSETALK VIDEO */}
              <div className="relative mb-4 flex flex-col items-center">
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
                  title="Click to change portrait photo"
                >
                  <div
                    className={`relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-slate-900/60 shadow-2xl bg-slate-950 transition-transform duration-150 ${
                      isSpeaking ? 'scale-[1.03]' : 'scale-100'
                    }`}
                  >
                    {museTalkVideoUrl ? (
                      <video
                        key={museTalkVideoUrl}
                        src={museTalkVideoUrl}
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <img
                          alt="Thomas - Empathic Memory Avatar"
                          className="w-full h-full object-cover object-top filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
                          src={activePortraitUrl}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14]/80 via-transparent to-cyan-500/10 pointer-events-none"></div>

                        {/* VISIBLE MOUTH VISEME LIP-SYNC OVERLAY (DRIVEN BY AUTHENTIC AUDIO RMS) */}
                        <div
                          className="absolute bottom-[23%] left-[49%] -translate-x-1/2 pointer-events-none transition-all duration-75 flex items-center justify-center z-20"
                          style={{
                            width: `${26 + mouthScale * 9}px`,
                            height: `${Math.max(4, 20 * mouthScale)}px`,
                            opacity: isSpeaking && mouthScale > 0.05 ? 0.95 : 0,
                          }}
                        >
                          <div
                            className="w-full h-full rounded-[45%] bg-[#1a0a08] border border-[#3b1712] shadow-inner"
                            style={{
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.85)',
                              transform: `scaleY(${0.7 + mouthScale * 0.7}) scaleX(${0.9 + mouthScale * 0.25})`,
                            }}
                          ></div>
                        </div>
                      </>
                    )}

                    {/* HOVER OVERLAY: CHANGE PORTRAIT PHOTO */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white z-30">
                      <Camera className="text-2xl text-cyan-400 mb-1" />
                      <span className="text-[11px] font-semibold tracking-wide">Change Face Photo</span>
                      <span className="text-[9px] text-slate-300">Click to upload</span>
                    </div>

                    <div
                      className={`absolute inset-0 border-2 border-cyan-400/60 rounded-full pointer-events-none transition-opacity duration-150 ${
                        isSpeaking ? 'opacity-100 animate-pulse' : 'opacity-0'
                      }`}
                    ></div>
                  </div>
                </div>

                {avatarUploadNotice && (
                  <div className="mt-1 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-600/40 text-cyan-200 text-[11px] flex items-center gap-1.5 shadow-lg animate-fade-in">
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
                    title={activeAudioUrl ? 'Playing authentic uploaded voice recording' : 'Play voice sample'}
                  >
                    {isSpeaking ? <Pause className="text-amber-400" /> : <Play className={activeAudioUrl ? 'text-amber-400' : 'text-cyan-400'} />}
                    <span>{isSpeaking ? 'Pause Audio' : activeAudioUrl ? 'Play Real Voice' : 'Play Voice Sample'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className={activeAudioUrl ? 'text-amber-400' : 'text-emerald-400'} />
                    <span className="text-[11px] truncate max-w-[210px]">
                      {activeAudioUrl ? activeAudioTitle : 'Audio: Verified 2018 Voicemail'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Conversation Stream */}
            <section className="flex-1 flex flex-col justify-end px-4 lg:px-8 pb-5 max-w-3xl w-full mx-auto relative z-10">
              <div className="space-y-4 mb-4 overflow-y-auto max-h-[280px] lg:max-h-[300px] pr-2">
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/20 text-[11px] text-cyan-300 shadow-sm">
                    <Bookmark className="text-cyan-400" />
                    <span>[Grounded in: Summer Trip 2018 audio note &amp; diary page #42]</span>
                  </div>
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
                        <img alt={msg.author} className="w-full h-full object-cover" src={msg.avatarUrl} />
                      </div>
                      <div className="glass-panel rounded-2xl rounded-tl-sm p-4 max-w-xl shadow-xl space-y-2 border-slate-700/60">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-white/5">
                          <span className="flex items-center gap-1 text-slate-300 font-medium">
                            <Sparkle className="text-amber-400" /> {msg.author}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400">
                            {msg.faithfulnessScore || 'Faithfulness: 100% verified'}
                          </span>
                        </div>
                        <p className="text-sm sm:text-[15px] leading-relaxed text-slate-100 font-sans">{msg.text}</p>
                        <div className="pt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => speakText(msg.text)}
                              className="w-7 h-7 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs transition"
                              title="Listen out loud with face lip-sync"
                            >
                              {isSpeaking ? <Pause className="text-amber-400" /> : <SpeakerHigh />}
                            </button>
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-2 bg-cyan-400/80 rounded-full animate-pulse"></span>
                              <span className="w-1 h-3 bg-cyan-400/80 rounded-full animate-pulse"></span>
                              <span className="w-1 h-1.5 bg-cyan-400/80 rounded-full animate-pulse"></span>
                              <span className="w-1 h-4 bg-cyan-400/80 rounded-full animate-pulse"></span>
                              <span className="w-1 h-2 bg-cyan-400/80 rounded-full animate-pulse"></span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">{msg.audioSnippetLength || '0:09 snippet'}</span>
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

              {/* Chat Input & Attachment Handler */}
              <div className="glass-panel p-2 rounded-2xl border border-slate-700/80 shadow-2xl relative">
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
                        : "Speak or type a thought... (e.g., 'What was your favorite song back then?')"
                    }
                    className="w-full bg-transparent border-0 text-sm text-slate-100 placeholder-slate-400 focus:ring-0 focus:outline-none px-2 py-1"
                  />

                  <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 rounded-lg px-2 py-1 text-[11px] text-slate-400 border border-slate-800 shrink-0">
                    <span className="text-slate-500">Mode:</span>
                    <span className="text-cyan-300 font-medium">Original Vault</span>
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

        {/* RIGHT PANEL */}
        <aside className="w-80 lg:w-96 border-l border-white/10 bg-[#080c14]/90 p-4 lg:p-5 flex flex-col justify-between overflow-y-auto shrink-0 z-20">
          {viewMode === 'mindmap' ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h3 className="text-xl font-serif text-slate-100">Your memories</h3>
                    <p className="text-xs text-slate-400">25 memories</p>
                  </div>
                  <button onClick={() => setViewMode('companion')} className="text-slate-400 hover:text-white">
                    <X className="text-base" />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
                  {categoriesList.filter((cat) => !selectedCategory || selectedCategory === cat.id).map((cat) => (
                    <div key={cat.id} className="space-y-1.5">
                      <button
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-200 w-full text-left py-1 hover:text-cyan-300"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono ml-auto">{cat.count}</span>
                      </button>

                      <div className="pl-4 space-y-1.5 border-l border-white/5">
                        {cat.items
                          .filter((item) => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-slate-900/80 cursor-pointer text-slate-300 transition group"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                <span className="truncate group-hover:text-slate-100">{item.title}</span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono shrink-0 pl-2">{item.date}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 mt-auto">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 bg-slate-900/40 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition"
                >
                  <Plus className="text-sm" />
                  <span>Add Files</span>
                </button>
              </div>
            </div>
          ) : (
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
                  You are revisiting peaceful outdoor memories from 2018. Holding onto Thomas&apos;s appreciation for quiet nature
                  moments can anchor your own week.
                </p>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px]">
                    Emotional Tone: <strong className="text-cyan-300 font-normal">Nostalgic &amp; Soothing</strong>
                  </span>
                  <button className="text-purple-300 hover:text-purple-200 text-[11px] underline">Log to Journal</button>
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
          )}
        </aside>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full rounded-3xl p-6 border border-cyan-500/30 text-center relative shadow-2xl">
            <button
              onClick={() => setIsBreathingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              <X />
            </button>
            <div className="py-4 flex flex-col items-center">
              <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                <div className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 border border-cyan-400 animate-breathe"></div>
                <span className="relative z-10 text-base font-medium text-cyan-200 tracking-wide">{breathInstruction}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Grounded in the Present</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">Take 4 slow breaths. Feel your feet resting on the floor.</p>
            </div>
            <button
              onClick={() => setIsBreathingModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white transition"
            >
              Return to Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
