import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Camera, RotateCcw, Circle, Square, Check, Sparkles } from 'lucide-react';

interface CameraStudioProps {
  mode: 'photo' | 'video';
  onClose: () => void;
  onCapture: (data: string) => void;
}

export const CameraStudio: React.FC<CameraStudioProps> = ({ mode, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsVideoReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setHasPermission(null);
    setIsVideoReady(false);
    
    // Stop any existing stream first
    stopCurrentStream();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: mode === 'video'
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got stream:', stream);
      console.log('Video tracks:', stream.getVideoTracks());
      
      streamRef.current = stream;
      
      const video = videoRef.current;
      if (video) {
        // Reset video element
        video.srcObject = null;
        
        // Set stream
        video.srcObject = stream;
        
        // Wait for metadata to load
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => {
            console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
            resolve();
          };
          video.onerror = (e) => {
            console.error('Video error:', e);
            reject(new Error('Video element error'));
          };
          // Timeout after 5 seconds
          setTimeout(() => reject(new Error('Timeout waiting for video metadata')), 5000);
        });

        // Try to play
        try {
          await video.play();
          console.log('Video playing successfully');
          setHasPermission(true);
          setIsVideoReady(true);
        } catch (playError) {
          console.error('Play error:', playError);
          // Try again with muted
          video.muted = true;
          await video.play();
          setHasPermission(true);
          setIsVideoReady(true);
        }
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(err.message || 'Erreur d\'accès à la caméra');
      setHasPermission(false);
    }
  }, [facingMode, mode, stopCurrentStream]);

  // Start camera on mount and when facingMode changes
  useEffect(() => {
    if (!capturedMedia) {
      startCamera();
    }

    return () => {
      stopCurrentStream();
    };
  }, [facingMode, capturedMedia, startCamera, stopCurrentStream]);

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror for front camera
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedMedia(dataUrl);
    
    // Stop stream after capture
    stopCurrentStream();
    
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!streamRef.current) return;
      
      chunksRef.current = [];
      
      // Try different mime types
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
          }
        }
      }
      
      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setCapturedMedia(URL.createObjectURL(blob));
        stopCurrentStream();
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      
      if ('vibrate' in navigator) navigator.vibrate(100);
    }
  };

  const handleRetake = () => {
    setCapturedMedia(null);
    // Camera will restart via useEffect
  };

  const handleConfirm = () => {
    if (capturedMedia) {
      onCapture(capturedMedia);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col text-white"
      style={{ backgroundColor: '#000' }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 pt-12 relative z-10"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <button 
          onClick={onClose} 
          className="p-3 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <X size={24} />
        </button>
        <span className="font-bold text-lg">{mode === 'photo' ? '📷 Photo' : '🎬 Vidéo'}</span>
        <button 
          onClick={switchCamera} 
          className="p-3 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* Camera View */}
      <div 
        className="flex-1 relative overflow-hidden"
        style={{ backgroundColor: '#111' }}
      >
        {/* Error State */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-6xl mb-4">📵</div>
            <p className="text-lg font-bold mb-2">Caméra non accessible</p>
            <p className="text-white/60 text-sm mb-4">{error || 'Vérifie les permissions de ton navigateur'}</p>
            <button 
              onClick={startCamera}
              className="px-6 py-3 bg-cyan-500 rounded-xl font-bold"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Loading State */}
        {hasPermission === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div 
              className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"
            />
            <p className="text-white/60 text-sm">Accès à la caméra...</p>
          </div>
        )}

        {/* Video Preview */}
        {!capturedMedia && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
              display: isVideoReady ? 'block' : 'none',
              backgroundColor: '#000'
            }}
          />
        )}

        {/* Captured Photo Preview */}
        {capturedMedia && mode === 'photo' && (
          <img 
            src={capturedMedia} 
            alt="Captured" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        )}

        {/* Captured Video Preview */}
        {capturedMedia && mode === 'video' && (
          <video 
            src={capturedMedia} 
            controls 
            autoPlay
            loop
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-red-500/80 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-bold">REC</span>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Controls */}
      <div 
        className="p-6 pb-12"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        {!capturedMedia ? (
          <div className="flex items-center justify-center gap-8">
            <div className="w-16" />
            
            <button
              onClick={mode === 'photo' ? takePhoto : toggleRecording}
              disabled={!isVideoReady}
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{
                backgroundColor: isRecording ? '#ef4444' : '#fff',
                opacity: isVideoReady ? 1 : 0.5,
                boxShadow: isRecording ? '0 0 30px rgba(239,68,68,0.5)' : 'none'
              }}
            >
              {mode === 'photo' ? (
                <Camera size={32} color="#000" />
              ) : isRecording ? (
                <Square size={24} color="#fff" fill="#fff" />
              ) : (
                <Circle size={32} color="#ef4444" fill="#ef4444" />
              )}
            </button>
            
            <button 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Sparkles size={24} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleRetake}
              className="px-6 py-3 rounded-xl font-bold"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              Reprendre
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              style={{ 
                background: 'linear-gradient(to right, #06b6d4, #d946ef)'
              }}
            >
              <Check size={20} />
              Utiliser
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
