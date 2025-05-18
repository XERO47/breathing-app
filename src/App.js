import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Typography, IconButton, Fade, Button } from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import BreathingAnimation from './components/BreathingAnimation'; // Assuming this component exists

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
  background: `linear-gradient(135deg, ${theme.palette.background.default}, ${alpha(theme.palette.custom?.skyBlue || '#82C3F0', 0.6)}, ${theme.palette.background.default})`,
  backgroundSize: '200% 200%',
  animation: 'animatedBackground 30s ease infinite',
}));

// SVG Progress Bar Component
const ProgressPath = React.memo(({ progress, videoFrameBorderRadius, color }) => {
  const [pathLengthLeft, setPathLengthLeft] = useState(0);
  const [pathLengthRight, setPathLengthRight] = useState(0);
  const pathLeftRef = useRef(null);
  const pathRightRef = useRef(null);
  const theme = useTheme();
  const prevProgressRef = useRef(progress);
  const animationRef = useRef(null);
  const [animatedProgress, setAnimatedProgress] = useState(progress);

  // Calculate the rounded corner radius in pixels
  const cornerRadius = parseInt(videoFrameBorderRadius, 10) || 18;

  // SVG dimensions are fixed for the path definitions (viewBox)
  const width = 350;
  const height = 525;

  useEffect(() => {
    if (pathLeftRef.current) {
      setPathLengthLeft(pathLeftRef.current.getTotalLength());
    }
    if (pathRightRef.current) {
      setPathLengthRight(pathRightRef.current.getTotalLength());
    }
  }, [cornerRadius]);

  useEffect(() => {
    // For large jumps, immediately update without animation
    if (Math.abs(progress - prevProgressRef.current) > 10) {
      setAnimatedProgress(progress);
      prevProgressRef.current = progress;
      return;
    }

    prevProgressRef.current = progress;
    
    // Smoother animation with better frame timing
    const animate = (timestamp) => {
      setAnimatedProgress((prev) => {
        const diff = progress - prev;
        // If we're close enough, snap to the target value
        if (Math.abs(diff) < 0.05) {
          return progress;
        }
        // Use a smoother easing factor
        const easingFactor = 0.15; // Lower = smoother but slower
        return prev + diff * easingFactor;
      });
      
      // Continue animation only if we haven't reached the target
      if (Math.abs(animatedProgress - progress) > 0.05) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Cancel any existing animation before starting a new one
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress]);

  const strokeColor = typeof color === 'function' ? color(theme) : (color || '#FFFFFF');
  const progressRatio = animatedProgress / 100;

  const svgPathLeft = `
    M ${width / 2} ${height} L ${cornerRadius} ${height}
    Q 0 ${height} 0 ${height - cornerRadius} V ${cornerRadius}
    Q 0 0 ${cornerRadius} 0 L ${width / 2} 0
  `;
  const svgPathRight = `
    M ${width / 2} ${height} L ${width - cornerRadius} ${height}
    Q ${width} ${height} ${width} ${height - cornerRadius} V ${cornerRadius}
    Q ${width} 0 ${width - cornerRadius} 0 L ${width / 2} 0
  `;

  const currentOffsetLeft = pathLengthLeft * (1 - progressRatio);
  const currentOffsetRight = pathLengthRight * (1 - progressRatio);

  return (
    <svg
      width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 10 }}
    >
      <path
        ref={pathLeftRef} d={svgPathLeft} fill="none" stroke={strokeColor} strokeWidth="4"
        strokeDasharray={pathLengthLeft} strokeDashoffset={currentOffsetLeft}
        className="progress-path progress-path-left"
        strokeLinecap="round" // Makes line ends rounded
      />
      <path
        ref={pathRightRef} d={svgPathRight} fill="none" stroke={strokeColor} strokeWidth="4"
        strokeDasharray={pathLengthRight} strokeDashoffset={currentOffsetRight}
        className="progress-path progress-path-right"
        strokeLinecap="round" // Makes line ends rounded
      />
    </svg>
  );
});

