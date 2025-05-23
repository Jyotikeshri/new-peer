// src/services/friendService.js

import { fetchWithAuth } from "../utils/apiClient";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://new-peer-1.onrender.com/api';

export async function acceptFriendRequest(requesterId) {
  const res = await fetch(
    `${API_BASE}/users/friend-requests/${requesterId}/accept`,
    { method: 'POST', credentials: 'include' }
  );
  if (!res.ok) {
    throw new Error(`Failed to accept friend request (${res.status})`);
  }
  return true;
}

export async function rejectFriendRequest(requesterId) {
  const res = await fetchWithAuth(
    `${API_BASE}/users/friend-requests/${requesterId}/reject`,
    { method: 'POST', credentials: 'include' }
  );
  if (!res.ok) {
    throw new Error(`Failed to reject friend request (${res.status})`);
  }
  return true;
}
