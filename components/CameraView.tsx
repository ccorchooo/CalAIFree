import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LoadingSpinner, BackIcon, MoreOptionsIcon } from './Icons';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onBack: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check permissions and try again.");
        setIsCameraReady(false);
      }
    };

    enableCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        onCapture(imageDataUrl);
      }
    }
  }, [onCapture]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black fixed inset-0">
       <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
          <button
            onClick={onBack}
            className="bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors"
            aria-label="Back to dashboard"
          >
            <BackIcon />
          </button>
           <h2 className="text-white text-lg font-bold">Scanner</h2>
          <button
            className="bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors"
            aria-label="More options"
          >
            <MoreOptionsIcon />
          </button>
       </header>

      <div className="relative w-full aspect-square max-h-full">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
          playsInline
          aria-label="Live camera feed"
        />
        {isCameraReady && (
             <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                <div className="w-full h-full border-4 border-white/50 rounded-3xl" style={{boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'}}></div>
            </div>
        )}
        
        {!isCameraReady && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                <LoadingSpinner />
                <p className="mt-2">Starting camera...</p>
            </div>
        )}
        {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-4 bg-black">
                <p className="text-center">{error}</p>
                 <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg">Go Back</button>
            </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />

      <footer className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-center z-20">
        <button
          onClick={handleCapture}
          disabled={!isCameraReady}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-transform duration-150 disabled:bg-gray-500 disabled:cursor-not-allowed group"
          aria-label="Scan food"
        >
            <div className="w-[70px] h-[70px] bg-white rounded-full border-4 border-gray-300 group-hover:border-gray-400 transition-colors"></div>
        </button>
      </footer>
    </div>
  );
};
