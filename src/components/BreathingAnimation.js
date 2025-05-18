import React, { useState, useEffect } from 'react'; // Removed useCallback, useRef not strictly needed here if passed
import { Box } from '@mui/material';
import './BreathingAnimation.css';

const VIDEO_FILE_NAME = 'animation.mp4';

// Props expected: videoRef, initialIsMuted, onActualMutedStateChange, onTimeUpdate, onLoadedMetadata
const BreathingAnimation = ({
  videoRef,
  initialIsMuted,
  onActualMutedStateChange,
  onTimeUpdate, // New prop from App.js
  onLoadedMetadata, // New prop from App.js
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  // Removed local progress, durationKnown, and progress bar calculation logic

  const videoSrc = `/${VIDEO_FILE_NAME}`;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.muted = initialIsMuted;
      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (videoElement.muted !== initialIsMuted) {
              onActualMutedStateChange(videoElement.muted);
            }
          })
          .catch((error) => {
            console.warn("Autoplay with sound was prevented:", error);
            videoElement.muted = true;
            onActualMutedStateChange(true);
            videoElement.play().catch(err => console.error("Autoplay muted also failed:", err));
          });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef, initialIsMuted, onActualMutedStateChange]);


  return (
    // This Box is now just for the video element's immediate container within the blue frame
    // The className "animation-video-container-relative" might not be needed here anymore if progress bars are outside
    <Box
      sx={{
        width: '100%',
        height: '100%', // Ensure it fills the blue frame from App.js
        display: 'flex', // To center video if it's letterboxed
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <video
        ref={videoRef}
        className="breathing-video" // From BreathingAnimation.css - mostly for width/height/borderRadius of video
        src={videoSrc}
        loop
        playsInline
        onTimeUpdate={onTimeUpdate} // Use callback from App.js
        onLoadedMetadata={onLoadedMetadata} // Use callback from App.js
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        Your browser does not support the video tag.
      </video>

      {/* Progress Bar Elements have been MOVED to App.js */}
    </Box>
  );
};

export default BreathingAnimation;