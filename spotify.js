const CLIENT_ID = "d3fe19c736f547a993f49f4ea28f8";
const REDIRECT_URI = "http://127.0.0.1:5500/src/spotify-callback.html";

const SCOPES = [
  "user-read-recently-played",
  "user-top-read",
  "user-read-currently-playing"
];

function generateRandomString(length) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}

function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function redirectToSpotifyLogin() {
  const verifier = generateRandomString(64);
  const challenge = base64encode(await sha256(verifier));

  localStorage.setItem("spotify_code_verifier", verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
    code_challenge_method: "S256",
    code_challenge: challenge
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem("spotify_code_verifier");

  if (!verifier) {
    throw new Error("Fant ikke PKCE code verifier i localStorage.");
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || "Kunne ikke hente Spotify-token.");
  }

  const expiresAt = Date.now() + (data.expires_in * 1000);

  localStorage.setItem("spotify_access_token", data.access_token);
  if (data.refresh_token) {
    localStorage.setItem("spotify_refresh_token", data.refresh_token);
  }
  localStorage.setItem("spotify_token_expires_at", String(expiresAt));
}

export async function refreshSpotifyTokenIfNeeded() {
  const accessToken = localStorage.getItem("spotify_access_token");
  const refreshToken = localStorage.getItem("spotify_refresh_token");
  const expiresAt = Number(localStorage.getItem("spotify_token_expires_at") || "0");

  if (!accessToken || !refreshToken || !expiresAt) {
    return accessToken;
  }

  const shouldRefresh = Date.now() > (expiresAt - 60000);

  if (!shouldRefresh) {
    return accessToken;
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || "Kunne ikke fornye Spotify-token.");
  }

  const newExpiresAt = Date.now() + (data.expires_in * 1000);

  localStorage.setItem("spotify_access_token", data.access_token);
  localStorage.setItem("spotify_token_expires_at", String(newExpiresAt));

  if (data.refresh_token) {
    localStorage.setItem("spotify_refresh_token", data.refresh_token);
  }

  return data.access_token;
}

export function getSpotifyAccessToken() {
  return localStorage.getItem("spotify_access_token");
}

export function clearSpotifyTokens() {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_refresh_token");
  localStorage.removeItem("spotify_token_expires_at");
  localStorage.removeItem("spotify_code_verifier");
  localStorage.removeItem("spotify_recent");
}

export async function spotifyFetch(endpoint) {
  const token = await refreshSpotifyTokenIfNeeded();

  if (!token) {
    throw new Error("Ikke logget inn med Spotify.");
  }

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Spotify-forespørselen feilet.");
  }

  return data;
}

export async function fetchRecentlyPlayed() {
  const data = await spotifyFetch("/me/player/recently-played?limit=10");
  console.log("Spotify API recently played response:", data);
  return data?.items || [];
}