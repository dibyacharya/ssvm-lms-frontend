import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, PhoneOff,
  MessageSquare, Users, Hand, X, Wifi, WifiOff, Pause, Play, Disc,
  Send, ArrowUpRight, CheckCircle2, RefreshCw,
  BarChart3, HelpCircle, Subtitles
} from 'lucide-react';
import ChatPanel from './components/ChatPanel';
import PollPanel from './components/PollPanel';
import QnAPanel from './components/QnAPanel';
import CaptionOverlay from './components/CaptionOverlay';
import CaptionInput from './components/CaptionInput';
import MeetingReport from './components/MeetingReport';
import { useMeetingChat } from './hooks/useMeetingChat';
import { useMeetingPolls } from './hooks/useMeetingPolls';
import { useMeetingQnA } from './hooks/useMeetingQnA';
import { useMeetingCaptions } from './hooks/useMeetingCaptions';
import { flushVconfChat } from '../../services/vconf.service';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  joinVconfMeeting,
  startVconfMeeting,
  endVconfMeeting,
  startVconfRecording,
  stopVconfRecording,
  getVconfMeeting,
  uploadVconfRecording,
} from '../../services/vconf.service';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useConnectionState,
  useTracks,
  VideoTrack,
  GridLayout,
  ParticipantTile,
  isTrackReference,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Hide LiveKit's built-in control bar -- custom controls are already rendered below
const hideLkControlBarStyle = document.createElement('style');
hideLkControlBarStyle.textContent = `.lk-control-bar { display: none !important; }`;
if (!document.head.querySelector('[data-hide-lk-controls]')) {
  hideLkControlBarStyle.setAttribute('data-hide-lk-controls', '');
  document.head.appendChild(hideLkControlBarStyle);
}

