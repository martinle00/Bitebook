import { useState, useEffect, useMemo } from "react";
import { PlaceCard } from "./components/PlaceCard";
import { AddPlaceDialog } from "./components/AddPlaceDialog";
import { FilterBar } from "./components/FilterBar";
import { RateAndNoteDialog } from "./components/RateAndNoteDialog";
import { useLoadGoogleMaps } from "./hooks/useLoadGoogleMaps";
import type { Place } from "./types/Place";
import type { FilterState } from "./components/FilterBar";
import { MapPin, CheckCircle2, Clock } from "lucide-react";
import { toast, Toaster } from "sonner";
import { PlaceDetailsDialog } from "./components/PlaceDetailsDialog";

// Module-level cache (persists for the session)
type CacheShape = { ts: number; data: Place[] } | null;
let placesCache: CacheShape = null;
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

// Get API base URL from environment variable
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';

export default function App() {
  // Load Google Maps API on app initialization
  useLoadGoogleMaps();
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    visitedStatus: "all",
    sortBy: "recentlyAdded"
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

      const res = await fetch(`${API_BASE_URL}/places/feed`);
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

  const handleGetPlace = async (placeId: string): Promise<Place | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/places/place/${placeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }

      const placeData: Place = await response.json();
      return placeData;
    }
    catch(error) {
      console.error('Error fetching place details:', error);
      toast.error('Failed to fetch place details.');
      return null;
    }
  }

  const handleAddPlace = async (newPlace: Omit<Place, "placeId">) => {
    try {
      // Save to backend first
      const response = await fetch(`${API_BASE_URL}/places/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPlace)
      });

      if (!response.ok) {
        throw new Error('Failed to save place');
      }

      // Reload the places from backend to get the latest data
      await fetchPlaces(true);
      
      // Show success message with different variants based on the place state
      if (newPlace.visited && newPlace.rating) {
        toast.success(`Added ${newPlace.name} with a rating of ${newPlace.rating}/5`);
      } else if (newPlace.visited) {
        toast.success(`Added ${newPlace.name} as a visited place`);
      } else {
        toast.success(`Added ${newPlace.name} to your places to visit`);
      }
    } catch (error) {
      console.error('Error adding place:', error);
      toast.error(`Failed to add ${newPlace.name}. Please try again.`);
      throw error; // Re-throw to handle in the UI
    }
  };

  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  const handleToggleVisited = async (id: string) => {
    const placeToUpdate = places.find(p => p.placeId === id);
    if (!placeToUpdate) return;

    // If marking as visited, open the rating dialog first
    if (!placeToUpdate.visited) {
      setSelectedPlace(placeToUpdate);
      setRatingDialogOpen(true);
      return;
    }

    // Otherwise proceed with marking as not visited
    await updatePlaceVisited(id, false);
  };

  const updatePlaceVisited = async (id: string, visited: boolean, rating?: number, notes?: string) => {
    const placeToUpdate = places.find(p => p.placeId === id);
    if (!placeToUpdate) {
      toast.error("Could not find place to update");
      return;
    }

    const updatedPlace = { 
      ...placeToUpdate, 
      visited,
      ...(rating !== undefined && { rating }),
      ...(notes !== undefined && { notes })
    };
    
    try {
      // Send update to backend
      const response = await fetch(`${API_BASE_URL}/places/update/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          visited,
          ...(rating !== undefined && { rating }),
          ...(notes !== undefined && { notes })
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update place');
      }

      // Only update local state if backend update was successful
      const updated = places.map(place =>
        place.placeId === id ? updatedPlace : place
      );
      setPlaces(updated);
      placesCache = { ts: Date.now(), data: updated };

      // Show success message
      if (visited && rating) {
        toast.success(`${placeToUpdate.name} marked as visited with a rating of ${rating}/5`);
      } else if (visited) {
        toast.success(`${placeToUpdate.name} marked as visited`);
      } else {
        toast.success(`${placeToUpdate.name} marked as not visited`);
      }
    } catch (error) {
      console.error('Error updating place:', error);
      toast.error(`Failed to update ${placeToUpdate.name}. Please try again.`);
    }
  };

  const handleCardClick = async (place: Place) => {
    // Fetch the latest place details from backend
    const latestPlace = await handleGetPlace(place.placeId);
    
    // Use the latest data if available, otherwise fallback to the place passed in
    setSelectedPlace(latestPlace || place);
    setDetailsDialogOpen(true);
  };

  const handleUpdatePlace = (
    id: string,
    updates: Partial<Place>,
  ) => {
    setPlaces(
      places.map((place) =>
        place.placeId === id ? { ...place, ...updates } : place,
      ),
    );
  };

  const handleRateDialogClose = () => {
    // First reset the dialog state
    setRatingDialogOpen(false);
    // Then clear the selected place
    setSelectedPlace(null);
  };

  const handleRatingSubmit = async (placeId: string, rating: number, notes: string) => {
    try {
      await updatePlaceVisited(placeId, true, rating, notes);
    } finally {
      // Always close the dialog and reset state, even if there's an error
      handleRateDialogClose();
    }
  };

  const handleDeletePlace = async (id: string) => {
    // Find the place first to get its name for the toast messages
    const placeToDelete = places.find(p => p.placeId === id);
    if (!placeToDelete) {
      toast.error("Could not find place to delete");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/places/delete/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete place');
      }

      // Only update local state if backend delete was successful
      const updated = places.filter((place) => place.placeId !== id);
      setPlaces(updated);
      placesCache = { ts: Date.now(), data: updated };

      // Show success message
      toast.success(`${placeToDelete.name} has been deleted`);
    } catch (error) {
      console.error('Error deleting place:', error);
      toast.error(`Failed to delete ${placeToDelete.name}. Please try again.`);
    }
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
    })
    .sort((a, b) => {
      // Sort based on selected sort option
      switch (filters.sortBy) {
        case "recentlyAdded":
          // Recently added first (null dates go to the end)
          if (!a.createdDateTime && !b.createdDateTime) return 0;
          if (!a.createdDateTime) return 1;
          if (!b.createdDateTime) return -1;
          return b.createdDateTime.getTime() - a.createdDateTime.getTime();
        case "recentlyEdited":
          // Recently edited first (null dates go to the end)
          if (!a.lastUpdatedDateTime && !b.lastUpdatedDateTime) return 0;
          if (!a.lastUpdatedDateTime) return 1;
          if (!b.lastUpdatedDateTime) return -1;
          return b.lastUpdatedDateTime.getTime() - a.lastUpdatedDateTime.getTime();
        case "alphabetical":
          return a.name.localeCompare(b.name);
        
        case "rating":
          // Highest rating first (null ratings go to the end)
          if (a.rating === undefined && b.rating === undefined) return 0;
          if (a.rating === undefined) return 1;
          if (b.rating === undefined) return -1;
          return b.rating - a.rating;
        
        default:
          return 0;
      }
    });
  }, [places, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-center" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-4">
            <h1>Bitebook</h1>
            <AddPlaceDialog onAddPlace={handleAddPlace} />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar filters={filters} onFilterChange={setFilters} />
        </div>
        
        {selectedPlace && (
          <RateAndNoteDialog
            place={selectedPlace}
            isOpen={ratingDialogOpen}
            onClose={handleRateDialogClose}
            onSubmit={handleRatingSubmit}
          />
        )}

        {/* Stats - Enhanced with Icons */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-500" />
              <p className="text-gray-600 text-xs sm:text-sm">Total Places</p>
            </div>
            <p className="text-xl sm:text-2xl ml-6">{places.length}</p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-gray-600 text-xs sm:text-sm">Visited</p>
            </div>
            <p className="text-xl sm:text-2xl ml-6">
              {places.filter((p) => p.visited).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-500" />
              <p className="text-gray-600 text-xs sm:text-sm">To Visit</p>
            </div>
            <p className="text-xl sm:text-2xl ml-6">
              {places.filter((p) => !p.visited).length}
            </p>
          </div>
        </div>

        {/* Places Grid - Enhanced Spacing */}
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place.placeId}
                place={place}
                onToggleVisited={handleToggleVisited}
                onDelete={handleDeletePlace}
                onCardClick={handleCardClick}
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
      <PlaceDetailsDialog
          place={selectedPlace}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onUpdatePlace={handleUpdatePlace}
      />
    </div>

  );
}
