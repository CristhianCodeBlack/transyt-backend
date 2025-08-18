import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

const VideoPlayer = ({ modulo, submodulo, onVideoComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  
  const videoRef = useRef(null);

  const videoUrl = submodulo?.contenido || `http://localhost:8080/api/modulos/${modulo?.id}/preview`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);
      
      // Solo permitir avanzar hasta donde ya se ha visto + 10 segundos
      if (current > maxWatchedTime + 10) {
        video.currentTime = maxWatchedTime;
        return;
      }
      
      // Actualizar el tiempo máximo visto
      if (current > maxWatchedTime) {
        setMaxWatchedTime(current);
      }
      
      // Verificar si el video se completó (90% o más)
      if (video.duration > 0 && current >= video.duration * 0.9 && !videoCompleted) {
        setVideoCompleted(true);
        if (onVideoComplete) {
          onVideoComplete();
        }
      }
    };

    const handleSeeking = () => {
      // Prevenir adelantar más allá del tiempo máximo visto
      if (video.currentTime > maxWatchedTime + 10) {
        video.currentTime = maxWatchedTime;
      }
    };

    const handleEnded = () => {
      if (!videoCompleted) {
        setVideoCompleted(true);
        if (onVideoComplete) {
          onVideoComplete();
        }
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('ended', handleEnded);
    };
  }, [maxWatchedTime, onVideoComplete, videoCompleted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (video && video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    if (!video) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickTime = (clickX / rect.width) * duration;
    
    // Solo permitir ir a un tiempo que ya se ha visto
    if (clickTime <= maxWatchedTime + 5) {
      video.currentTime = clickTime;
    }
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden relative group">
      <video
        ref={videoRef}
        className="w-full h-auto max-h-96"
        controls={false}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onContextMenu={(e) => e.preventDefault()} // Prevenir menú contextual
        controlsList="nodownload nofullscreen noremoteplayback" // Deshabilitar controles nativos
      >
        <source src={videoUrl} type={modulo.tipoMime} />
        Tu navegador no soporta la reproducción de video.
      </video>

      {/* Custom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Progress Bar */}
        <div className="mb-3">
          <div 
            className="w-full h-2 bg-white/30 rounded-full cursor-pointer relative"
            onClick={handleProgressClick}
          >
            {/* Watched Progress */}
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(maxWatchedTime / duration) * 100}%` }}
            />
            {/* Current Position */}
            <div 
              className="h-full bg-white rounded-full absolute top-0 left-0 transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span className={`${videoCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
              {videoCompleted ? '✓ Completado' : 'En progreso'}
            </span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            
            <span className="text-sm text-white/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">

            
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Play button overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors"
          >
            <Play className="h-8 w-8 ml-1" />
          </button>
        </div>
      )}
      
      {/* Anti-skip overlay */}
      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
        🔒 Video protegido
      </div>
    </div>
  );
};

export default VideoPlayer;