// -- Custom PiP Video Layout ---------------------------------------------------------------
// Replaces LiveKit's <VideoConference /> with a custom layout:
// - Screen share active -> shared screen full + teacher webcam PiP overlay (bottom-right)
// - No screen share -> normal grid of all camera tracks
// - Uses browser native PiP API so the face window persists when switching tabs/pages
const CustomVideoLayout = ({ meetingTitle }) => {
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // Separate screen share and camera tracks
  const screenShareTrack = tracks.find(
    (t) => isTrackReference(t) && t.source === Track.Source.ScreenShare
  );
  const cameraTracks = tracks.filter(
    (t) => t.source === Track.Source.Camera
  );

  // Find the screen sharer's camera track for PiP
  const sharerIdentity = screenShareTrack && isTrackReference(screenShareTrack)
    ? screenShareTrack.participant?.identity
    : null;
  const isLocalSharing = sharerIdentity === localParticipant?.identity;
  const sharerCameraTrack = sharerIdentity
    ? cameraTracks.find((t) => isTrackReference(t) && t.participant?.identity === sharerIdentity)
    : null;
  const otherCameraTracks = cameraTracks.filter(
    (t) => isTrackReference(t) && t.participant?.identity !== sharerIdentity
  );

  // PiP drag support
  const pipRef = useRef(null);
  const [pipPos, setPipPos] = useState(null);
  const dragState = useRef(null);

  // NOTE: Native browser PiP removed — it showed a duplicate rectangular window
  // alongside the in-page circular PiP. Only the circular overlay is used now.

  const handlePipMouseDown = (e) => {
    if (!pipRef.current) return;
    const rect = pipRef.current.getBoundingClientRect();
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
    };

    const handleMouseMove = (ev) => {
      if (!dragState.current) return;
      const dx = ev.clientX - dragState.current.startX;
      const dy = ev.clientY - dragState.current.startY;
      setPipPos({
        x: dragState.current.origX + dx,
        y: dragState.current.origY + dy,
      });
    };

    const handleMouseUp = () => {
      dragState.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // -- Screen Share Mode (PiP Layout) --
  if (screenShareTrack && isTrackReference(screenShareTrack)) {
    return (
      <div className="relative w-full h-full bg-black" data-recording-target="true" data-screen-share-active="true">
        {/* Main area: show shared screen for viewers, or "You are sharing" for the sharer */}
        {isLocalSharing ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-900 to-black relative">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white text-xl font-semibold">You are sharing your screen</p>
            <p className="text-slate-400 text-sm">Participants can see your shared content</p>
            {/* Show other participants in a row below */}
            {otherCameraTracks.length > 0 && (
              <div className="flex gap-3 mt-4">
                {otherCameraTracks.slice(0, 8).map((t) =>
                  isTrackReference(t) ? (
                    <div
                      key={t.participant?.identity || Math.random()}
                      className="w-32 rounded-lg overflow-hidden border border-white/10 shadow-lg bg-slate-800 relative"
                      style={{ aspectRatio: '16/9' }}
                    >
                      <VideoTrack trackRef={t} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-0.5">
                        <span className="text-white text-[10px] font-medium truncate block">
                          {t.participant?.name || ''}
                        </span>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        ) : (
          <VideoTrack
            trackRef={screenShareTrack}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}

        {/* PiP: Sharer's Webcam (circle, bottom-right, draggable) - visible to everyone including the sharer */}
        {sharerCameraTrack && isTrackReference(sharerCameraTrack) && (
          <div
            ref={pipRef}
            onMouseDown={handlePipMouseDown}
            className="absolute z-20 w-36 h-36 rounded-full overflow-hidden border-2 border-emerald-400/60 shadow-2xl bg-black cursor-grab active:cursor-grabbing transition-all"
            style={{
              ...(pipPos
                ? { left: pipPos.x, top: pipPos.y, position: 'fixed' }
                : { bottom: 24, right: 24 }),
            }}
          >
            <VideoTrack
              trackRef={sharerCameraTrack}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Other participants thumbnails (top-right strip) */}
        {otherCameraTracks.length > 0 && (
          <div className="absolute top-3 right-3 z-10 flex gap-2 flex-wrap max-w-[50%]">
            {otherCameraTracks.slice(0, 6).map((t) =>
              isTrackReference(t) ? (
                <div
                  key={t.participant?.identity || Math.random()}
                  className="w-28 rounded-lg overflow-hidden border border-white/10 shadow-lg bg-slate-800 relative"
                  style={{ aspectRatio: '16/9' }}
                >
                  <VideoTrack trackRef={t} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-0.5">
                    <span className="text-white text-[10px] font-medium truncate block">
                      {t.participant?.name || ''}
                    </span>
                  </div>
                </div>
              ) : null
            )}
            {otherCameraTracks.length > 6 && (
              <div
                className="w-28 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center"
                style={{ aspectRatio: '16/9' }}
              >
                <span className="text-white text-xs font-medium">+{otherCameraTracks.length - 6} more</span>
              </div>
            )}
          </div>
        )}

        {/* Course label at bottom center */}
        {meetingTitle && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-6 py-2 bg-black/60 backdrop-blur-sm rounded-full">
            <span className="text-white text-sm font-medium">Course: {meetingTitle}</span>
          </div>
        )}
      </div>
    );
  }

  // -- Normal Mode (Grid Layout) --
  return (
    <div className="w-full h-full p-2" data-recording-target="true">
      <GridLayout tracks={cameraTracks} style={{ height: '100%' }}>
        <ParticipantTile />
      </GridLayout>
    </div>
  );
};

// We separate the actual room content into a child component so it can use LiveKit hooks
function MeetingContent({ activeMeetingId, isRecording, setIsRecording, showRightPanel, setShowRightPanel, meetingData, setClassEnded, classEndedByTeacherRef }) {
  const { user } = useAuth();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const navigate = useNavigate();
  // LiveKit useChat removed — now using useMeetingChat hook for persistent chat
  const [elapsedTime, setElapsedTime] = useState(0);
  const elapsedTimeRef = useRef(0);
  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);
  // aiSuggestions removed -- using Live Transcript only
  const [liveTranscripts, setLiveTranscripts] = useState([]);
  const [mediaError, setMediaError] = useState("");
  const [canPlaybackAudio, setCanPlaybackAudio] = useState(room.canPlaybackAudio);
  const [showDebug] = useState(false);
  const [raisedHands, setRaisedHands] = useState(new Set());
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Admin manual transcript injection states
  const [manualSpeaker, setManualSpeaker] = useState("System");
  const [manualText, setManualText] = useState("");

  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [micLocked, setMicLocked] = useState(user?.role !== 'teacher');
  const [camLocked, setCamLocked] = useState(user?.role !== 'teacher');
  const [screenLocked, setScreenLocked] = useState(user?.role !== 'teacher');
  // Teacher-side tracking of student lock states (students start locked)
  const [studentMicLocked, setStudentMicLocked] = useState(true);
  const [studentCamLocked, setStudentCamLocked] = useState(true);
  const [studentScreenLocked, setStudentScreenLocked] = useState(true);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const recordingStartedRef = useRef(false);
  const recordingIntendedStopRef = useRef(false);
  const recordingStreamRef = useRef(null);

  // ─── Phase 1 Feature Hooks ───

  const chatHook = useMeetingChat(
    activeMeetingId,
    (cmd) => {
      if (localParticipant) {
        const encoded = new TextEncoder().encode(JSON.stringify(cmd));
        localParticipant.publishData(encoded, { reliable: true });
      }
    },
    user?._id,
    user?.name || user?.email || "Unknown",
    user?.role === "teacher" ? "teacher" : "student"
  );

  const pollHook = useMeetingPolls(
    activeMeetingId,
    (cmd) => {
      if (localParticipant) {
        const encoded = new TextEncoder().encode(JSON.stringify(cmd));
        localParticipant.publishData(encoded, { reliable: true });
      }
    },
    user?._id
  );

  const qnaHook = useMeetingQnA(
    activeMeetingId,
    (cmd) => {
      if (localParticipant) {
        const encoded = new TextEncoder().encode(JSON.stringify(cmd));
        localParticipant.publishData(encoded, { reliable: true });
      }
    },
    user?._id
  );

  const captionHook = useMeetingCaptions(
    activeMeetingId,
    (cmd) => {
      if (localParticipant) {
        const encoded = new TextEncoder().encode(JSON.stringify(cmd));
        localParticipant.publishData(encoded, { reliable: true });
      }
    },
    user?.role === "teacher"
  );

  // Sync elapsed time to captions hook
  useEffect(() => {
    captionHook.setElapsed(elapsedTime);
  }, [elapsedTime]);

  // Show "Disconnected" screen when room disconnects (network drop / teacher ended from server)
  const wasConnectedRef = useRef(false);
  useEffect(() => {
    if (connectionState === 'connected') {
      wasConnectedRef.current = true;
    }
    if (connectionState === 'disconnected' && wasConnectedRef.current) {
      // If CLASS_ENDED was already received via DataChannel, classEnded is already 'ended'
      if (classEndedByTeacherRef.current) return;

      // For students: check meeting status API to determine if teacher ended the class
      if (user?.role !== 'teacher') {
        getVconfMeeting(activeMeetingId)
          .then(res => {
            const meeting = res?.data?.meeting || res?.data;
            if (meeting?.status === 'ended' || meeting?.status === 'completed') {
              classEndedByTeacherRef.current = true;
              setClassEnded('ended');
            } else {
              // Genuine network disconnect — show "Connection Lost" with rejoin option
              setClassEnded('disconnected');
            }
          })
          .catch(() => {
            // API call failed (likely network issue) — show disconnected
            setClassEnded('disconnected');
          });
      } else {
        setClassEnded('disconnected');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState]);

  // Auto-start recording for teacher once connected (canvas-based, captures all participants)
  useEffect(() => {
    if (user?.role === 'teacher' && connectionState === 'connected' && !isRecording && !recordingStartedRef.current) {
      recordingStartedRef.current = true;
      recordingIntendedStopRef.current = false;
      // Delay slightly to let the LiveKit room render video elements in the DOM
      const timer = setTimeout(() => {
        startLocalRecording();
      }, 2000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, connectionState, isRecording]);

  // Safety: if isRecording is true but mediaRecorder ref is lost (e.g. HMR), reset state
  useEffect(() => {
    if (isRecording && !mediaRecorderRef.current) {
      console.warn("[Recording] State out of sync -- resetting. Restarting recording...");
      setIsRecording(false);
      recordingStartedRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // Manage hidden video elements for canvas recording.
  // This is the SOLE owner of creating/destroying hiddenScreenShareVideoRef & hiddenCameraVideoRef.
  // renderFrame only READS from these refs — never creates/destroys them.
  const createRecordingVideo = (track, label) => {
    const vid = document.createElement('video');
    vid.srcObject = new MediaStream([track]);
    vid.muted = true;
    vid.playsInline = true;
    vid.autoplay = true;
    vid.setAttribute('data-recording-hidden', label);
    vid.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:320px;height:240px;opacity:0.01;pointer-events:none;z-index:-1;';
    document.body.appendChild(vid);
    vid.play().catch(() => {});
    track.addEventListener('unmute', () => vid.play().catch(() => {}));
    const onVis = () => { if (!document.hidden && vid.paused) vid.play().catch(() => {}); };
    document.addEventListener('visibilitychange', onVis);
    vid._cleanupVisibility = () => document.removeEventListener('visibilitychange', onVis);
    console.log(`[Recording] useEffect: created hidden video for ${label} (readyState: ${vid.readyState})`);
    return vid;
  };
  const destroyRecordingVideo = (ref) => {
    const vid = ref.current;
    if (!vid) return;
    if (vid._cleanupVisibility) vid._cleanupVisibility();
    if (vid.parentNode) vid.parentNode.removeChild(vid);
    vid.srcObject = null;
    ref.current = null;
  };

  useEffect(() => {
    if (!isRecording || !localParticipant) return;

    // ── Screen Share track ──
    const screenSharePub = localParticipant.getTrackPublication(Track.Source.ScreenShare);
    const ssMediaTrack = screenSharePub?.track?.mediaStreamTrack;
    if (ssMediaTrack) {
      const existingId = hiddenScreenShareVideoRef.current?.srcObject?.getVideoTracks()[0]?.id;
      if (!hiddenScreenShareVideoRef.current || existingId !== ssMediaTrack.id) {
        destroyRecordingVideo(hiddenScreenShareVideoRef);
        hiddenScreenShareVideoRef.current = createRecordingVideo(ssMediaTrack, 'ScreenShare');
      }
      // Also dynamically add screen share audio to the AudioContext mixer
      const ssAudioPub = localParticipant.getTrackPublication(Track.Source.ScreenShareAudio);
      if (ssAudioPub?.track?.mediaStreamTrack && audioContextRef.current && audioDestRef.current) {
        const trackId = ssAudioPub.track.mediaStreamTrack.id;
        if (!connectedAudioTrackIdsRef.current.has(trackId)) {
          try {
            const src = audioContextRef.current.createMediaStreamSource(new MediaStream([ssAudioPub.track.mediaStreamTrack]));
            src.connect(audioDestRef.current);
            connectedAudioTrackIdsRef.current.add(trackId);
            console.log("[Recording] Dynamically added screen share audio to mixer");
          } catch (e) { /* already connected */ }
        }
      }
    } else {
      destroyRecordingVideo(hiddenScreenShareVideoRef);
    }

    // ── Camera track ──
    const cameraPub = localParticipant.getTrackPublication(Track.Source.Camera);
    const camMediaTrack = cameraPub?.track?.mediaStreamTrack;
    if (camMediaTrack) {
      const existingCamId = hiddenCameraVideoRef.current?.srcObject?.getVideoTracks()[0]?.id;
      if (!hiddenCameraVideoRef.current || existingCamId !== camMediaTrack.id) {
        destroyRecordingVideo(hiddenCameraVideoRef);
        hiddenCameraVideoRef.current = createRecordingVideo(camMediaTrack, 'Camera');
      }
    } else {
      destroyRecordingVideo(hiddenCameraVideoRef);
    }
  });

  // Canvas-based recording: captures all participants via a canvas element
  const canvasRef = useRef(null);
  const canvasStreamRef = useRef(null);
  const canvasAnimFrameRef = useRef(null);
  const canvasIntervalRef = useRef(null); // setInterval fallback for when rAF is throttled
  const hiddenScreenShareVideoRef = useRef(null);
  const hiddenCameraVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioDestRef = useRef(null);
  const connectedAudioTrackIdsRef = useRef(new Set()); // Track which audio sources are already connected
  const audioCtxKeepAliveRef = useRef(null); // Interval to resume AudioContext if suspended

  // Cleanup on component unmount — prevents resource leaks if user navigates away mid-recording
  // Cleanup on component unmount — use fullRecordingCleanup
  useEffect(() => {
    return () => {
      fullRecordingCleanup();
    };
  }, []);

  // Full cleanup helper — destroys all recording resources (canvas, intervals, audio, hidden videos)
  const fullRecordingCleanup = () => {
    if (audioCtxKeepAliveRef.current) {
      clearInterval(audioCtxKeepAliveRef.current);
      audioCtxKeepAliveRef.current = null;
    }
    if (canvasAnimFrameRef.current) {
      cancelAnimationFrame(canvasAnimFrameRef.current);
      canvasAnimFrameRef.current = null;
    }
    if (canvasIntervalRef.current) {
      clearInterval(canvasIntervalRef.current);
      canvasIntervalRef.current = null;
    }
    if (canvasStreamRef.current) {
      canvasStreamRef.current.getTracks().forEach(track => track.stop());
      canvasStreamRef.current = null;
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach(track => track.stop());
      recordingStreamRef.current = null;
    }
    const cleanupHiddenVid = (vid) => {
      if (!vid) return;
      if (vid._cleanupVisibility) vid._cleanupVisibility();
      if (vid.parentNode) vid.parentNode.removeChild(vid);
      vid.srcObject = null;
    };
    cleanupHiddenVid(hiddenScreenShareVideoRef.current);
    hiddenScreenShareVideoRef.current = null;
    cleanupHiddenVid(hiddenCameraVideoRef.current);
    hiddenCameraVideoRef.current = null;
    document.querySelectorAll('video[data-recording-hidden]').forEach(v => {
      if (v._cleanupVisibility) v._cleanupVisibility();
      v.srcObject = null;
      v.parentNode?.removeChild(v);
    });
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      audioDestRef.current = null;
    }
    canvasRef.current = null;
    connectedAudioTrackIdsRef.current = new Set();
  };

  // Recreate ONLY the audio setup — used when auto-restarting after unexpected stop.
  // Canvas + intervals stay alive because the canvas video track is fine.
  const recreateAudioSetup = () => {
    // Close old AudioContext if still around
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    const audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    let count = 0;

    // Teacher's mic
    const micPub = localParticipant?.getTrackPublication(Track.Source.Microphone);
    if (micPub?.track?.mediaStreamTrack) {
      try {
        const src = audioCtx.createMediaStreamSource(new MediaStream([micPub.track.mediaStreamTrack]));
        src.connect(dest);
        count++;
      } catch (e) { /* */ }
    }
    // Screen share audio
    const ssaPub = localParticipant?.getTrackPublication(Track.Source.ScreenShareAudio);
    if (ssaPub?.track?.mediaStreamTrack) {
      try {
        const src = audioCtx.createMediaStreamSource(new MediaStream([ssaPub.track.mediaStreamTrack]));
        src.connect(dest);
        count++;
      } catch (e) { /* */ }
    }
    // Remote participant audio from DOM
    document.querySelectorAll('audio[data-lk-source]').forEach(el => {
      if (el.srcObject) {
        try {
          const src = audioCtx.createMediaStreamSource(el.srcObject);
          src.connect(dest);
          count++;
        } catch (e) { /* */ }
      }
    });

    audioContextRef.current = audioCtx;
    audioDestRef.current = dest;
    connectedAudioTrackIdsRef.current = new Set();
    if (micPub?.track?.mediaStreamTrack) connectedAudioTrackIdsRef.current.add(micPub.track.mediaStreamTrack.id);
    if (ssaPub?.track?.mediaStreamTrack) connectedAudioTrackIdsRef.current.add(ssaPub.track.mediaStreamTrack.id);
    document.querySelectorAll('audio[data-lk-source]').forEach(el => {
      el.srcObject?.getAudioTracks().forEach(t => connectedAudioTrackIdsRef.current.add(t.id));
    });

    console.log(`[Recording] Recreated AudioContext with ${count} sources`);
    return dest.stream.getAudioTracks();
  };

  const setupMediaRecorder = (stream) => {
    // Prefer VP9 for better quality-per-bit; fall back to VP8, then plain webm
    let mimeOptions = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeOptions)) {
      mimeOptions = 'video/webm;codecs=vp8,opus';
    }
    if (!MediaRecorder.isTypeSupported(mimeOptions)) {
      mimeOptions = 'video/webm';
    }

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeOptions,
      videoBitsPerSecond: 2_500_000, // 2.5 Mbps — smooth 720p recording
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      // ═══ UNEXPECTED STOP — auto-restart recording ═══
      // On some browsers (Chrome on Azure), getDisplayMedia() for screen sharing
      // kills the AudioContext destination track, which causes MediaRecorder to stop.
      // Instead of giving up, we auto-restart: keep existing chunks, recreate audio,
      // create a new MediaRecorder with the same canvas video track + fresh audio.
      if (!recordingIntendedStopRef.current) {
        console.warn("[Recording] Stopped unexpectedly — AUTO-RESTARTING in 500ms...");
        setMediaError("Recording auto-recovering...");
        setTimeout(() => setMediaError(""), 2000);

        // Close only the dead AudioContext — canvas + intervals are still alive
        if (audioCtxKeepAliveRef.current) {
          clearInterval(audioCtxKeepAliveRef.current);
          audioCtxKeepAliveRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
          audioDestRef.current = null;
        }

        // Auto-restart after a brief delay to let getDisplayMedia settle
        setTimeout(() => {
          try {
            if (recordingIntendedStopRef.current) return; // User stopped while we were waiting

            // Canvas stream should still be alive
            if (!canvasStreamRef.current || canvasStreamRef.current.getVideoTracks().length === 0) {
              // Canvas stream is also dead — do a full restart
              console.log("[Recording] Canvas stream also dead — full restart");
              fullRecordingCleanup();
              recordingStartedRef.current = false;
              startLocalRecording();
              return;
            }

            // Recreate audio and build new combined stream
            const freshAudioTracks = recreateAudioSetup();
            const newStream = new MediaStream([
              ...canvasStreamRef.current.getVideoTracks(),
              ...freshAudioTracks,
            ]);

            // Monitor new tracks
            newStream.getTracks().forEach(track => {
              track.addEventListener('ended', () => {
                console.warn(`[Recording] Track ended: ${track.kind} (${track.label || track.id})`);
              });
            });

            // Restart AudioContext keep-alive
            audioCtxKeepAliveRef.current = setInterval(() => {
              if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume().catch(() => {});
              }
            }, 1000);

            // Create new MediaRecorder (keeps existing chunks!)
            setupMediaRecorder(newStream);
            console.log("[Recording] Auto-restarted successfully — chunks preserved");
          } catch (e) {
            console.error("[Recording] Auto-restart failed:", e);
            setMediaError("Recording interrupted. End Class to save what was captured.");
            setTimeout(() => setMediaError(""), 5000);
          }
        }, 500);
        return;
      }

      // ═══ INTENDED STOP — clean up and upload ═══
      fullRecordingCleanup();

      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
      console.log(`[Recording] Final blob size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

      if (blob.size < 1024) {
        console.warn("[Recording] Recording too small, likely empty — skipping upload");
        setMediaError("Recording was empty — no data captured");
        setTimeout(() => setMediaError(""), 5000);
        recordedChunks.current = [];
        setIsRecording(false);
        setIsRecordingPaused(false);
        return;
      }

      try {
        await uploadVconfRecording(activeMeetingId, blob);
        console.log("Recording uploaded successfully");
        setMediaError("Recording saved to server");
      } catch (e) {
        console.error("Failed to upload recording", e);
        setMediaError("Failed to upload recording to server");
      }
      setTimeout(() => setMediaError(""), 3000);
      recordedChunks.current = [];
      setIsRecording(false);
      setIsRecordingPaused(false);
    };

    mediaRecorder.onerror = (event) => {
      console.error("[Recording] MediaRecorder error:", event.error?.name, event.error?.message);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);
  };

  // Start recording by capturing the entire video area via a hidden canvas
  // This approach captures all visible participants, not just the teacher's own tracks
  const startLocalRecording = async () => {
    try {
      recordingIntendedStopRef.current = false;

      // Strategy: Use a canvas to capture video tracks directly from LiveKit
      // When teacher shares screen, their DOM shows "You are sharing your screen" text,
      // so we must grab the ScreenShare track directly from LiveKit instead of the DOM.
      const videoArea = document.querySelector('[data-recording-target="true"]') ||
                        document.querySelector('.lk-grid-layout') ||
                        document.querySelector('[data-lk-room]');

      if (!videoArea) {
        console.warn("[Recording] No video area found, falling back to direct track capture");
        return startDirectTrackRecording();
      }

      // Create an off-screen canvas for recording
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      canvasRef.current = canvas;
      const ctx = canvas.getContext('2d');

      // Create hidden video elements for screen share & camera tracks from LiveKit.
      // Uses the component-level createRecordingVideo() function (also used by the useEffect).
      const screenSharePub = localParticipant?.getTrackPublication(Track.Source.ScreenShare);
      const cameraPub = localParticipant?.getTrackPublication(Track.Source.Camera);

      if (screenSharePub?.track?.mediaStreamTrack) {
        hiddenScreenShareVideoRef.current = createRecordingVideo(screenSharePub.track.mediaStreamTrack, 'ScreenShare');
      }

      if (cameraPub?.track?.mediaStreamTrack) {
        hiddenCameraVideoRef.current = createRecordingVideo(cameraPub.track.mediaStreamTrack, 'Camera');
      }

      // drawCanvas — draws all video sources onto the canvas (pure drawing, no scheduling)
      // IMPORTANT: This function ONLY reads from hiddenScreenShareVideoRef / hiddenCameraVideoRef
      // and draws to canvas. It does NOT create/destroy video elements — that's the useEffect's job.
      const drawCanvas = () => {
        if (!canvasRef.current) return;
        ctx.fillStyle = '#1e293b'; // slate-800 background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Just resume paused videos — don't recreate or destroy them
        const ssVid = hiddenScreenShareVideoRef.current;
        if (ssVid && ssVid.paused) ssVid.play().catch(() => {});
        const camVid = hiddenCameraVideoRef.current;
        if (camVid && camVid.paused) camVid.play().catch(() => {});

        // Check if local teacher is screen sharing (hidden video available via ref)
        const hiddenScreenShareVideo = ssVid;
        const hiddenCameraVideo = camVid;
        // If the hidden video ref exists, try to draw — even if readyState is low.
        // drawImage will silently produce nothing if video has no frame yet, which is fine.
        const hasActiveScreenShare = !!hiddenScreenShareVideo;

        // Also check DOM for viewer-side screen share (remote participant sharing)
        const isScreenShareMode = videoArea.hasAttribute('data-screen-share-active');
        const domVideos = videoArea.querySelectorAll('video');

        if (hasActiveScreenShare) {
          // ─── Teacher is Screen Sharing ───
          // Draw screen share track directly (full canvas)
          try {
            ctx.drawImage(hiddenScreenShareVideo, 0, 0, canvas.width, canvas.height);
          } catch (e) {
            // drawImage can fail if video is not ready — force play and try again next frame
            hiddenScreenShareVideo.play().catch(() => {});
          }

          // Draw camera PiP in bottom-right corner (circular)
          if (hiddenCameraVideo) {
            const pipSize = 160;
            const pipMargin = 24;
            const pipX = canvas.width - pipSize - pipMargin;
            const pipY = canvas.height - pipSize - pipMargin;
            const pipCenterX = pipX + pipSize / 2;
            const pipCenterY = pipY + pipSize / 2;
            const pipRadius = pipSize / 2;

            ctx.save();
            ctx.beginPath();
            ctx.arc(pipCenterX, pipCenterY, pipRadius + 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(52, 211, 153, 0.6)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pipCenterX, pipCenterY, pipRadius, 0, Math.PI * 2);
            ctx.clip();
            try {
              const vw = hiddenCameraVideo.videoWidth || pipSize;
              const vh = hiddenCameraVideo.videoHeight || pipSize;
              const scale = Math.max(pipSize / vw, pipSize / vh);
              const sw = vw * scale;
              const sh = vh * scale;
              const sx = pipX + (pipSize - sw) / 2;
              const sy = pipY + (pipSize - sh) / 2;
              ctx.drawImage(hiddenCameraVideo, sx, sy, sw, sh);
            } catch (e) { /* */ }
            ctx.restore();
          }
        } else if (isScreenShareMode && domVideos.length >= 2) {
          // ─── Remote Screen Share (viewer sees it in DOM) ───
          const pipContainer = videoArea.querySelector('[class*="rounded-full"]');
          let screenShareVideo = null;
          let pipVideo = null;

          if (pipContainer) {
            pipVideo = pipContainer.querySelector('video');
          }
          for (const v of domVideos) {
            if (v !== pipVideo) {
              screenShareVideo = v;
              break;
            }
          }

          if (screenShareVideo) {
            try {
              ctx.drawImage(screenShareVideo, 0, 0, canvas.width, canvas.height);
            } catch (e) { /* cross-origin */ }
          }

          if (pipVideo) {
            const pipSize = 160;
            const pipMargin = 24;
            const pipX = canvas.width - pipSize - pipMargin;
            const pipY = canvas.height - pipSize - pipMargin;
            const pipCenterX = pipX + pipSize / 2;
            const pipCenterY = pipY + pipSize / 2;
            const pipRadius = pipSize / 2;

            ctx.save();
            ctx.beginPath();
            ctx.arc(pipCenterX, pipCenterY, pipRadius + 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(52, 211, 153, 0.6)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pipCenterX, pipCenterY, pipRadius, 0, Math.PI * 2);
            ctx.clip();
            try {
              const vw = pipVideo.videoWidth || pipSize;
              const vh = pipVideo.videoHeight || pipSize;
              const scale = Math.max(pipSize / vw, pipSize / vh);
              const sw = vw * scale;
              const sh = vh * scale;
              const sx = pipX + (pipSize - sw) / 2;
              const sy = pipY + (pipSize - sh) / 2;
              ctx.drawImage(pipVideo, sx, sy, sw, sh);
            } catch (e) { /* cross-origin */ }
            ctx.restore();
          }
        } else if (domVideos.length === 0 && !hasActiveScreenShare) {
          // No videos at all
          ctx.fillStyle = '#475569';
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Recording in progress...', canvas.width / 2, canvas.height / 2);
        } else if (domVideos.length === 1) {
          try {
            ctx.drawImage(domVideos[0], 0, 0, canvas.width, canvas.height);
          } catch (e) { /* cross-origin or no data */ }
        } else {
          // Grid layout for multiple videos (no screen share)
          const cols = Math.ceil(Math.sqrt(domVideos.length));
          const rows = Math.ceil(domVideos.length / cols);
          const cellW = canvas.width / cols;
          const cellH = canvas.height / rows;
          domVideos.forEach((video, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            try {
              ctx.drawImage(video, col * cellW, row * cellH, cellW, cellH);
            } catch (e) { /* cross-origin or no data */ }
          });
        }

      };

      // renderLoop — the rAF loop that schedules itself. drawCanvas is pure drawing,
      // renderLoop adds the scheduling. setInterval calls drawCanvas directly (no rAF).
      const renderLoop = () => {
        drawCanvas();
        canvasAnimFrameRef.current = requestAnimationFrame(renderLoop);
      };

      renderLoop();

      // ALSO use setInterval as a FALLBACK — requestAnimationFrame gets throttled/paused
      // when the tab loses focus (e.g. clicking Chrome's "Hide" button on sharing bar,
      // switching tabs, fullscreening shared content). setInterval keeps running.
      canvasIntervalRef.current = setInterval(() => {
        if (!canvasRef.current) return;
        drawCanvas(); // Direct draw — does NOT schedule rAF (avoids frame stacking)

        // Check for new remote participant audio elements (DOM-based, no stale closure issue)
        if (audioContextRef.current && audioDestRef.current) {
          document.querySelectorAll('audio[data-lk-source]').forEach(el => {
            if (el.srcObject) {
              el.srcObject.getAudioTracks().forEach(t => {
                if (!connectedAudioTrackIdsRef.current.has(t.id)) {
                  try {
                    const src = audioContextRef.current.createMediaStreamSource(new MediaStream([t]));
                    src.connect(audioDestRef.current);
                    connectedAudioTrackIdsRef.current.add(t.id);
                    console.log("[Recording] Interval: added new remote audio source");
                  } catch (e) { /* already connected */ }
                }
              });
            }
          });
        }
      }, 200); // 5fps fallback — keeps recording alive when tab is in background

      // Get canvas stream at 24fps for smooth playback
      const canvasStream = canvas.captureStream(24);
      canvasStreamRef.current = canvasStream;

      // ── Audio capture: Use AudioContext to MIX all sources into one stream ──
      // This ensures mic + screen share audio + remote participants all get recorded.
      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      let audioSourceCount = 0;

      // 1. Teacher's microphone
      const audioPublication = localParticipant?.getTrackPublication(Track.Source.Microphone);
      if (audioPublication?.track?.mediaStreamTrack) {
        try {
          const micSource = audioCtx.createMediaStreamSource(new MediaStream([audioPublication.track.mediaStreamTrack]));
          micSource.connect(dest);
          audioSourceCount++;
          console.log("[Recording] Audio: added teacher mic");
        } catch (e) { console.warn("[Recording] Audio: mic capture failed:", e); }
      }

      // 2. Screen share audio (system audio from shared tab/window)
      const screenShareAudioPub = localParticipant?.getTrackPublication(Track.Source.ScreenShareAudio);
      if (screenShareAudioPub?.track?.mediaStreamTrack) {
        try {
          const ssAudioSource = audioCtx.createMediaStreamSource(new MediaStream([screenShareAudioPub.track.mediaStreamTrack]));
          ssAudioSource.connect(dest);
          audioSourceCount++;
          console.log("[Recording] Audio: added screen share audio (system audio)");
        } catch (e) { console.warn("[Recording] Audio: screen share audio capture failed:", e); }
      }

      // 3. Remote participants' audio — from DOM <audio> elements
      const audioElements = document.querySelectorAll('audio[data-lk-source]');
      audioElements.forEach(el => {
        if (el.srcObject) {
          try {
            const remoteSource = audioCtx.createMediaStreamSource(el.srcObject);
            remoteSource.connect(dest);
            audioSourceCount++;
          } catch (e) { /* already connected or cross-origin */ }
        }
      });

      console.log(`[Recording] Audio: ${audioSourceCount} sources mixed via AudioContext`);
      const audioTracks = dest.stream.getAudioTracks();

      // Store AudioContext ref for cleanup and for dynamically adding screen share audio later
      audioContextRef.current = audioCtx;
      audioDestRef.current = dest;
      connectedAudioTrackIdsRef.current = new Set();
      // Track already-connected audio source IDs to avoid duplicates
      if (audioPublication?.track?.mediaStreamTrack) connectedAudioTrackIdsRef.current.add(audioPublication.track.mediaStreamTrack.id);
      if (screenShareAudioPub?.track?.mediaStreamTrack) connectedAudioTrackIdsRef.current.add(screenShareAudioPub.track.mediaStreamTrack.id);
      audioElements.forEach(el => {
        el.srcObject?.getAudioTracks().forEach(t => connectedAudioTrackIdsRef.current.add(t.id));
      });

      // Combine canvas video + audio tracks
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioTracks,
      ]);

      // Monitor all tracks for unexpected 'ended' events (e.g. getDisplayMedia interrupting audio)
      combinedStream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.warn(`[Recording] Track ended unexpectedly: ${track.kind} (${track.label || track.id})`);
          // If this was an audio track and recording is still active, try to keep going
          // The MediaRecorder might stop — our onstop handler will detect recordingIntendedStopRef
        });
      });

      // Keep AudioContext alive — getDisplayMedia can suspend it on some browsers
      const keepAudioCtxAlive = setInterval(() => {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          console.log("[Recording] AudioContext suspended, resuming...");
          audioContextRef.current.resume().catch(() => {});
        }
      }, 1000);
      // Store for cleanup
      audioCtxKeepAliveRef.current = keepAudioCtxAlive;

      recordingStreamRef.current = null; // We manage canvas stream separately
      setupMediaRecorder(combinedStream);

      setIsRecording(true);
      setIsRecordingPaused(false);

      console.log("[Recording] Canvas-based recording started — capturing all participants");

      // Backend API call -- non-blocking
      startVconfRecording(activeMeetingId).catch(e => {
        console.warn("Backend recording API failed, but local recording continues:", e);
      });
    } catch (e) {
      console.error("[Recording] Canvas recording failed, trying direct track capture:", e);
      return startDirectTrackRecording();
    }
  };

  // Fallback: direct track recording (original approach, improved)
  const startDirectTrackRecording = async () => {
    try {
      recordingIntendedStopRef.current = false;

      // Prefer screen share track over camera if teacher is sharing
      const screenSharePub = localParticipant?.getTrackPublication(Track.Source.ScreenShare);
      const videoPublication = screenSharePub || localParticipant?.getTrackPublication(Track.Source.Camera);
      const audioPublication = localParticipant?.getTrackPublication(Track.Source.Microphone);

      const tracks = [];
      if (videoPublication?.track?.mediaStreamTrack) {
        tracks.push(videoPublication.track.mediaStreamTrack);
      }
      // Also include camera if screen share is the primary video
      if (screenSharePub?.track?.mediaStreamTrack) {
        const cameraPub = localParticipant?.getTrackPublication(Track.Source.Camera);
        if (cameraPub?.track?.mediaStreamTrack) {
          tracks.push(cameraPub.track.mediaStreamTrack);
        }
      }
      if (audioPublication?.track?.mediaStreamTrack) {
        tracks.push(audioPublication.track.mediaStreamTrack);
      }

      if (tracks.length === 0) {
        // Fallback: request camera+mic directly for recording only
        console.warn("[Recording] No LiveKit tracks, requesting getUserMedia fallback");
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          recordingStreamRef.current = fallbackStream; // We own this stream
          setupMediaRecorder(fallbackStream);
          setIsRecording(true);
          setIsRecordingPaused(false);
          startVconfRecording(activeMeetingId).catch(() => {});
          return;
        } catch (fallbackErr) {
          console.error("[Recording] getUserMedia fallback also failed:", fallbackErr);
          recordingStartedRef.current = false;
          return;
        }
      }

      console.log("[Recording] Using direct LiveKit tracks:", tracks.map(t => t.kind).join(', '));
      const combinedStream = new MediaStream(tracks);
      recordingStreamRef.current = null;
      setupMediaRecorder(combinedStream);

      setIsRecording(true);
      setIsRecordingPaused(false);

      startVconfRecording(activeMeetingId).catch(e => {
        console.warn("Backend recording API failed, but local recording continues:", e);
      });
    } catch (e) {
      console.error("[Recording] Failed to start recording:", e);
      setMediaError("Recording failed: " + (e.message || "Permission denied"));
      setTimeout(() => setMediaError(""), 5000);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        console.log("[Recording] Toggle pause. State:", mediaRecorderRef.current.state, "isPaused:", isRecordingPaused);
        if (!isRecordingPaused) {
          try {
            if (mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.pause();
            }
            setIsRecordingPaused(true);
            setMediaError("Recording paused");
            setTimeout(() => setMediaError(""), 2000);
          } catch (e) {
            console.error("[Recording] Failed to pause:", e);
          }
        } else {
          try {
            if (mediaRecorderRef.current.state === 'paused') {
              mediaRecorderRef.current.resume();
            }
            setIsRecordingPaused(false);
            setMediaError("Recording resumed");
            setTimeout(() => setMediaError(""), 2000);
          } catch (e) {
            console.error("[Recording] Failed to resume:", e);
          }
        }
      } else {
        // MediaRecorder lost (e.g. after HMR) -- restart recording
        console.warn("[Recording] MediaRecorder lost, restarting...");
        setIsRecording(false);
        recordingStartedRef.current = false;
        setMediaError("Restarting recording...");
        setTimeout(() => setMediaError(""), 2000);
      }
    } else {
      // Manual start recording
      await startLocalRecording();
    }
  };

  const handleManualInject = async (e) => {
    e.preventDefault();
    // Transcript injection disabled (AI features removed)
    setManualText("");
  };

  useEffect(() => {
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleAudioPlaybackChanged = (canPlayback) => {
      setCanPlaybackAudio(canPlayback);
    };
    room.on('audioPlaybackChanged', handleAudioPlaybackChanged);

    const handleDataReceived = (payload) => {
      try {
        const str = new TextDecoder().decode(payload);
        const data = JSON.parse(str);

        if (user?.role !== 'teacher') {
          if (data.type === 'MUTE_ALL') {
            localParticipant?.setMicrophoneEnabled(false);
          } else if (data.type === 'LOCK_MIC') {
            localParticipant?.setMicrophoneEnabled(false);
            setMicLocked(true);
          } else if (data.type === 'UNLOCK_MIC') {
            setMicLocked(false);
          } else if (data.type === 'LOCK_CAM') {
            localParticipant?.setCameraEnabled(false);
            setCamLocked(true);
          } else if (data.type === 'UNLOCK_CAM') {
            setCamLocked(false);
          } else if (data.type === 'LOCK_SCREEN') {
            localParticipant?.setScreenShareEnabled(false);
            setScreenLocked(true);
          } else if (data.type === 'UNLOCK_SCREEN') {
            setScreenLocked(false);
          } else if (data.type === 'TOGGLE_MIC' && localParticipant?.identity === data.targetIdentity) {
            localParticipant?.setMicrophoneEnabled(false);
          } else if (data.type === 'GRANT_MIC' && localParticipant?.identity === data.targetIdentity) {
            setMicLocked(false);
            setMediaError("Teacher has granted you permission to speak.");
            setTimeout(() => setMediaError(""), 3000);
          } else if (data.type === 'FORCE_TAB') {
            setShowRightPanel(data.tab);
          } else if (data.type === 'CLASS_ENDED') {
            // Teacher explicitly ended the class — show "Class Ended" screen
            classEndedByTeacherRef.current = true;
            setClassEnded('ended');
          }
        }

        if (data.type === 'HAND_RAISE') {
          setRaisedHands(prev => new Set(prev).add(data.identity));
        } else if (data.type === 'LOWER_HAND') {
          setRaisedHands(prev => {
            const next = new Set(prev);
            next.delete(data.identity);
            return next;
          });
          if (localParticipant?.identity === data.identity) {
            setIsHandRaised(false);
          }
        } else if (data.type === 'LOWER_ALL_HANDS') {
          setRaisedHands(new Set());
          setIsHandRaised(false);
        }

        // ─── Phase 1 DataChannel Routing ───
        // Chat
        if (data.type === 'CHAT_MSG') {
          chatHook.handleIncoming(data);
        }
        // Polls
        if (data.type === 'POLL_LAUNCH' || data.type === 'POLL_CLOSE' || data.type === 'POLL_RESULTS' || data.type === 'POLL_RESPONSE') {
          pollHook.handleIncoming(data);
        }
        // Q&A
        if (data.type === 'QNA_NEW' || data.type === 'QNA_UPVOTE' || data.type === 'QNA_ANSWER' || data.type === 'QNA_DISMISS' || data.type === 'QNA_HIGHLIGHT') {
          qnaHook.handleIncoming(data);
        }
        // Captions
        if (data.type === 'CAPTION_UPDATE' || data.type === 'CAPTION_CLEAR') {
          captionHook.handleIncoming(data);
        }
      } catch (e) { }
    };
    room.on('dataReceived', handleDataReceived);

    // LiveKit STT handler (transcript storage disabled — AI features removed)
    const handleTranscription = (segments, participant) => {
      // No-op: transcript insertion disabled
    };
    room.on('transcriptionReceived', handleTranscription);

    setCanPlaybackAudio(room.canPlaybackAudio);
    return () => {
      room.off('audioPlaybackChanged', handleAudioPlaybackChanged);
      room.off('dataReceived', handleDataReceived);
      room.off('transcriptionReceived', handleTranscription);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, user, activeMeetingId]);

  // Fallback: Use Browser Speech Recognition since local LiveKit doesn't have an STT agent configured
  useEffect(() => {
    let recognition = null;
    if (SpeechRecognition && isMicrophoneEnabled && activeMeetingId && localParticipant) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        // Transcript insertion disabled (AI features removed)
        // Speech recognition still runs for local display if needed
      };

      recognition.onerror = (event) => {
        // 'no-speech' fires continuously during silence — don't spam the console
        if (event.error !== 'no-speech') {
          console.warn("Speech Recognition Error:", event.error);
        }
        if (event.error === 'not-allowed') {
          // fatal, we don't try to restart
          recognition.stoppedByError = true;
        }
      };

      recognition.onend = () => {
        // Automatically restart speech recognition after silence or completion
        if (!recognition.stoppedByError && isMicrophoneEnabled) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) { }
          }, 1000);
        }
      };

      try {
        recognition.start();
      } catch (e) { }
    }

    return () => {
      if (recognition) {
        recognition.stoppedByError = true; // prevent auto-restart on unmount
        try {
          recognition.stop();
        } catch (e) { }
      }
    };
  }, [isMicrophoneEnabled, activeMeetingId, localParticipant, user]);

  const sendCommand = (cmd) => {
    if (localParticipant) {
      const encoded = new TextEncoder().encode(JSON.stringify(cmd));
      localParticipant.publishData(encoded, { reliable: true });
    }
  };

  const handleRaiseHand = () => {
    if (!isHandRaised) {
      sendCommand({ type: 'HAND_RAISE', identity: localParticipant?.identity });
      setIsHandRaised(true);
    } else {
      sendCommand({ type: 'LOWER_HAND', identity: localParticipant?.identity });
      setIsHandRaised(false);
    }
  };

  const grantSpeakingPermission = (identity) => {
    sendCommand({ type: 'GRANT_MIC', targetIdentity: identity });
    sendCommand({ type: 'LOWER_HAND', identity: identity });
  };

  const lowerStudentHand = (identity) => {
    sendCommand({ type: 'LOWER_HAND', identity: identity });
  };

  const lowerAllHands = () => {
    sendCommand({ type: 'LOWER_ALL_HANDS' });
    setRaisedHands(new Set());
  };

  const syncDashboardTab = () => {
    sendCommand({ type: 'FORCE_TAB', tab: 'dashboard' });
  };

  const toggleMic = async () => {
    if (!localParticipant) return;
    if (micLocked && !isMicrophoneEnabled) {
      setMediaError("Teacher has disabled microphones for students.");
      setTimeout(() => setMediaError(""), 3000);
      return;
    }
    try {
      console.log(`[MeetingRoom] Toggling mic from ${isMicrophoneEnabled} to ${!isMicrophoneEnabled}`);
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      setMediaError("");
    } catch (e) {
      console.error("[MeetingRoom] Microphone error:", e);
      setMediaError(`Microphone error: ${e.message || "Permission denied"}`);
      setTimeout(() => setMediaError(""), 5000);
    }
  };

  const toggleCamera = async () => {
    if (!localParticipant) return;
    if (camLocked && !isCameraEnabled) {
      setMediaError("Teacher has disabled cameras for students.");
      setTimeout(() => setMediaError(""), 3000);
      return;
    }
    try {
      const newState = !isCameraEnabled;
      console.log(`[MeetingRoom] Toggling camera from ${isCameraEnabled} to ${newState}`);
      await localParticipant.setCameraEnabled(newState);

      // Also release the physical camera from the recording stream
      if (!newState && recordingStreamRef.current) {
        recordingStreamRef.current.getVideoTracks().forEach(track => track.stop());
      }

      setMediaError("");
    } catch (e) {
      console.error("[MeetingRoom] Camera error:", e);
      setMediaError(`Camera error: ${e.message || "Permission denied"}`);
      setTimeout(() => setMediaError(""), 5000);
    }
  };

  const toggleScreenShare = async () => {
    if (!localParticipant) return;
    if (screenLocked && !isScreenShareEnabled) {
      setMediaError("Teacher has disabled screen sharing for students.");
      setTimeout(() => setMediaError(""), 3000);
      return;
    }
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled, {
        audio: true, // Capture system audio (works for Chrome tab sharing)
        surfaceSwitching: 'include',
        selfBrowserSurface: 'exclude',
        systemAudio: 'include',
        preferCurrentTab: false,
      });
      // After getDisplayMedia completes, resume AudioContext if it got suspended.
      // Some browsers suspend the AudioContext when getDisplayMedia is called,
      // which kills the audio track in the recording stream and stops MediaRecorder.
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log("[Recording] AudioContext suspended after screen share toggle, resuming...");
        audioContextRef.current.resume().catch(() => {});
      }
      setMediaError("");
    } catch (e) {
      console.error("[MeetingRoom] Screen share error:", e);
      setMediaError(`Screen share error: ${e.message || "Permission denied"}`);
      setTimeout(() => setMediaError(""), 5000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
  };

  // handleSendMessage removed — chat now handled by ChatPanel component

  // Hand raise overlay on participant video tiles
  useEffect(() => {
    // Inject CSS for hand-raise overlay (once)
    if (!document.head.querySelector('[data-hand-raise-styles]')) {
      const style = document.createElement('style');
      style.setAttribute('data-hand-raise-styles', '');
      style.textContent = `
        .hand-raise-tile-overlay {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(245, 158, 11, 0.9);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          z-index: 10;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          animation: hand-raise-bounce 1s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes hand-raise-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `;
      document.head.appendChild(style);
    }

    // Build a set of display names whose hands are raised
    const raisedNames = new Set();
    participants.forEach((p) => {
      if (raisedHands.has(p.identity)) {
        raisedNames.add(p.name || p.identity);
      }
    });

    const updateOverlays = () => {
      const tiles = document.querySelectorAll('.lk-participant-tile');
      tiles.forEach(tile => {
        const nameEl = tile.querySelector('.lk-participant-name');
        const name = nameEl?.textContent?.trim() || tile.getAttribute('data-lk-participant-name');
        const overlay = tile.querySelector('.hand-raise-tile-overlay');

        if (name && raisedNames.has(name)) {
          if (!overlay) {
            const el = document.createElement('div');
            el.className = 'hand-raise-tile-overlay';
            el.textContent = '\u270B';
            tile.style.position = 'relative';
            tile.appendChild(el);
          }
        } else if (overlay) {
          overlay.remove();
        }
      });
    };

    updateOverlays();
    // Poll because LiveKit may re-render tiles
    const interval = setInterval(updateOverlays, 500);
    return () => clearInterval(interval);
  }, [raisedHands, participants]);

  return (
    <>
      {/* Top Bar */}
      <header className="h-12 flex items-center justify-between px-4 bg-slate-900/90 border-b border-slate-800 z-10 w-full shrink-0 overflow-hidden">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">{meetingData?.title || 'Meeting Room'}</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400 capitalize">{meetingData?.mode || 'Hybrid'} Mode</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <div className={"w-2 h-2 rounded-full " + (isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600')}></div>
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isRecording && (
            <div className="px-3 py-1 bg-red-900/50 border border-red-500/30 rounded-full flex items-center space-x-2">
              <Disc size={12} className="text-red-400 animate-pulse" />
              <span className="text-xs text-red-300 font-medium">Recording</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative w-full">
        {mediaError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center animate-in slide-in-from-top-4">
            <span className="font-semibold text-sm mr-2">{mediaError}</span>
            <button onClick={() => setMediaError("")} className="text-red-200 hover:text-white"><X size={16} /></button>
          </div>
        )}

        {!canPlaybackAudio && (
          <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center space-x-3 cursor-pointer hover:bg-amber-600 transition-colors" onClick={() => room.startAudio()}>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
              <Mic size={16} />
            </div>
            <div>
              <p className="text-sm font-bold">Click to Enable Audio</p>
              <p className="text-[10px] text-amber-100 mt-0.5">Browser blocked autoplay for remote users.</p>
            </div>
          </div>
        )}

        {/* In-app "Stop Sharing" banner — lets the teacher stop screen share without
            needing Chrome's native notification bar. Chrome's "Hide" button only hides
            the native bar; this banner stays visible so there's always a way to stop. */}
        {isScreenShareEnabled && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center space-x-3 backdrop-blur-sm border border-blue-400/30 animate-in slide-in-from-top-4">
            <Monitor size={16} className="text-blue-200 shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap">You are sharing your screen</span>
            <button
              onClick={toggleScreenShare}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Stop Sharing
            </button>
          </div>
        )}

        {isHandRaised && user?.role === 'student' && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center space-x-2 backdrop-blur-sm animate-bounce">
            <Hand size={14} />
            <span className="text-xs font-bold">Your hand is raised</span>
            <button onClick={handleRaiseHand} className="text-[10px] bg-white text-amber-600 px-2 py-0.5 rounded-full font-bold ml-2">Lower</button>
          </div>
        )}

        {showDebug && (
          <div className="absolute top-20 left-4 bg-black/80 text-green-400 font-mono text-[10px] p-4 rounded-xl shadow-xl z-50 w-72 backdrop-blur-sm border border-green-500/30">
            <h4 className="border-b border-green-500/50 pb-1 mb-2 font-bold text-green-300">LiveKit Dev Debug</h4>
            <div className="space-y-1">
              <p>Room: {room.name}</p>
              <p>State: {room.state}</p>
              <p>Connection: {connectionState}</p>
              <p>Audio Playback: {canPlaybackAudio ? 'Allowed' : 'Blocked'}</p>
              <p>Mic Published: {isMicrophoneEnabled ? 'Yes' : 'No'}</p>
              <p>Cam Published: {isCameraEnabled ? 'Yes' : 'No'}</p>
              <p>My Identity: {localParticipant?.identity}</p>
              <p>Mic Tracks: {localParticipant?.audioTrackPublications.size || 0}</p>
              <p>Cam Tracks: {localParticipant?.videoTrackPublications.size || 0}</p>
            </div>
          </div>
        )}

        <div className="relative flex-1 bg-black livekit-custom-container h-full overflow-hidden flex flex-col">
          <div className="relative flex-1 overflow-hidden">
            <CustomVideoLayout meetingTitle={meetingData?.title} />
            <RoomAudioRenderer />
            {/* Caption Overlay — floating on video */}
            <CaptionOverlay
              currentCaption={captionHook.currentCaption}
              captionsEnabled={captionHook.captionsEnabled}
              settings={captionHook.settings}
              updateSettings={captionHook.updateSettings}
            />
          </div>
          {/* Teacher Caption Input — above footer */}
          {user?.role === 'teacher' && (
            <CaptionInput
              sendCaption={captionHook.sendCaption}
              clearCaption={captionHook.clearCaption}
            />
          )}
        </div>

        {/* Right Panel */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className={"w-80 border-l flex flex-col shadow-xl z-20 h-full " + (
                showRightPanel === 'polls' || showRightPanel === 'qna' || showRightPanel === 'chat'
                  ? 'bg-slate-900 border-slate-700'
                  : 'bg-white border-slate-200'
              )}
            >
              <div className={"h-12 border-b flex items-center justify-between px-4 " + (
                showRightPanel === 'polls' || showRightPanel === 'qna' || showRightPanel === 'chat'
                  ? 'border-slate-700 bg-slate-800'
                  : 'border-slate-200 bg-slate-50'
              )}>
                <h3 className={"font-semibold text-sm uppercase tracking-wide " + (
                  showRightPanel === 'polls' || showRightPanel === 'qna' || showRightPanel === 'chat'
                    ? 'text-slate-200'
                    : 'text-slate-800'
                )}>
                  {showRightPanel === 'chat' && 'Meeting Chat'}
                  {showRightPanel === 'participants' && 'Participants (' + participants.length + ')'}
                  {showRightPanel === 'ai' && 'Live Transcript'}
                  {showRightPanel === 'admin' && 'Admin Panel'}
                  {showRightPanel === 'dashboard' && 'Class Dashboard'}
                  {showRightPanel === 'polls' && 'Polls & Quizzes'}
                  {showRightPanel === 'qna' && 'Q&A'}
                </h3>
                <button onClick={() => setShowRightPanel(null)} className={
                  showRightPanel === 'polls' || showRightPanel === 'qna' || showRightPanel === 'chat'
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-400 hover:text-slate-600'
                }>
                  <X size={18} />
                </button>
              </div>

              <div className={"flex-1 overflow-y-auto " + (
                showRightPanel === 'polls' || showRightPanel === 'qna' || showRightPanel === 'chat'
                  ? 'bg-slate-900'
                  : 'bg-slate-50/50'
              )}>
                {showRightPanel === 'chat' && (
                  <ChatPanel
                    messages={chatHook.messages}
                    sendMessage={chatHook.sendMessage}
                    userName={user?.name || user?.email || "Unknown"}
                    userRole={user?.role === "teacher" ? "teacher" : "student"}
                  />
                )}

                {showRightPanel === 'polls' && (
                  <PollPanel
                    polls={pollHook.polls}
                    activePoll={pollHook.activePoll}
                    pollResults={pollHook.pollResults}
                    votedPolls={pollHook.votedPolls}
                    createPoll={pollHook.createPoll}
                    launchPoll={pollHook.launchPoll}
                    closePoll={pollHook.closePoll}
                    vote={pollHook.vote}
                    fetchResults={pollHook.fetchResults}
                    broadcastResults={pollHook.broadcastResults}
                    isTeacher={user?.role === 'teacher'}
                  />
                )}

                {showRightPanel === 'qna' && (
                  <QnAPanel
                    questions={qnaHook.questions}
                    highlightedIdx={qnaHook.highlightedIdx}
                    askQuestion={qnaHook.askQuestion}
                    upvote={qnaHook.upvote}
                    answer={qnaHook.answer}
                    dismiss={qnaHook.dismiss}
                    highlight={qnaHook.highlight}
                    isTeacher={user?.role === 'teacher'}
                    userId={user?._id}
                  />
                )}

                {showRightPanel === 'ai' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-600 space-y-2 font-mono flex-1 overflow-y-auto bg-white p-3 rounded-xl border border-slate-200 flex flex-col-reverse" style={{ minHeight: '300px' }}>
                      {liveTranscripts.length === 0 ? (
                        <p className="text-slate-400 italic text-center">No transcripts yet. Speak to start transcribing...</p>
                      ) : liveTranscripts.map((t, idx) => {
                        const mins = Math.floor((t.time || 0) / 60);
                        const secs = Math.floor((t.time || 0) % 60);
                        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                        return (
                          <p key={idx} className="py-1 border-b border-slate-100 last:border-0">
                            <span className="text-slate-400 text-[10px] mr-1">[{timeStr}]</span>
                            <span className="text-indigo-600 font-bold">{t.speaker}:</span> {t.text}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}

                {showRightPanel === 'dashboard' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Participation Sync</h4>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Users size={16} className="text-indigo-500" />
                          <span className="text-sm font-semibold">{participants.length} Active</span>
                        </div>
                        {user?.role === 'teacher' && (
                          <button
                            onClick={syncDashboardTab}
                            className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                          >
                            Sync to All
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Class Focus</span>
                          <span className="text-emerald-500 font-bold">High (85%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full w-[85%]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-indigo-700 uppercase mb-2">Topic Progress</h4>
                      <div className="space-y-2">
                        {['Introduction', 'Core Architecture', 'Permission Logic'].map((topic, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full border border-indigo-300 flex items-center justify-center">
                              {i === 0 && <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>}
                            </div>
                            <span className={`text-xs ${i === 0 ? 'text-indigo-900 font-semibold' : 'text-indigo-400 font-medium'}`}>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(user?.role === 'teacher' ? '/schedule' : '/student-home')}
                      className="w-full py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ArrowUpRight size={14} />
                      <span>Full Dashboard</span>
                    </button>
                  </div>
                )}

                {showRightPanel === 'participants' && (
                  <div className="space-y-4">
                    {user?.role === 'teacher' && (
                      <div className="space-y-2 mb-4 border-b border-slate-200 pb-4">
                        <button
                          onClick={() => { sendCommand({ type: 'MUTE_ALL' }); setMediaError("All students muted"); setTimeout(() => setMediaError(""), 2000); }}
                          className="w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                        >
                          Mute All Students
                        </button>
                        <button
                          onClick={() => { lowerAllHands(); setMediaError("All hands lowered"); setTimeout(() => setMediaError(""), 2000); }}
                          className="w-full bg-amber-50 text-amber-600 border border-amber-200 py-2 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors"
                        >
                          Lower All Hands
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => { sendCommand({ type: 'LOCK_MIC' }); setStudentMicLocked(true); setMediaError("Student mics locked"); setTimeout(() => setMediaError(""), 2000); }}
                            className={"py-1.5 rounded-lg text-xs font-semibold transition-colors " + (studentMicLocked ? "bg-red-600 text-white ring-2 ring-red-300" : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200")}
                          >
                            {studentMicLocked ? "Mics Locked" : "Lock Mics"}
                          </button>
                          <button
                            onClick={() => { sendCommand({ type: 'UNLOCK_MIC' }); setStudentMicLocked(false); setMediaError("Student mics unlocked"); setTimeout(() => setMediaError(""), 2000); }}
                            className={"py-1.5 rounded-lg text-xs font-semibold transition-colors " + (!studentMicLocked ? "bg-emerald-600 text-white ring-2 ring-emerald-300" : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200")}
                          >
                            {!studentMicLocked ? "Mics Open" : "Unlock Mics"}
                          </button>
                          <button
                            onClick={() => { sendCommand({ type: 'LOCK_CAM' }); setStudentCamLocked(true); setMediaError("Student cameras locked"); setTimeout(() => setMediaError(""), 2000); }}
                            className={"py-1.5 rounded-lg text-xs font-semibold transition-colors " + (studentCamLocked ? "bg-red-600 text-white ring-2 ring-red-300" : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200")}
                          >
                            {studentCamLocked ? "Cams Locked" : "Lock Cams"}
                          </button>
                          <button
                            onClick={() => { sendCommand({ type: 'UNLOCK_CAM' }); setStudentCamLocked(false); setMediaError("Student cameras unlocked"); setTimeout(() => setMediaError(""), 2000); }}
                            className={"py-1.5 rounded-lg text-xs font-semibold transition-colors " + (!studentCamLocked ? "bg-emerald-600 text-white ring-2 ring-emerald-300" : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200")}
                          >
                            {!studentCamLocked ? "Cams Open" : "Unlock Cams"}
                          </button>
                          <button
                            onClick={() => { sendCommand({ type: 'LOCK_SCREEN' }); setStudentScreenLocked(true); setMediaError("Student screens locked"); setTimeout(() => setMediaError(""), 2000); }}
                            className={"py-1.5 rounded-lg text-xs font-semibold transition-colors " + (studentScreenLocked ? "bg-red-600 text-white ring-2 ring-red-300" : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200")}
                          >
                            {studentScreenLocked ? "Screens Locked" : "Lock Screens"}
                          </button>
                          <button
                            onClick={() => { sendCommand({ type: 'UNLOCK_SCREEN' }); setStudentScreenLocked(false); setMediaError("Student screens unlocked"); setTimeout(() => setMediaError(""), 2000); }}
                            className={"py-1.5 rounded-lg text-xs font-semibold transition-colors " + (!studentScreenLocked ? "bg-emerald-600 text-white ring-2 ring-emerald-300" : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200")}
                          >
                            {!studentScreenLocked ? "Screens Open" : "Unlock Screens"}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {participants.map((p) => (
                        <div key={p.identity} className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors group">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                                {p.identity.charAt(0).toUpperCase()}
                              </div>
                              {raisedHands.has(p.identity) && (
                                <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border border-white">
                                  <Hand size={8} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                                {p.identity}
                                {raisedHands.has(p.identity) && <span className="text-[10px] bg-amber-100 text-amber-700 px-1 rounded font-bold">Raised Hand</span>}
                              </p>
                              <p className="text-[10px] text-slate-500">{p.isLocal ? "Me" : "Remote"}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2 items-center">
                            <div className="flex space-x-1">
                              {!p.isMicrophoneEnabled ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-slate-400" />}
                              {!p.isCameraEnabled ? <VideoOff size={14} className="text-red-400" /> : <Video size={14} className="text-slate-400" />}
                            </div>
                            {user?.role === 'teacher' && !p.isLocal && (
                              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {raisedHands.has(p.identity) && (
                                  <button
                                    onClick={() => grantSpeakingPermission(p.identity)}
                                    className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded hover:bg-emerald-700"
                                  >
                                    Allow
                                  </button>
                                )}
                                {raisedHands.has(p.identity) && (
                                  <button
                                    onClick={() => lowerStudentHand(p.identity)}
                                    className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded hover:bg-amber-700"
                                  >
                                    Lower
                                  </button>
                                )}
                                {p.isMicrophoneEnabled && (
                                  <button
                                    onClick={() => sendCommand({ type: 'TOGGLE_MIC', targetIdentity: p.identity })}
                                    className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded hover:bg-slate-700"
                                  >
                                    Mute
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showRightPanel === 'admin' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700">Inject Transcript (Testing)</h4>
                    <form onSubmit={handleManualInject} className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500">Speaker Name</label>
                        <input
                          type="text"
                          className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800"
                          value={manualSpeaker}
                          onChange={e => setManualSpeaker(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500">Transcript Text</label>
                        <textarea
                          className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800"
                          rows={3}
                          value={manualText}
                          onChange={e => setManualText(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors">
                        Send to DB
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Chat input is now inside ChatPanel component */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Control Bar */}
      <footer className="h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-3 z-20 w-full shrink-0 overflow-hidden">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">Connected</span>
            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
              <Wifi size={10} /> LiveKit
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 flex-1 min-w-0">
          <ControlButton
            icon={isMicrophoneEnabled ? Mic : MicOff}
            active={isMicrophoneEnabled}
            onClick={toggleMic}
            label={isMicrophoneEnabled ? "Mute" : "Unmute"}
            variant="secondary"
          />
          <ControlButton
            icon={isCameraEnabled ? Video : VideoOff}
            active={isCameraEnabled}
            onClick={toggleCamera}
            label={isCameraEnabled ? "Stop Video" : "Start Video"}
            variant="secondary"
          />

          <div className="h-8 w-px bg-slate-700 mx-2"></div>

          <ControlButton
            icon={Monitor}
            active={isScreenShareEnabled}
            onClick={toggleScreenShare}
            label="Share"
            variant="secondary"
          />

          {user?.role === 'student' && (
            <ControlButton
              icon={Hand}
              active={isHandRaised}
              onClick={handleRaiseHand}
              label={isHandRaised ? "Lower Hand" : "Raise Hand"}
              variant={isHandRaised ? 'ai' : 'ghost'}
            />
          )}

          {user?.role === 'teacher' && (
            <>
              <button
                onClick={handleToggleRecording}
                disabled={!isRecording}
                className={"flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all shrink-0 " + (
                  isRecordingPaused
                    ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                    : isRecording
                      ? 'bg-slate-800 text-amber-500 hover:bg-slate-700 text-amber-400'
                      : 'bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed'
                )}
              >
                {isRecordingPaused ? <Play size={24} /> : <Pause size={24} />}
                <span className="text-[10px] mt-1 font-medium">{!isRecording ? "Record" : isRecordingPaused ? "Resume" : "Pause"}</span>
              </button>

              <div className="h-8 w-px bg-slate-700 mx-2"></div>
            </>
          )}

          <button
            onClick={async () => {
              try {
                // Flush all Phase 1 buffers before ending
                try {
                  await Promise.allSettled([
                    chatHook.flushMessages(),
                    captionHook.flushCaptions(),
                  ]);
                } catch (flushErr) {
                  console.warn("[MeetingRoom] Buffer flush error:", flushErr);
                }

                if (user?.role === 'teacher' && activeMeetingId) {
                  // Stop recording and upload
                  if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    recordingIntendedStopRef.current = true;

                    const uploadPromise = new Promise((resolve) => {
                      const timeout = setTimeout(resolve, 120000); // 2min timeout for Azure uploads
                      const oldOnStop = mediaRecorderRef.current.onstop;
                      mediaRecorderRef.current.onstop = async (e) => {
                        clearTimeout(timeout);
                        if (oldOnStop) await oldOnStop(e);
                        resolve();
                      };
                    });

                    mediaRecorderRef.current.stop();
                    stopVconfRecording(activeMeetingId).catch(() => {});
                    await uploadPromise;
                  }

                  // Release camera/mic
                  if (recordingStreamRef.current) {
                    recordingStreamRef.current.getTracks().forEach(track => track.stop());
                    recordingStreamRef.current = null;
                  }

                  endVconfMeeting(activeMeetingId).catch(e => console.warn("endMeeting:", e));
                }
              } catch (e) {
                console.error("Failed to end class:", e);
              }

              if (user?.role === 'teacher') {
                // Notify all students that the class has been ended by teacher
                sendCommand({ type: 'CLASS_ENDED' });
                // Small delay to ensure DataChannel message is delivered before disconnecting
                await new Promise(resolve => setTimeout(resolve, 500));
              }

              classEndedByTeacherRef.current = true;
              room.disconnect();
              sessionStorage.removeItem(`joined_${activeMeetingId}`);
              setClassEnded('ended');
            }}
            className="flex items-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-lg shadow-red-900/20 cursor-pointer shrink-0"
          >
            <PhoneOff size={16} className="mr-1.5" />
            {user?.role === 'teacher' ? 'End' : 'Leave'}
          </button>
        </div>

        <div className="flex items-center justify-end space-x-1 shrink-0">
          <ControlButton
            icon={MessageSquare}
            active={showRightPanel === 'chat'}
            onClick={() => setShowRightPanel(showRightPanel === 'chat' ? null : 'chat')}
            label="Chat"
            variant="ghost"
          />
          <ControlButton
            icon={BarChart3}
            active={showRightPanel === 'polls'}
            onClick={() => setShowRightPanel(showRightPanel === 'polls' ? null : 'polls')}
            label="Polls"
            variant="ghost"
          />
          <ControlButton
            icon={HelpCircle}
            active={showRightPanel === 'qna'}
            onClick={() => setShowRightPanel(showRightPanel === 'qna' ? null : 'qna')}
            label="Q&A"
            variant="ghost"
          />
          <ControlButton
            icon={Subtitles}
            active={captionHook.captionsEnabled}
            onClick={() => captionHook.setCaptionsEnabled(!captionHook.captionsEnabled)}
            label="CC"
            variant="ghost"
          />
          <ControlButton
            icon={Users}
            active={showRightPanel === 'participants'}
            onClick={() => setShowRightPanel(showRightPanel === 'participants' ? null : 'participants')}
            label="People"
            variant="ghost"
          />
          <ControlButton
            icon={Hand}
            active={showRightPanel === 'ai'}
            onClick={() => setShowRightPanel(showRightPanel === 'ai' ? null : 'ai')}
            label="Transcript"
            variant="ai"
          />
        </div>
      </footer>
    </>
  );
}

export default function MeetingRoom() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(null);
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [meetingError, setMeetingError] = useState('');
  const [classEnded, setClassEnded] = useState(false);
  const classEndedByTeacherRef = useRef(false);
  const [rejoinCounter, setRejoinCounter] = useState(0);
  const [hasJoined, setHasJoined] = useState(() => {
    return sessionStorage.getItem(`joined_${id}`) === 'true';
  });
  const [meetingData, setMeetingData] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const activeMeetingId = id || searchParams.get('id');

  useEffect(() => {
    const initMeeting = async () => {
      if (!activeMeetingId) {
        setMeetingError("Invalid meeting ID");
        return;
      }

      try {
        setMeetingError('');
        console.log(`[MeetingRoom] Attempting to join meeting ID: ${activeMeetingId}`);
        const joinData = await joinVconfMeeting(activeMeetingId);
        console.log(`[MeetingRoom] Successfully joined meeting. Connection details:`, joinData);

        try {
          const mData = await getVconfMeeting(activeMeetingId);
          setMeetingData(mData);
        } catch (e) {
          console.warn("[MeetingRoom] Failed to fetch meeting details:", e);
        }

        // If teacher, formally start the meeting to trigger recording/AI workflows later
        if (user?.role === 'teacher') {
          try {
            console.log(`[MeetingRoom] Teacher automatically starting meeting ID: ${activeMeetingId}`);
            await startVconfMeeting(activeMeetingId);
          } catch (e) {
            console.warn("[MeetingRoom] Meeting already started or error starting:", e);
          }
        }

        setConnectionDetails(joinData);
      } catch (err) {
        console.error("[MeetingRoom] Failed to join:", err);
        setMeetingError("Failed to join: " + err.message);
      }
    };

    initMeeting();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMeetingId, rejoinCounter]);

  return (
    <div className="fixed inset-0 bg-slate-900 text-white overflow-hidden flex flex-col z-[9999]">
      {classEnded ? (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="bg-slate-800 p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-700">
            {classEnded === 'ended' ? (
              <>
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Class Ended</h2>
                <p className="text-slate-400 text-sm mb-8">
                  {user?.role === 'teacher'
                    ? 'The class has been ended successfully. Recording will be processed and available in Class Recordings shortly.'
                    : 'The class session has ended. Thank you for attending!'}
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <WifiOff size={40} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Connection Lost</h2>
                <p className="text-slate-400 text-sm mb-8">
                  You were disconnected from the class. This may be due to a network issue. Click below to rejoin the ongoing session.
                </p>
              </>
            )}
            <div className="space-y-3">
              <button
                onClick={() => {
                  classEndedByTeacherRef.current = false;
                  setClassEnded(false);
                  setConnectionDetails(null);
                  setHasJoined(true);
                  sessionStorage.setItem(`joined_${id}`, 'true');
                  setRejoinCounter(c => c + 1);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Rejoin Classroom
              </button>
              {classEnded === 'ended' && (
                <>
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <BarChart3 size={18} />
                    View Meeting Report
                  </button>
                  <button
                    onClick={() => {
                      // Navigate back or to dashboard — window.close() only works
                      // for JS-opened popups and logs a warning otherwise.
                      if (window.history.length > 1) {
                        window.history.back();
                      } else {
                        window.location.href = '/';
                      }
                    }}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 px-4 rounded-xl transition-colors"
                  >
                    Close Tab
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : !connectionDetails ? (
        <div className="flex flex-col items-center justify-center space-y-4 h-full">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-200 font-medium">{meetingError || "Connecting to classroom..."}</p>
        </div>
      ) : !hasJoined ? (
        <div className="flex flex-col items-center justify-center space-y-6 h-full p-8 absolute inset-0 z-50 bg-slate-900">
          <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-700">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video size={32} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Ready to join?</h2>
            <p className="text-slate-400 text-sm mb-8">Make sure you are in a quiet environment.</p>
            <button onClick={() => { setHasJoined(true); sessionStorage.setItem(`joined_${id}`, 'true'); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/30">
              Join Classroom
            </button>
          </div>
        </div>
      ) : (
        <LiveKitRoom
          video={user?.role === 'teacher'}
          audio={user?.role === 'teacher'}
          connect={true}
          token={connectionDetails.token}
          serverUrl={connectionDetails.livekit_ws_url}
          data-lk-theme="default"
          style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <MeetingContent
            activeMeetingId={activeMeetingId}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            showRightPanel={showRightPanel}
            setShowRightPanel={setShowRightPanel}
            meetingData={meetingData}
            setClassEnded={setClassEnded}
            classEndedByTeacherRef={classEndedByTeacherRef}
          />
        </LiveKitRoom>
      )}

      {/* Meeting Report Modal */}
      {showReport && (
        <MeetingReport
          meetingId={activeMeetingId}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

function ControlButton({ icon: Icon, active, onClick, label, variant = 'secondary' }) {
  let bgClass = '';
  let iconClass = '';

  if (variant === 'secondary') {
    bgClass = active ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
    if (active) iconClass = 'text-white';
  } else if (variant === 'ghost') {
    bgClass = active ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-800';
  } else if (variant === 'ai') {
    bgClass = active ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-indigo-400 hover:bg-indigo-900/30';
  }

  return (
    <button
      onClick={onClick}
      className={"flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all shrink-0 " + bgClass}
    >
      <Icon size={18} className={iconClass} />
      <span className="text-[9px] mt-0.5 font-medium">{label}</span>
    </button>
  );
}
