import { io } from 'socket.io-client';

// Resolve server URL in this order:
// 1) Vite env var (set in .env as VITE_CHATCHOQ_SERVER_URL)
// 2) Current host on port 3000 (useful when accessing from another device on LAN)
// 3) Fallback to localhost:3000
const serverUrl = (
	typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CHATCHOQ_SERVER_URL
) || (
	typeof window !== 'undefined' && window.location && window.location.hostname
		? `http://${window.location.hostname}:3000`
		: undefined
) || 'http://localhost:3000';

export const socket = io(serverUrl);
