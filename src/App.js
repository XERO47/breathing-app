import React, { useRef, useState, useCallback, useEffect } from 'react'; // Added useEffect
import { Box, Typography, IconButton, Fade } from '@mui/material'; // Added Fade
import { alpha, styled } from '@mui/material/styles'; // Added styled
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import BreathingAnimation from './components/BreathingAnimation';

// --- DEFINE YOUR VIDEO TIMINGS HERE (seconds) ---
const BREATH_CYCLE_TIMINGS = {
  INHALE: { start: 0, end: 4, text: "Inhale..." },
  HOLD_INHALE: { start: 4, end: 7, text: "Hold" },
  EXHALE: { start: 7, end: 14, text: "Exhale..." },
  HOLD_EXHALE: { start: 14, end: 16, text: "Hold" },
  CYCLE_DURATION: 16
};
// --- END OF VIDEO TIMINGS ---

const AnimatedBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: -1,
  background: `linear-gradient(135deg, ${theme.palette.background.default}, ${alpha(theme.palette.custom.skyBlue, 0.6)}, ${theme.palette.background.default})`,
  backgroundSize: '200% 200%',
  animation: 'animatedBackground 30s ease infinite',
}));

function App() {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durationKnown, setDurationKnown] = useState(false);
  const [breathInstruction, setBreathInstruction] = useState("");
  const [showInstruction, setShowInstruction] = useState(false);

  const handleVideoTimeUpdate = useCallback(() => {
    if (videoRef.current && videoRef.current.duration) {
      const currentTime = videoRef.current.currentTime;
      const videoDuration = videoRef.current.duration;
      const currentOverallProgress = (currentTime / videoDuration) * 100;
      setProgress(currentOverallProgress);
      if (!durationKnown) setDurationKnown(true);

      const timeInCycle = currentTime % BREATH_CYCLE_TIMINGS.CYCLE_DURATION;
      let currentPhaseText = "";

      if (timeInCycle >= BREATH_CYCLE_TIMINGS.INHALE.start && timeInCycle < BREATH_CYCLE_TIMINGS.INHALE.end) {
        currentPhaseText = BREATH_CYCLE_TIMINGS.INHALE.text;
      } else if (BREATH_CYCLE_TIMINGS.HOLD_INHALE && timeInCycle >= BREATH_CYCLE_TIMINGS.HOLD_INHALE.start && timeInCycle < BREATH_CYCLE_TIMINGS.HOLD_INHALE.end) {
        currentPhaseText = BREATH_CYCLE_TIMINGS.HOLD_INHALE.text;
      } else if (timeInCycle >= BREATH_CYCLE_TIMINGS.EXHALE.start && timeInCycle < BREATH_CYCLE_TIMINGS.EXHALE.end) {
        currentPhaseText = BREATH_CYCLE_TIMINGS.EXHALE.text;
      } else if (BREATH_CYCLE_TIMINGS.HOLD_EXHALE && timeInCycle >= BREATH_CYCLE_TIMINGS.HOLD_EXHALE.start && timeInCycle < BREATH_CYCLE_TIMINGS.HOLD_EXHALE.end) {
        currentPhaseText = BREATH_CYCLE_TIMINGS.HOLD_EXHALE.text;
      }

      if (breathInstruction !== currentPhaseText) {
        setShowInstruction(false);
        setTimeout(() => {
          setBreathInstruction(currentPhaseText);
          if (currentPhaseText) setShowInstruction(true);
        }, 250);
      } else if (currentPhaseText && !showInstruction) {
        setShowInstruction(true);
      }
    }
  }, [durationKnown, breathInstruction, showInstruction]);

  const handleVideoLoadedMetadata = useCallback(() => {
    if (videoRef.current && videoRef.current.duration) {
      setDurationKnown(true);
      if (videoRef.current.currentTime < BREATH_CYCLE_TIMINGS.INHALE.end) {
        setBreathInstruction(BREATH_CYCLE_TIMINGS.INHALE.text);
        setShowInstruction(true);
      }
    }
  }, []);

  const bottomBarProgress = Math.min(100, (progress / 10) * 100);
  const sideBarProgress = progress > 10 ? Math.min(100, ((progress - 10) / 70) * 100) : 0;
  const topBarProgress = progress > 80 ? Math.min(100, ((progress - 80) / 20) * 100) : 0;

  const progressBarColor = (theme) => theme.palette.custom.progressBar;
  const barThickness = '4px';
  const barPulseAnimation = 'progressBarPulse 1.8s infinite ease-in-out';
  const barGrowTransition = '0.25s ease-out';

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const handleActualMutedStateChange = (actualMutedState) => {
    setIsMuted(actualMutedState);
  };

  const videoFrameBorderRadius = '18px';

  return (
    <>
      <AnimatedBackground />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 2, sm: 3 },
          width: '100%',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: { xs: '20px', sm: '24px' },
            width: '100%',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: 'custom.darkPurpleBlue',
              fontWeight: 600,
            }}
          >
            Breathe Deeply
          </Typography>

          {/* Instructional Text */}
          <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
            <Fade in={showInstruction} timeout={500}>
              <Typography
                variant="h6"
                component="p"
                sx={{
                  color: 'text.primary',
                  fontWeight: 400,
                }}
              >
                {breathInstruction}
              </Typography>
            </Fade>
          </Box>

          {/* Container for the video area AND the side mute button */}
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Box
              sx={{
                position: 'relative',
                width: 'clamp(280px, 80vw, 350px)',
                aspectRatio: '2 / 3',
                borderRadius: videoFrameBorderRadius,
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'custom.skyBlue',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <BreathingAnimation
                  videoRef={videoRef}
                  initialIsMuted={isMuted}
                  onActualMutedStateChange={handleActualMutedStateChange}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                />
              </Box>

              {durationKnown && (
                <>
                  <Box sx={{ position: 'absolute', bottom: 0, left: `calc(50% - ${(bottomBarProgress / 100) * 50}%)`, width: `${(bottomBarProgress / 100) * 50}%`, height: barThickness, backgroundColor: progressBarColor, transformOrigin: 'right', transition: `width ${barGrowTransition}`, zIndex: 2, animation: bottomBarProgress > 0 ? barPulseAnimation : 'none' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: '50%', width: `${(bottomBarProgress / 100) * 50}%`, height: barThickness, backgroundColor: progressBarColor, transformOrigin: 'left', transition: `width ${barGrowTransition}`, zIndex: 2, animation: bottomBarProgress > 0 ? barPulseAnimation : 'none' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: barThickness, height: `${sideBarProgress}%`, backgroundColor: progressBarColor, transition: `height ${barGrowTransition}`, zIndex: 2, animation: sideBarProgress > 0 ? barPulseAnimation : 'none' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: barThickness, height: `${sideBarProgress}%`, backgroundColor: progressBarColor, transition: `height ${barGrowTransition}`, zIndex: 2, animation: sideBarProgress > 0 ? barPulseAnimation : 'none' }} />
                  <Box sx={{ position: 'absolute', top: 0, left: 0, width: `${(topBarProgress / 100) * 50}%`, height: barThickness, backgroundColor: progressBarColor, transition: `width ${barGrowTransition}`, zIndex: 2, animation: topBarProgress > 0 ? barPulseAnimation : 'none' }} />
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: `${(topBarProgress / 100) * 50}%`, height: barThickness, backgroundColor: progressBarColor, transformOrigin: 'right', transition: `width ${barGrowTransition}`, zIndex: 2, animation: topBarProgress > 0 ? barPulseAnimation : 'none' }} />
                </>
              )}
            </Box>

            {/* Mute/Unmute Button */}
            <Box
              sx={(theme) => ({
                position: 'absolute',
                top: '50%',
                left: '100%',
                transform: `translate(${theme.spacing(1.25)}, -50%)`,
                zIndex: 20,
                backgroundColor: alpha(theme.palette.common.black, 0.25),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <IconButton onClick={toggleMute} size="small" sx={{ color: 'white' }}>
                {isMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: (theme) => alpha(theme.palette.custom.shirtWhite, 0.9),
              maxWidth: '350px',
              lineHeight: 1.6,
              fontWeight: 300,
            }}
          >
            Allow the rhythm to guide you to a state of calm.
          </Typography>
        </Box>
      </Box>
    </>
  );
}

export default App;