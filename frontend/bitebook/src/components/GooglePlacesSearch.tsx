import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { MapPin, X, Search } from "lucide-react";

// Minimal PlaceResult type returned to parent
export interface PlaceResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
}

export function GooglePlacesSearch({
  onSelectPlace,
}: {
  onSelectPlace: (place: PlaceResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const autocompleteService = useRef<any | null>(null);
  const placesService = useRef<any | null>(null);

  useEffect(() => {
    if (!(window as any).google || !(window as any).google.maps) return;
    autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();

    // Dummy map element required for PlacesService
    const mapDiv = document.createElement("div");
    placesService.current = new (window as any).google.maps.places.PlacesService(mapDiv);
  }, []);

  useEffect(() => {
    if (!autocompleteService.current || query.trim().length < 2) {
      setSuggestions([]);
      setShowResults(false);
      return;
    }

    const delay = setTimeout(() => {
      autocompleteService.current.getPlacePredictions(
        { input: query, types: ["establishment"] },
        (predictions: any) => {
          if (predictions) {
            setSuggestions(predictions);
            setShowResults(true);
          } else {
            setSuggestions([]);
            setShowResults(false);
          }
        }
      );
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (prediction: any) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      { placeId: prediction.place_id, fields: ["name", "geometry", "formatted_address", "place_id"] },
      (place: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const result: PlaceResult = {
            name: place.name || "",
            address: place.formatted_address || "",
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            place_id: place.place_id || "",
          };
          onSelectPlace(result);
          setQuery(place.name || "");
          setShowResults(false);
        }
      }
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search restaurants, bars, cafes..."
          className="pl-10 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && suggestions.length > 0 && (
        <div className="border rounded-md max-h-48 overflow-y-auto bg-white shadow-sm">
          {suggestions.map((prediction: any) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelect(prediction)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{prediction.structured_formatting.main_text}</p>
                  <p className="text-xs text-gray-500 truncate">{prediction.structured_formatting.secondary_text}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
