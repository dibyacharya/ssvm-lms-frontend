import { useCallback, useEffect, useRef } from "react";
import { useRoomContext } from "@livekit/components-react";
import { useLocalParticipant } from "@livekit/components-react";

/**
 * Shared hook for LiveKit DataChannel communication.
 * Extracts sendCommand + onDataReceived from room context.
 * All panels (Chat, Polls, Q&A, Captions) use this hook.
 */
export function useDataChannel(onMessage) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  const sendCommand = useCallback(
    (cmd) => {
      if (localParticipant) {
        const encoded = new TextEncoder().encode(JSON.stringify(cmd));
        localParticipant.publishData(encoded, { reliable: true });
      }
    },
    [localParticipant]
  );

  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload) => {
      try {
        const str = new TextDecoder().decode(payload);
        const data = JSON.parse(str);
        if (callbackRef.current) {
          callbackRef.current(data);
        }
      } catch (e) {
        // Ignore malformed messages
      }
    };

    room.on("dataReceived", handleDataReceived);
    return () => {
      room.off("dataReceived", handleDataReceived);
    };
  }, [room]);

  return { sendCommand, localParticipant, room };
}

export default useDataChannel;
