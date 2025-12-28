// Type definitions for the AI Music Generator

export interface GenerationRequest {
  prompt: string;
  duration: number;
  model_size: string;
  temperature: number;
  top_k: number;
  top_p: number;
  cfg_coef: number;
  seed?: number;
  output_format: string;
}

export interface AudioEffectRequest {
  prompt: string;
  duration: number;
  temperature: number;
  output_format: string;
}

export interface GenerationResponse {
  task_id: string;
  status: string;
  message: string;
  file_path?: string;
  duration?: number;
  sample_rate?: number;
  created_at: string;
}

export interface GenerationStatus {
  task_id: string;
  status: 'queued' | 'generating' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  created_at: string;
  file_path?: string;
  error?: string;
}

export interface Preset {
  id: string;
  name: string;
  description?: string;
  category: 'music' | 'audio_effect' | 'mix';
  parameters: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  tags: string[];
  is_public: boolean;
}

export interface AudioFile {
  id: string;
  filename: string;
  file_path: string;
  duration?: number;
  sample_rate?: number;
  uploaded_at?: string;
  processed_at?: string;
  mixed_at?: string;
  effect_applied?: string;
  track_count?: number;
  status: 'ready' | 'processing' | 'failed';
}

export interface WebSocketMessage {
  type: string;
  client_id?: string;
  timestamp: string;
  [key: string]: any;
}

export interface ProgressMessage extends WebSocketMessage {
  type: 'progress';
  progress: number;
  message: string;
}

export interface GenerationCompleteMessage extends WebSocketMessage {
  type: 'generation_complete' | 'audio_generation_complete';
  prompt: string;
  duration: number;
  sample_rate: number;
  audio_shape: number[];
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'error';
  error: string;
}

export interface StatusMessage extends WebSocketMessage {
  type: 'status';
  models_ready: boolean;
  active_connections: number;
  has_active_generation: boolean;
  memory_usage?: any;
}

export interface AudioAnalysis {
  duration: number;
  sample_rate: number;
  channels: number;
  rms: number;
  peak: number;
  dynamic_range: number;
  dominant_frequency: number;
  spectral_centroid: number;
  zero_crossing_rate: number;
}

export interface ModelInfo {
  musicgen_models: string[];
  audiogen_model: string;
  default_model: string;
}

export interface GenerationStats {
  total_generations: number;
  completed: number;
  failed: number;
  in_progress: number;
  success_rate: number;
}

export interface BatchGenerationRequest {
  prompts: string[];
  duration: number;
  model_size: string;
  output_format: string;
}

export interface BatchGenerationResponse {
  batch_id: string;
  task_ids: string[];
  status: string;
  total_tasks: number;
}

export interface BatchStatus {
  batch_id: string;
  total_tasks: number;
  completed: number;
  failed: number;
  in_progress: number;
  tasks: Record<string, GenerationStatus>;
}

export interface AudioEffectConfig {
  effect_type: 'reverb' | 'eq' | 'normalize' | 'fade' | 'tempo' | 'pitch';
  parameters: Record<string, any>;
}

export interface MixRequest {
  track_ids: string[];
  gains?: number[];
  output_format: string;
}

// UI State types
export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  currentPage: string;
  isGenerating: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export interface GeneratorState {
  prompt: string;
  duration: number;
  modelSize: string;
  temperature: number;
  topK: number;
  topP: number;
  cfgCoef: number;
  seed?: number;
  outputFormat: string;
  selectedPreset?: Preset;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentTrack?: AudioFile;
  playlist: AudioFile[];
  currentIndex: number;
  isLooping: boolean;
  isShuffling: boolean;
}

export interface VisualizationData {
  frequencies: number[];
  waveform: number[];
  timeData: number[];
  volume: number;
}

// API Response types
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Form types
export interface PresetFormData {
  name: string;
  description?: string;
  category: 'music' | 'audio_effect' | 'mix';
  parameters: Record<string, any>;
  tags: string[];
  is_public: boolean;
}

export interface SettingsFormData {
  theme: 'light' | 'dark';
  autoPlay: boolean;
  defaultDuration: number;
  defaultModelSize: string;
  notificationsEnabled: boolean;
  autoSave: boolean;
  qualityPreference: 'speed' | 'balance' | 'quality';
}

// Hook return types
export interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  load: (url: string) => void;
}

export interface UseGenerationReturn {
  generate: (request: GenerationRequest) => Promise<void>;
  cancel: () => void;
  status: GenerationStatus | null;
  isGenerating: boolean;
  progress: number;
  error: string | null;
}

// Component prop types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface AudioPlayerProps {
  audioFile?: AudioFile;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

export interface WaveformProps {
  audioUrl?: string;
  isPlaying: boolean;
  onSeek?: (time: number) => void;
  height?: number;
  className?: string;
}

export interface PresetCardProps {
  preset: Preset;
  onSelect?: (preset: Preset) => void;
  onEdit?: (preset: Preset) => void;
  onDelete?: (preset: Preset) => void;
  selected?: boolean;
}

export interface GenerationFormProps {
  onGenerate: (request: GenerationRequest) => void;
  isGenerating: boolean;
  defaultValues?: Partial<GenerationRequest>;
}

export interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  className?: string;
}

// Error types
export interface APIError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Event types
export interface AudioEvent {
  type: 'play' | 'pause' | 'stop' | 'ended' | 'timeupdate' | 'loadstart' | 'loadend' | 'error';
  currentTime?: number;
  duration?: number;
  error?: string;
}

export interface GenerationEvent {
  type: 'start' | 'progress' | 'complete' | 'error' | 'cancel';
  progress?: number;
  message?: string;
  result?: any;
  error?: string;
}