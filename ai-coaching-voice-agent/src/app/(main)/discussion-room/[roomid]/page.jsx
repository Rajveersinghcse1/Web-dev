"use client"
import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { CoachingExpert } from '@/services/Options';
import Image from 'next/image';
import { 
    getToken, 
    AIModel, 
    ConvertTextToSpeech, 
    stopSpeaking,
    isSpeechRecognitionSupported,
    createWebSpeechRecognition,
    checkPythonServer,
    getNetworkStatus,
    exportConversationPDF
} from '@/services/GlobalServices';
import { Button } from '@/components/ui/button';
import { 
    Loader2Icon, 
    Mic, 
    MicOff, 
    Volume2,
    VolumeX,
    Settings,
    Download,
    Wifi,
    WifiOff,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Headphones,
    MessageSquare,
    Sparkles,
    X,
    Maximize2,
    Minimize2,
    FileText
} from 'lucide-react';
import { RealtimeTranscriber } from 'assemblyai';
import RecordRTC from 'recordrtc';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { UserContext } from '@/app/AuthProvider';
import { api } from '@/convex/_generated/api';
import ChatBox from './_components/ChatBox';
import NotesPanel from './_components/NotesPanel';
import SettingsPanel from './_components/SettingsPanel';
import Webcam from 'react-webcam';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { useRecommendationsStore } from '@/lib/aiRecommendations';

// Speech recognition mode
const STT_MODE = {
    ASSEMBLYAI: 'assemblyai',
    WEB_SPEECH: 'web-speech',
    NONE: 'none'
};

