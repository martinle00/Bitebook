import { useState, useEffect, useMemo } from "react";
import { PlaceCard } from "./components/PlaceCard";
import type { Place } from "./components/PlaceCard";
import { AddPlaceDialog } from "./components/AddPlaceDialog";
import { FilterBar } from "./components/FilterBar";
import type { FilterState } from "./components/FilterBar";

// Module-level cache (persists for the session)
type CacheShape = { ts: number; data: Place[] } | null;
let placesCache: CacheShape = null;
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    visitedStatus: "all",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const now = Date.now();
      if (!forceRefresh && placesCache && now - placesCache.ts < CACHE_TTL_MS) {
        setPlaces(placesCache.data);
        return;
      }

      const res = await fetch("http://localhost:8080/places/feed");
      if (!res.ok) {
        throw new Error("Failed to fetch places");
      }
      const data: Place[] = await res.json();
      placesCache = { ts: now, data };
      setPlaces(data);
    } catch (err: any) {
      console.error("Error fetching places:", err);
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleRefresh = () => fetchPlaces(true);

  const handleAddPlace = (newPlace: Omit<Place, "id">) => {
    const place: Place = {
      ...newPlace,
      id: Date.now().toString(),
    };
    const updated = [place, ...places];
    setPlaces(updated);
    placesCache = { ts: Date.now(), data: updated };
  };

  const handleToggleVisited = (id: string) => {
    const updated = places.map((place) =>
      place.id === id ? { ...place, visited: !place.visited } : place
    );
    setPlaces(updated);
    placesCache = { ts: Date.now(), data: updated };
  };

  const handleDeletePlace = (id: string) => {
    const updated = places.filter((place) => place.id !== id);
    setPlaces(updated);
    placesCache = { ts: Date.now(), data: updated };
  };

  const filteredPlaces = useMemo(() => {
    // normalize filter values
    const search = (filters.search || "").trim().toLowerCase();
    const typeFilter = (filters.type || "all").trim().toLowerCase();
    const visitedFilter = (filters.visitedStatus || "all").trim().toLowerCase();

    return places.filter((place) => {
      // safe access and normalize place fields
      const name = (place.name || "").toString().toLowerCase();
      const location = (place.location || "").toString().toLowerCase();
      const placeType = (place.type || "").toString().toLowerCase().trim();

      // Search filter (name or location)
      if (search) {
        if (!name.includes(search) && !location.includes(search)) return false;
      }

      // Type filter: allow case-insensitive match and simple plural forms
      if (typeFilter !== "all") {
        // e.g. filters.type = "restaurant" should match "restaurant", "restaurants", "Restaurant" etc.
        if (
          placeType !== typeFilter &&
          placeType !== `${typeFilter}s` &&
          !placeType.includes(typeFilter)
        ) {
          return false;
        }
      }

      // Visited status filter: handle boolean, string or numeric representations from backend
      if (visitedFilter !== "all") {
        const visitedRaw = (place as any).visited;
        let isVisited = false;
        if (typeof visitedRaw === "boolean") isVisited = visitedRaw;
        else if (typeof visitedRaw === "string") {
          const v = visitedRaw.toLowerCase().trim();
          isVisited = v === "true" || v === "1" || v === "visited" || v === "yes";
        } else if (typeof visitedRaw === "number") {
          isVisited = visitedRaw !== 0;
        }

        if (visitedFilter === "visited" && !isVisited) return false;
        if (visitedFilter === "tovisit" || visitedFilter === "toVisit" || visitedFilter === "to-visit") {
          if (isVisited) return false;
        }
        if (visitedFilter === "tovisit" && !visitedFilter) return false; // noop guard
      }

      return true;
    });
  }, [places, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-4">
            <h1>Bitebook</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="px-3 py-1 rounded bg-green-500 text-white"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <AddPlaceDialog onAddPlace={handleAddPlace} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-red-600">Error: {error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <p className="text-gray-600 text-xs sm:text-sm">Total Places</p>
            <p className="text-xl sm:text-2xl">{places.length}</p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <p className="text-gray-600 text-xs sm:text-sm">Visited</p>
            <p className="text-xl sm:text-2xl">
              {places.filter((p) => p.visited).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <p className="text-gray-600 text-xs sm:text-sm">To Visit</p>
            <p className="text-xl sm:text-2xl">
              {places.filter((p) => !p.visited).length}
            </p>
          </div>
        </div>

        {/* Places Grid */}
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onToggleVisited={handleToggleVisited}
                onDelete={handleDeletePlace}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm sm:text-base px-4">
              No places found. Try adjusting your filters or add a new place!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
