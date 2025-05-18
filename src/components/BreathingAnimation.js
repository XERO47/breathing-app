import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import './BreathingAnimation.css';

const VIDEO_FILE_NAME = 'animation.mp4';

// Added sessionHasBegun to props
const BreathingAnimation = ({
  videoRef,
  initialIsMuted,
  onActualMutedStateChange,
  onTimeUpdate,
  onLoadedMetadata,
  sessionHasBegun // Optional prop
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoSrc = `/${VIDEO_FILE_NAME}`;

  useEffect(() => {
    if (!sessionHasBegun) return; // Don't do anything if session hasn't started

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
  }, [videoRef, initialIsMuted, onActualMutedStateChange, sessionHasBegun]); // Added sessionHasBegun to dependencies

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <video
        ref={videoRef}
        className="breathing-video"
        src={videoSrc}
        loop
        playsInline
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        Your browser does not support the video tag.
      </video>
    </Box>
  );
};

export default BreathingAnimation;
