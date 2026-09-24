// In development (npm run dev), points to local server http://localhost:3000
// In production, points to Render backend or VITE_API_URL if set in environment variables
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "https://repolens-1.onrender.com");
