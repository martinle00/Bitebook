import { useEffect, useState } from "react";

export function useLoadGoogleMaps() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    // If already available, we're done
    if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
      setLoaded(true);
      return;
    }

    const existing = document.getElementById("google-maps-sdk");
    if (existing) {
      // If another caller already injected the script, attach to its load/error events
      const onLoad = () => setLoaded(true);
      const onError = () => setError("Failed to load Google Maps script");
      existing.addEventListener("load", onLoad as any);
      existing.addEventListener("error", onError as any);
      return () => {
        existing.removeEventListener("load", onLoad as any);
        existing.removeEventListener("error", onError as any);
      };
    }

    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Missing VITE_GOOGLE_MAPS_API_KEY env variable");
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-sdk";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;

    script.onload = () => setLoaded(true);
    script.onerror = () => setError("Failed to load Google Maps script");

    document.head.appendChild(script);

    return () => {
      // don't remove the script on unmount; leave it for other components
    };
  }, []);

  return { loaded, error } as const;
}