function App() {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durationKnown, setDurationKnown] = useState(false);
  const [breathInstruction, setBreathInstruction] = useState("");
  const [showInstruction, setShowInstruction] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const videoFrameBorderRadius = '18px';
  const previousTimeRef = useRef(0);
  const throttleRef = useRef(false);

  const handleStartSession = () => { setSessionStarted(true); };

  const handleVideoTimeUpdate = useCallback(() => {
    if (throttleRef.current) return;
    throttleRef.current = true;
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      throttleRef.current = false;
      
      if (videoRef.current && videoRef.current.duration) {
        const currentTime = videoRef.current.currentTime;
        
        // Skip unnecessary updates if time hasn't changed significantly
        if (Math.abs(currentTime - previousTimeRef.current) < 0.01) return;
        previousTimeRef.current = currentTime;
        
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
    });
  }, [durationKnown, breathInstruction, showInstruction]);

  const handleVideoLoadedMetadata = useCallback(() => {
    if (videoRef.current && videoRef.current.duration) {
      setDurationKnown(true);
      if (sessionStarted && videoRef.current.currentTime < BREATH_CYCLE_TIMINGS.INHALE.end) {
        setBreathInstruction(BREATH_CYCLE_TIMINGS.INHALE.text);
        setShowInstruction(true);
      }
    }
  }, [sessionStarted]);

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

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.type = 'text/css';
    styleEl.innerHTML = `
      @keyframes progressBarPulse {
        0% { opacity: 0.8; }
        50% { opacity: 0.4; }
        100% { opacity: 0.8; }
      }
      @keyframes animatedBackground {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      /* Add hardware acceleration to SVG animations */
      .progress-path {
        will-change: stroke-dashoffset;
        transform: translateZ(0);
      }
    `;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  if (!sessionStarted) {
    return (
      <>
        <AnimatedBackground />
        <Box
          sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '100vh', textAlign: 'center',
            padding: 2, position: 'relative', zIndex: 1,
          }}
        >
          <Typography variant="h3" component="h1" sx={(theme) => ({
            color: theme.palette.custom?.darkPurpleBlue || theme.palette.text.primary,
            fontWeight: 600, mb: 2
          })}>
            Ready to Relax?
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, maxWidth: '400px' }}>
            Take a moment for yourself. Let's breathe together.
          </Typography>
          <Button
            variant="contained"
            onClick={handleStartSession}
            size="large"
            sx={(theme) => {
              const mainColor = theme.palette.custom?.darkPurpleBlue || theme.palette.primary.main;
              return {
                bgcolor: mainColor,
                color: 'white',
                padding: '12px 28px',
                borderRadius: '25px',
                textTransform: 'none',
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: alpha(mainColor, 0.85),
                },
              };
            }}
          >
            Begin Session
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <Box
        sx={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: { xs: 2, sm: 3 },
          width: '100%', overflowX: 'hidden', position: 'relative', zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: { xs: '20px', sm: '24px' }, width: '100%',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={(theme) => ({
              color: theme.palette.custom?.darkPurpleBlue || theme.palette.text.primary,
              fontWeight: 600,
            })}
          >
            Breathe Deeply
          </Typography>

          <Box sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
            <Fade in={showInstruction} timeout={500}>
              <Typography variant="h6" component="p" sx={{ color: 'text.primary', fontWeight: 400, }}>
                {breathInstruction}
              </Typography>
            </Fade>
          </Box>

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
                sx={(theme) => ({
                  width: '100%', height: '100%',
                  bgcolor: theme.palette.custom?.skyBlue || '#ADD8E6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                })}
              >
                <BreathingAnimation
                  sessionHasBegun={sessionStarted}
                  videoRef={videoRef}
                  initialIsMuted={isMuted}
                  onActualMutedStateChange={handleActualMutedStateChange}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                />
              </Box>

              {durationKnown && (
                <ProgressPath
                  progress={progress}
                  color={(theme) => theme.palette.custom?.progressBar || '#FFFFFF'}
                  videoFrameBorderRadius={videoFrameBorderRadius}
                />
              )}
            </Box>

            <Box
              sx={(theme) => ({
                position: 'absolute', top: '50%', left: '100%',
                transform: `translate(${theme.spacing(1.25)}, -50%)`, zIndex: 20,
                backgroundColor: alpha(theme.palette.common.black, 0.25),
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              })}
            >
              <IconButton onClick={toggleMute} size="small" sx={{ color: 'white' }}>
                {isMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={(theme) => ({
              color: alpha(theme.palette.custom?.shirtWhite || '#E0F0FF', 0.9),
              maxWidth: '350px', lineHeight: 1.6, fontWeight: 300,
            })}
          >
            Allow the rhythm to guide you to a state of calm.
          </Typography>
        </Box>
      </Box>
    </>
  );
}

export default App;