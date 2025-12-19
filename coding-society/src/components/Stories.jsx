import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Eye,
  Share,
  Download,
  Flag,
  UserPlus,
  UserMinus
} from 'lucide-react';

const StoryViewer = ({ stories, initialStoryIndex = 0, onClose, currentUser }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const currentStory = stories[currentStoryIndex];
  const currentSlide = currentStory?.slides[currentSlideIndex];
  const totalSlides = currentStory?.slides.length || 0;

  const STORY_DURATION = 15000; // 15 seconds per slide
  const REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥'];

  // Progress tracking
  useEffect(() => {
    if (!isPlaying || !currentSlide) return;

    const startTime = Date.now();
    const duration = currentSlide.type === 'video' ? 
      (videoRef.current?.duration * 1000 || STORY_DURATION) : 
      STORY_DURATION;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setProgress(progress);

      if (progress >= 100) {
        nextSlide();
      }
    }, 100);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentSlideIndex, currentStoryIndex, isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          previousSlide();
          break;
        case 'ArrowRight':
          nextSlide();
          break;
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const nextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setProgress(0);
    } else {
      nextStory();
    }
  };

  const previousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setProgress(0);
    } else {
      previousStory();
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentSlideIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentSlideIndex(0);
      setProgress(0);
    }
  };

  const handleReaction = (reaction) => {
    // Send reaction to backend
    console.log('Reaction sent:', reaction);
    setShowReactionPicker(false);
  };

  const handleReply = () => {
    if (replyText.trim()) {
      // Send reply to backend
      console.log('Reply sent:', replyText);
      setReplyText('');
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Send follow/unfollow request to backend
  };

  if (!currentStory || !currentSlide) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      >
        {/* Story Content */}
        <div className="relative w-full max-w-md h-full max-h-screen bg-black">
          {/* Progress Bars */}
          <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
            {currentStory.slides.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{
                    width: index < currentSlideIndex ? '100%' : 
                           index === currentSlideIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Story Header */}
          <div className="absolute top-16 left-4 right-4 z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentStory.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentStory.user.username}`}
                alt={currentStory.user.name}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <div>
                <h3 className="text-white font-semibold text-sm">
                  {currentStory.user.name}
                </h3>
                <p className="text-white/70 text-xs">
                  {new Date(currentSlide.createdAt).toLocaleTimeString()}
                </p>
              </div>
              {currentStory.user._id !== currentUser?._id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFollow}
                  className={`ml-2 h-6 px-2 text-xs ${
                    isFollowing 
                      ? 'bg-white/20 text-white hover:bg-white/30' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-3 h-3 mr-1" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {currentSlide.type === 'video' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Story Media */}
          <div className="relative w-full h-full flex items-center justify-center">
            {currentSlide.type === 'image' ? (
              <img
                src={currentSlide.media}
                alt="Story"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                src={currentSlide.media}
                className="w-full h-full object-cover"
                autoPlay={isPlaying}
                muted={isMuted}
                loop={false}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                  }
                }}
              />
            )}

            {/* Navigation Areas */}
            <button
              className="absolute left-0 top-0 w-1/3 h-full z-10"
              onClick={previousSlide}
            />
            <button
              className="absolute right-0 top-0 w-1/3 h-full z-10"
              onClick={nextSlide}
            />
            <button
              className="absolute center top-0 w-1/3 h-full z-10"
              onClick={() => setIsPlaying(!isPlaying)}
            />
          </div>

          {/* Story Text */}
          {currentSlide.text && (
            <div className="absolute bottom-32 left-4 right-4 z-20">
              <p className="text-white text-lg font-medium leading-tight drop-shadow-lg">
                {currentSlide.text}
              </p>
            </div>
          )}

          {/* Story Actions */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="flex items-center justify-between">
              {/* Reaction Button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Heart className="w-5 h-5" />
                </Button>
                
                {showReactionPicker && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute bottom-full left-0 mb-2 bg-white/90 backdrop-blur-sm rounded-full p-2 flex gap-1"
                  >
                    {REACTIONS.map((reaction, index) => (
                      <button
                        key={index}
                        onClick={() => handleReaction(reaction)}
                        className="text-xl hover:scale-125 transition-transform duration-200 p-1"
                      >
                        {reaction}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Reply Input */}
              <div className="flex-1 mx-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <input
                    type="text"
                    placeholder="Reply to story..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                    className="flex-1 bg-transparent text-white placeholder:text-white/70 outline-none text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="text-white hover:bg-white/20 p-1 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
              >
                <Share className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Arrows */}
          {currentStoryIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={previousStory}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-2 z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          
          {currentStoryIndex < stories.length - 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={nextStory}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-2 z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* Story Thumbnails */}
        <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 space-y-4">
          {stories.map((story, index) => (
            <button
              key={story._id}
              onClick={() => {
                setCurrentStoryIndex(index);
                setCurrentSlideIndex(0);
                setProgress(0);
              }}
              className={`block w-16 h-16 rounded-full border-2 overflow-hidden transition-all ${
                index === currentStoryIndex 
                  ? 'border-white scale-110' 
                  : 'border-white/50 hover:border-white/70'
              }`}
            >
              <img
                src={story.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.user.username}`}
                alt={story.user.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const StoriesStrip = ({ stories, onStoryClick, onCreateStory, currentUser }) => {
  const [showCreateStory, setShowCreateStory] = useState(false);

  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide py-4">
      {/* Create Story Button */}
      <button
        onClick={onCreateStory}
        className="flex-shrink-0 relative group"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            <img
              src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`}
              alt="Your Story"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-white text-sm font-bold">+</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1 text-center">Your Story</p>
      </button>

      {/* Story Items */}
      {stories.map((story, index) => (
        <button
          key={story._id}
          onClick={() => onStoryClick(index)}
          className="flex-shrink-0 relative group"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white p-0.5">
              <img
                src={story.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.user.username}`}
                alt={story.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-1 text-center max-w-16 truncate">
            {story.user.name}
          </p>
          
          {/* Unread indicator */}
          {!story.viewed && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border border-white" />
          )}
        </button>
      ))}
    </div>
  );
};

export { StoryViewer, StoriesStrip };