function DiscussRoom() {
    const router = useRouter();
    const { roomid } = useParams();
    const { userData, setUserData } = useContext(UserContext);
    const { learningProfile } = useRecommendationsStore();
    
    // Only query if roomid is a valid Convex ID format (starts with letters)
    const isValidConvexId = roomid && /^[a-z]/i.test(roomid);
    const DiscussionRoomData = useQuery(
        api.DiscussionRoom.GetDiscussionRoomData, 
        isValidConvexId ? { id: roomid } : "skip"
    );
    
    // Core state
    const [expert, setExpert] = useState();
    const [enableMic, setEnableMic] = useState(false);
    const [transcribe, setTranscribe] = useState('');
    const [enableFeedbackNotes, setEnableFeedbackNotes] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [conversation, setConversation] = useState([]);
    
    // Advanced state
    const [sttMode, setSttMode] = useState(STT_MODE.NONE);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'notes', 'settings'
    const [serviceStatus, setServiceStatus] = useState({
        network: true,
        assemblyAI: null,
        pythonTTS: null
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);

    // Refs
    const recorder = useRef(null);
    const realtimeTranscriber = useRef(null);
    const webSpeechRecognition = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const textsRef = useRef({});
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const processingRef = useRef(false);
    const conversationRef = useRef([]);
    const sessionStartTimeRef = useRef(null);

    // Session tracking
    const { trackSessionStart, trackSessionComplete } = useSessionTracking();

    // Mutations
    const UpdateConversation = useMutation(api.DiscussionRoom.UpdateConversation);
    const updateUserToken = useMutation(api.users.UpdateUserToken);

    // Keep conversation ref in sync
    useEffect(() => {
        conversationRef.current = conversation;
    }, [conversation]);

    // Initialize on mount
    useEffect(() => {
        checkServices();
    }, []);

    // Load expert and existing conversation
    useEffect(() => {
        if (DiscussionRoomData) {
            const Expert = CoachingExpert.find(item => item.name === DiscussionRoomData.expertName);
            setExpert(Expert);
            
            if (DiscussionRoomData.conversation?.length > 0) {
                setConversation(DiscussionRoomData.conversation);
            }
        }
    }, [DiscussionRoomData]);

    // Check available services
    const checkServices = async () => {
        const network = getNetworkStatus();
        setServiceStatus(prev => ({ ...prev, network: network.online }));

        // Check Python TTS
        const pythonAvailable = await checkPythonServer();
        setServiceStatus(prev => ({ ...prev, pythonTTS: pythonAvailable }));

        // Check AssemblyAI
        try {
            await getToken();
            setServiceStatus(prev => ({ ...prev, assemblyAI: true }));
        } catch {
            setServiceStatus(prev => ({ ...prev, assemblyAI: false }));
        }
    };

    // Save conversation to database
    const saveConversation = useCallback(async (conv) => {
        if (conv.length > 0 && DiscussionRoomData?._id) {
            try {
                await UpdateConversation({
                    id: DiscussionRoomData._id,
                    conversation: conv
                });
                console.log('✓ Conversation saved');
            } catch (error) {
                console.error('Save error:', error);
            }
        }
    }, [DiscussionRoomData?._id, UpdateConversation]);

    // Process AI response when user sends a message
    const processUserMessage = useCallback(async (userMessage) => {
        if (processingRef.current) return;
        processingRef.current = true;
        setIsProcessing(true);

        try {
            const currentConv = [...conversationRef.current, userMessage];
            
            // Get AI response
            const aiResponse = await AIModel(
                DiscussionRoomData?.topic,
                DiscussionRoomData?.coachingOption,
                currentConv.slice(-10), // Last 10 messages for context
                learningProfile
            );

            const newConversation = [...currentConv, aiResponse];
            setConversation(newConversation);
            
            // Save to database
            await saveConversation(newConversation);

            // Speak the response if voice is enabled
            if (voiceEnabled) {
                await ConvertTextToSpeech(
                    aiResponse.content,
                    () => setIsSpeaking(true),
                    () => setIsSpeaking(false)
                );
            }
        } catch (error) {
            console.error('AI Error:', error);
            toast.error('Failed to get AI response');
        } finally {
            processingRef.current = false;
            setIsProcessing(false);
        }
    }, [DiscussionRoomData?.topic, DiscussionRoomData?.coachingOption, voiceEnabled, saveConversation]);

    // Handle transcribed text
    const handleTranscribedText = useCallback(async (text) => {
        if (!text?.trim()) return;

        const userMessage = { role: 'user', content: text.trim() };
        
        // Update conversation immediately with user message
        const updatedConv = [...conversationRef.current, userMessage];
        setConversation(updatedConv);
        setTranscribe('');
        textsRef.current = {};

        // Save user message
        await saveConversation(updatedConv);

        // Update token count
        updateUserTokenCount(text);

        // Process with AI
        await processUserMessage(userMessage);
    }, [saveConversation, processUserMessage]);

    // Update user tokens
    const updateUserTokenCount = async (text) => {
        if (!userData?._id) return;
        
        const wordCount = text?.trim()?.split(/\s+/).length || 0;
        const newCredits = Math.max(0, Number(userData.credits) - wordCount);

        try {
            await updateUserToken({
                id: userData._id,
                credits: newCredits
            });
            setUserData(prev => ({ ...prev, credits: newCredits }));
        } catch (error) {
            console.error('Token update error:', error);
        }
    };

    // Connect with AssemblyAI
    const connectAssemblyAI = async () => {
        try {
            const token = await getToken();
            
            realtimeTranscriber.current = new RealtimeTranscriber({
                token: token,
                sampleRate: 16000
            });

            realtimeTranscriber.current.on('transcript', (transcript) => {
                if (transcript.message_type === 'FinalTranscript' && transcript.text?.trim()) {
                    handleTranscribedText(transcript.text);
                } else if (transcript.message_type === 'PartialTranscript') {
                    textsRef.current[transcript.audio_start] = transcript.text;
                    const sortedKeys = Object.keys(textsRef.current).sort((a, b) => a - b);
                    const partialText = sortedKeys.map(k => textsRef.current[k]).join(' ');
                    setTranscribe(partialText.trim());
                }
            });

            realtimeTranscriber.current.on('error', (error) => {
                console.error('AssemblyAI error:', error);
                toast.error('Transcription error - switching to fallback');
                fallbackToWebSpeech();
            });

            realtimeTranscriber.current.on('close', (code, reason) => {
                console.log('AssemblyAI closed:', code, reason);
                if (enableMic && code !== 1000) {
                    fallbackToWebSpeech();
                }
            });

            await realtimeTranscriber.current.connect();
            return true;
        } catch (error) {
            console.error('AssemblyAI connection failed:', error);
            return false;
        }
    };

    // Fallback to Web Speech API
    const fallbackToWebSpeech = () => {
        if (!isSpeechRecognitionSupported()) {
            toast.error('Speech recognition not supported in this browser');
            return false;
        }

        try {
            webSpeechRecognition.current = createWebSpeechRecognition({
                continuous: true,
                interimResults: true,
                lang: 'en-US'
            });

            webSpeechRecognition.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    handleTranscribedText(finalTranscript);
                } else if (interimTranscript) {
                    setTranscribe(interimTranscript);
                }
            };

            webSpeechRecognition.current.onerror = (event) => {
                console.error('Web Speech error:', event.error);
                if (event.error !== 'no-speech') {
                    toast.error('Speech recognition error: ' + event.error);
                }
            };

            webSpeechRecognition.current.onend = () => {
                if (enableMic && sttMode === STT_MODE.WEB_SPEECH) {
                    webSpeechRecognition.current?.start();
                }
            };

            webSpeechRecognition.current.start();
            setSttMode(STT_MODE.WEB_SPEECH);
            toast.info('Using browser speech recognition');
            return true;
        } catch (error) {
            console.error('Web Speech API failed:', error);
            return false;
        }
    };

    // Start audio recording for AssemblyAI
    const startAudioRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                } 
            });

            // Setup audio level monitoring
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            
            // Monitor audio levels
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            const updateLevel = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(Math.min(100, average * 2));
                if (enableMic) requestAnimationFrame(updateLevel);
            };
            updateLevel();

            recorder.current = new RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm;codecs=pcm',
                recorderType: RecordRTC.StereoAudioRecorder,
                timeSlice: 250,
                desiredSampRate: 16000,
                numberOfAudioChannels: 1,
                bufferSize: 4096,
                audioBitsPerSecond: 128000,
                ondataavailable: async (blob) => {
                    if (!realtimeTranscriber.current) return;
                    try {
                        const buffer = await blob.arrayBuffer();
                        realtimeTranscriber.current.sendAudio(buffer);
                    } catch (err) {
                        console.error('Audio send error:', err);
                    }
                }
            });

            recorder.current.startRecording();
            return true;
        } catch (error) {
            console.error('Audio recording error:', error);
            toast.error('Microphone access denied');
            return false;
        }
    };

    // Connect to speech services
    const connectToServer = async () => {
        setLoading(true);
        stopSpeaking();

        try {
            // Start session tracking
            sessionStartTimeRef.current = Date.now();
            trackSessionStart({
                mode: DiscussionRoomData?.coachingOption || 'Unknown',
                topic: DiscussionRoomData?.topic || 'Untitled Session',
            });

            // Try AssemblyAI first
            if (serviceStatus.assemblyAI) {
                const assemblyConnected = await connectAssemblyAI();
                if (assemblyConnected) {
                    setSttMode(STT_MODE.ASSEMBLYAI);
                    const audioStarted = await startAudioRecording();
                    if (audioStarted) {
                        setEnableMic(true);
                        toast.success('Connected! Start speaking...');
                        setLoading(false);
                        return;
                    }
                }
            }

            // Fallback to Web Speech API
            const webSpeechStarted = fallbackToWebSpeech();
            if (webSpeechStarted) {
                setEnableMic(true);
                setLoading(false);
                return;
            }

            throw new Error('No speech recognition available');
        } catch (error) {
            console.error('Connection error:', error);
            toast.error(error.message || 'Failed to connect');
            setLoading(false);
        }
    };

    // Disconnect and cleanup
    const disconnect = async () => {
        setLoading(true);
        stopSpeaking();
        setIsSpeaking(false);

        try {
            // Stop AssemblyAI
            if (realtimeTranscriber.current) {
                await realtimeTranscriber.current.close();
                realtimeTranscriber.current = null;
            }

            // Stop Web Speech
            if (webSpeechRecognition.current) {
                webSpeechRecognition.current.stop();
                webSpeechRecognition.current = null;
            }

            // Stop recording
            if (recorder.current) {
                recorder.current.stopRecording();
                recorder.current = null;
            }

            // Stop audio context
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }

            // Save final conversation
            if (conversation.length > 0) {
                await saveConversation(conversation);
            }

            // Track session completion and award XP/achievements
            if (sessionStartTimeRef.current) {
                const durationMinutes = Math.floor((Date.now() - sessionStartTimeRef.current) / 60000);
                const result = trackSessionComplete({
                    mode: DiscussionRoomData?.coachingOption || 'Unknown',
                    topic: DiscussionRoomData?.topic || 'Untitled Session',
                    durationMinutes: durationMinutes || 1, // Minimum 1 minute
                    messageCount: conversation.length,
                });

                if (result.achievementsUnlocked.length > 0) {
                    toast.success(`🎉 ${result.achievementsUnlocked.length} achievement${result.achievementsUnlocked.length > 1 ? 's' : ''} unlocked!`);
                }

                sessionStartTimeRef.current = null;
            }

            setEnableMic(false);
            setSttMode(STT_MODE.NONE);
            setTranscribe('');
            setAudioLevel(0);
            textsRef.current = {};
            
            toast.success('Session ended');
            setEnableFeedbackNotes(true);
        } catch (error) {
            console.error('Disconnect error:', error);
            toast.error('Error ending session');
        } finally {
            setLoading(false);
        }
    };

    // Export conversation
    const handleExport = async () => {
        try {
            await exportConversationPDF(
                conversation,
                DiscussionRoomData?.topic,
                DiscussionRoomData?.summery,
                DiscussionRoomData?.coachingOption
            );
            toast.success('Conversation exported!');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className={`p-4 md:p-6 transition-all ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-linear-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium mb-2">
                        <Sparkles className="w-4 h-4" />
                        {DiscussionRoomData?.coachingOption}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {DiscussionRoomData?.topic}
                    </h1>
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-2">
                    {/* Service Status */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
                        {serviceStatus.network ? (
                            <Wifi className="w-3 h-3 text-green-500" />
                        ) : (
                            <WifiOff className="w-3 h-3 text-red-500" />
                        )}
                        <span className={serviceStatus.assemblyAI ? 'text-green-600' : 'text-gray-400'}>
                            STT
                        </span>
                        <span className={serviceStatus.pythonTTS ? 'text-green-600' : 'text-gray-400'}>
                            TTS
                        </span>
                    </div>

                    {/* Voice Toggle */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className="rounded-full"
                    >
                        {voiceEnabled ? (
                            <Volume2 className="w-4 h-4 text-purple-600" />
                        ) : (
                            <VolumeX className="w-4 h-4 text-gray-400" />
                        )}
                    </Button>

                    {/* Export */}
                    {conversation.length > 0 && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleExport}
                            className="rounded-full"
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                    )}

                    {/* Fullscreen */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleFullscreen}
                        className="rounded-full"
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </Button>

                    {/* Settings */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setActiveTab('settings')}
                        className={`rounded-full ${activeTab === 'settings' ? 'bg-purple-100 text-purple-600' : ''}`}
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Main Video/Avatar Section */}
                <div className='lg:col-span-2'>
                    <div className='h-[55vh] md:h-[60vh] bg-linear-to-br from-slate-100 via-purple-50 to-pink-50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-lg'>
                        {/* Background Effects */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-purple-200/40 to-transparent rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-pink-200/40 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
                            
                            {/* Audio visualization rings */}
                            {enableMic && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div 
                                        className="absolute rounded-full border-2 border-purple-300/50 animate-ping"
                                        style={{ 
                                            width: `${180 + audioLevel}px`, 
                                            height: `${180 + audioLevel}px`,
                                            animationDuration: '2s'
                                        }}
                                    />
                                    <div 
                                        className="absolute rounded-full border-2 border-pink-300/30 animate-ping"
                                        style={{ 
                                            width: `${220 + audioLevel}px`, 
                                            height: `${220 + audioLevel}px`,
                                            animationDuration: '3s'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Expert Avatar */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className={`relative transition-all duration-500 ${isSpeaking ? 'scale-105' : ''}`}>
                                {/* Glow effect */}
                                <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${
                                    isSpeaking 
                                        ? 'bg-linear-to-r from-purple-500/60 to-pink-500/60 scale-125 animate-pulse' 
                                        : enableMic 
                                            ? 'bg-linear-to-r from-green-400/50 to-emerald-400/50 scale-110' 
                                            : 'bg-gray-300/40 scale-100'
                                }`}></div>
                                
                                {expert?.avatar && (
                                    <Image 
                                        src={expert.avatar} 
                                        alt='AI Coach Avatar' 
                                        width={160} 
                                        height={160}
                                        className='relative h-32 w-32 md:h-40 md:w-40 rounded-full object-cover ring-4 ring-white shadow-2xl transition-transform duration-500'
                                    />
                                )}

                                {/* Audio level indicator */}
                                {enableMic && (
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <div 
                                                    key={i}
                                                    className={`w-1 rounded-full transition-all duration-100 ${
                                                        audioLevel > i * 20 ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                                    style={{ height: `${8 + i * 3}px` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <h2 className='mt-6 text-xl font-semibold text-gray-800'>{expert?.name}</h2>
                            
                            {/* Status Badge */}
                            <div className="mt-3">
                                {isSpeaking && (
                                    <span className="inline-flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-full shadow-sm">
                                        <Volume2 className="w-4 h-4 animate-pulse" />
                                        Speaking...
                                    </span>
                                )}
                                {isProcessing && !isSpeaking && (
                                    <span className="inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full shadow-sm">
                                        <Loader2Icon className="w-4 h-4 animate-spin" />
                                        Thinking...
                                    </span>
                                )}
                                {enableMic && !isSpeaking && !isProcessing && (
                                    <span className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full shadow-sm">
                                        <Mic className="w-4 h-4" />
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Listening...
                                    </span>
                                )}
                                {!enableMic && !isSpeaking && !isProcessing && (
                                    <span className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                                        <MicOff className="w-4 h-4" />
                                        Ready to start
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Webcam */}
                        <div className='absolute bottom-4 right-4 md:bottom-6 md:right-6 rounded-xl overflow-hidden shadow-lg ring-2 ring-white/80 backdrop-blur'>
                            <Webcam 
                                height={80}
                                width={120}
                                className='rounded-xl'
                                audio={false}
                                mirrored={true}
                            />
                        </div>

                        {/* Connection Status Badge */}
                        <div className="absolute top-4 left-4 md:top-6 md:left-6">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm ${
                                enableMic 
                                    ? 'bg-green-100/80 text-green-700' 
                                    : 'bg-gray-100/80 text-gray-500'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                    enableMic ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                }`}></span>
                                {enableMic ? (
                                    <>
                                        {sttMode === STT_MODE.ASSEMBLYAI && 'AssemblyAI'}
                                        {sttMode === STT_MODE.WEB_SPEECH && 'Browser STT'}
                                    </>
                                ) : 'Disconnected'}
                            </div>
                        </div>

                        {/* STT Mode indicator */}
                        {enableMic && (
                            <div className="absolute top-4 right-4 md:top-6 md:right-6">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs">
                                    {serviceStatus.pythonTTS ? (
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                    ) : (
                                        <AlertCircle className="w-3 h-3 text-yellow-500" />
                                    )}
                                    <span className="text-gray-600">
                                        TTS: {serviceStatus.pythonTTS ? 'Server' : 'Browser'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Control Buttons */}
                    <div className='mt-5 flex items-center justify-center gap-4'>
                        {!enableMic ? (
                            <Button 
                                onClick={connectToServer} 
                                disabled={loading}
                                size="lg"
                                className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-black px-8 py-6 gap-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            >
                                {loading ? (
                                    <Loader2Icon className='w-5 h-5 animate-spin'/>
                                ) : (
                                    <Mic className='w-5 h-5'/>
                                )}
                                <span className="font-semibold">Start Session</span>
                            </Button>
                        ) : (
                            <Button 
                                variant="destructive" 
                                onClick={disconnect} 
                                disabled={loading}
                                size="lg"
                                className="px-8 py-6 gap-3 rounded-full shadow-lg hover:scale-105 transition-all"
                            > 
                                {loading ? (
                                    <Loader2Icon className='w-5 h-5 animate-spin'/>
                                ) : (
                                    <MicOff className='w-5 h-5'/>
                                )}
                                <span className="font-semibold">End Session</span>
                            </Button>
                        )}
                    </div>

                    {/* Real-time Transcript */}
                    {transcribe && (
                        <div className="mt-4 p-4 bg-white rounded-xl border border-purple-100 shadow-sm animate-fade-in">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                <p className="text-sm text-purple-600 font-medium">Listening...</p>
                            </div>
                            <p className="text-gray-700 text-lg">{transcribe}</p>
                        </div>
                    )}
                </div>

                {/* Right Panel - Tabs */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[60vh] flex flex-col overflow-hidden">
                    {/* Tab Headers */}
                    <div className="flex items-center border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'chat' 
                                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'notes' 
                                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            Notes
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'settings' 
                                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {activeTab === 'chat' && (
                            <ChatBox 
                                conversation={conversation} 
                                enableFeedbackNotes={enableFeedbackNotes}
                                coachingOption={DiscussionRoomData?.coachingOption}
                            />
                        )}

                        {activeTab === 'notes' && (
                            <NotesPanel 
                                enableFeedbackNotes={enableFeedbackNotes}
                                setEnableFeedbackNotes={setEnableFeedbackNotes}
                                conversation={conversation}
                            />
                        )}

                        {activeTab === 'settings' && (
                            <SettingsPanel 
                                sttMode={sttMode}
                                setSttMode={setSttMode}
                                voiceEnabled={voiceEnabled}
                                setVoiceEnabled={setVoiceEnabled}
                                serviceStatus={serviceStatus}
                                audioLevel={audioLevel}
                            />
                        )}
                    </div>
                </div>  
            </div>
        </div>
    );
}

export default DiscussRoom;

