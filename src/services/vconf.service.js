import api from "./api";

/**
 * Video Conferencing Service
 *
 * Frontend service layer for interacting with the VConf integration
 * endpoints on the LMS backend (proxied to the Rust microservice).
 */

/**
 * Get recording + transcript info for a VConf room.
 * Calls LMS backend which proxies to VConf microservice.
 *
 * @param {string} roomId - The VConf room ID (e.g., "vconf_room_xxx")
 * @returns {Promise<{
 *   roomId: string,
 *   courseId: string,
 *   status: string,
 *   recording: { videoUrl, videoKey, duration, fileSize, format, resolution, createdAt } | null,
 *   transcript: { status, text, segments: Array<{ start, end, speaker, text }>, language, generatedAt }
 * }>}
 */
export const getVconfRecording = async (roomId) => {
  const response = await api.get(`/vconf/recording/${roomId}`);
  return response.data;
};

/**
 * Get live room status.
 *
 * @param {string} roomId
 * @returns {Promise<{
 *   roomId: string,
 *   status: string,
 *   participantCount: number,
 *   startedAt: string | null,
 *   isRecording: boolean,
 *   hostJoined: boolean
 * }>}
 */
export const getVconfRoomStatus = async (roomId) => {
  const response = await api.get(`/vconf/status/${roomId}`);
  return response.data;
};
