import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Plus, Search, MapPin, X } from "lucide-react";
import type { Place } from "./PlaceCard";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useState(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  });

  return matches;
}

interface SearchResult {
  name: string;
  type: "restaurant" | "bar" | "cafe";
  location: string;
  rating?: number;
  imageUrl?: string;
}

// Mock search function - simulates API call
const searchPlaces = (query: string): SearchResult[] => {
  const mockPlaces: SearchResult[] = [
    {
      name: "Sakura Sushi Bar",
      type: "restaurant",
      location: "123 Main St, Downtown",
      rating: 4.5,
      imageUrl: "https://images.unsplash.com/photo-1696449241254-11cf7f18ce32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzYwOTM0MDgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Mario's Pizza Place",
      type: "restaurant",
      location: "456 Oak Ave, Little Italy",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzYwOTI4MDAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "The Daily Grind Cafe",
      type: "cafe",
      location: "789 Elm St, Arts District",
      rating: 4.2,
      imageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYwODM0MjU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "The Prime Cut Steakhouse",
      type: "restaurant",
      location: "321 Pine Rd, Uptown",
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1600251284086-6417eff9f5fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVha2hvdXNlJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NjA4Nzg4ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "The Tipsy Tavern",
      type: "bar",
      location: "654 Market St, Downtown",
      rating: 4.3,
    },
    {
      name: "Blue Moon Cocktail Lounge",
      type: "bar",
      location: "987 Beach Blvd, Waterfront",
      rating: 4.6,
    },
    {
      name: "Espresso Express",
      type: "cafe",
      location: "246 College Ave, University District",
      rating: 4.4,
    },
    {
      name: "Thai Spice Kitchen",
      type: "restaurant",
      location: "135 Chinatown St, Chinatown",
      rating: 4.5,
    },
  ];

  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  return mockPlaces.filter(
    place =>
      place.name.toLowerCase().includes(lowerQuery) ||
      place.location.toLowerCase().includes(lowerQuery) ||
      place.type.toLowerCase().includes(lowerQuery)
  );
};

interface AddPlaceDialogProps {
  onAddPlace: (place: Omit<Place, "id">) => void;
}

export function AddPlaceDialog({ onAddPlace }: AddPlaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "restaurant" as "restaurant" | "bar" | "cafe",
    location: "",
    visited: false,
    rating: "",
    notes: "",
    imageUrl: "",
  });
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timeoutId = setTimeout(() => {
        const results = searchPlaces(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSelectPlace = (place: SearchResult) => {
    setFormData({
      name: place.name,
      type: place.type,
      location: place.location,
      visited: false,
      rating: place.rating ? place.rating.toString() : "",
      notes: "",
      imageUrl: place.imageUrl || "",
    });
    setSearchQuery("");
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      return;
    }

    onAddPlace({
      name: formData.name,
      type: formData.type,
      location: formData.location,
      visited: formData.visited,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      notes: formData.notes || undefined,
      imageUrl: formData.imageUrl || undefined,
    });

    // Reset form
    setFormData({
      name: "",
      type: "restaurant",
      location: "",
      visited: false,
      rating: "",
      notes: "",
      imageUrl: "",
    });
    setSearchQuery("");
    
    setOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Search Section */}
      <div className="space-y-2">
        <Label htmlFor="search">Search for a place</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants, bars, cafes..."
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="border rounded-md max-h-48 overflow-y-auto bg-white">
            {searchResults.map((place, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectPlace(place)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{place.name}</p>
                    <p className="text-xs text-gray-500 truncate">{place.location}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && (
          <div className="text-sm text-gray-500 py-2">
            No results found. Fill in the details manually below.
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-gray-500">OR ENTER MANUALLY</span>
        <Separator className="flex-1" />
      </div>

      {/* Manual Entry Form */}
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter place name"
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value: "restaurant" | "bar" | "cafe") =>
            setFormData({ ...formData, type: value })
          }
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="restaurant">Restaurant</SelectItem>
            <SelectItem value="bar">Bar</SelectItem>
            <SelectItem value="cafe">Cafe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Enter location"
          required
        />
      </div>

      <div>
        <Label htmlFor="rating">Rating (optional)</Label>
        <Input
          id="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          placeholder="0-5"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add notes about this place"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="visited"
          checked={formData.visited}
          onChange={(e) => setFormData({ ...formData, visited: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="visited" className="cursor-pointer">
          I've already visited this place
        </Label>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit">Add Place</Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Place</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Place</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Place</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Add New Place</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">
          {formContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
