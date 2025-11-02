import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Plus } from "lucide-react";
import { GooglePlacesSearch } from "./GooglePlacesSearch";
import type { PlaceResult } from "./GooglePlacesSearch";
import { useLoadGoogleMaps } from "../hooks/useLoadGoogleMaps";
import type { Place } from "../types/Place";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

interface AddPlaceDialogProps {
  onAddPlace: (place: Omit<Place, "placeId">) => Promise<void>;
}

export function AddPlaceDialog({ onAddPlace }: AddPlaceDialogProps) {
  const [open, setOpen] = useState(false);
  // Create a type that matches our form fields
  type PlaceFormData = {
    name: string;
    type: "Restaurant" | "Bar" | "Cafe";
    location: string;
    visited: boolean;
    rating: string; // Keep as string for input handling
    notes?: string;
    googlePlaceId?: string;
  };

  const [formData, setFormData] = useState<PlaceFormData>({
    name: "",
    type: "Restaurant",
    location: "",
    visited: false,
    rating: "",
    notes: "",
    googlePlaceId: "",
  });
  const [cleanedAddress, setCleanedAddress] = useState("");

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      // Reset form when dialog is closed
      setFormData({
        name: "",
        type: "Restaurant",
        location: "",
        visited: false,
        rating: "",
        notes: "",
        googlePlaceId: "",
      });
    }
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { loaded: mapsLoaded, error: mapsError } = useLoadGoogleMaps();

  const handleSelectGooglePlace = (place: PlaceResult) => {
    const addressArray = place.address.split(',');
    const cleanedUpCity = addressArray[addressArray.length - 2].replace(/[^a-zA-Z\u00C0-\u024F\u1EA0-\u1EF9\s]/g, '').trim();
    const cleanedUpAddress = cleanedUpCity + ', ' + addressArray[addressArray.length - 1].trim();
    
    setCleanedAddress(cleanedUpAddress);
    setFormData((prev) => ({ 
      ...prev, 
      name: place.name, 
      location: cleanedUpAddress, 
      googlePlaceId: place.place_id 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) return;

    const placeData: Omit<Place, "placeId"> = {
      name: formData.name,
      type: formData.type,
      location: cleanedAddress || formData.location,
      visited: formData.visited,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      notes: formData.notes,
      googlePlaceId: formData.googlePlaceId
    };

    try {
      await onAddPlace(placeData);
      setFormData({ 
        name: "", 
        type: "Restaurant", 
        location: "", 
        visited: false, 
        rating: "", 
        notes: "",
        googlePlaceId: ""
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding place:', error);
      // Optionally show an error message to the user
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search for a place</Label>
        {mapsError && <div className="text-sm text-red-500">{mapsError}. Falling back to manual entry.</div>}
        {mapsLoaded ? <GooglePlacesSearch onSelectPlace={handleSelectGooglePlace} /> : <div className="text-sm text-gray-500">Loading Google Places…</div>}
      </div>

      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-gray-500">OR ENTER MANUALLY</span>
        <Separator className="flex-1" />
      </div>

      <div>
        <Label htmlFor="name">Name *</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter place name" required />
      </div>

      <div>
        <Label htmlFor="type">Type *</Label>
        <Select value={formData.type} onValueChange={(value: "Restaurant" | "Bar" | "Cafe") => setFormData({ ...formData, type: value })}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Restaurant">Restaurant</SelectItem>
            <SelectItem value="Bar">Bar</SelectItem>
            <SelectItem value="Cafe">Cafe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location">Location *</Label>
        <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Enter location" required />
      </div>

      {formData.visited && (
        <>
          <div>
            <Label htmlFor="rating">Rating</Label>
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              placeholder="Add notes about this place" 
              rows={3} 
            />
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <input type="checkbox" id="visited" checked={formData.visited} onChange={(e) => setFormData({ ...formData, visited: e.target.checked })} className="w-4 h-4" />
        <Label htmlFor="visited" className="cursor-pointer">I've already visited this place</Label>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
        <Button type="submit">Add Place</Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
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
    <Drawer open={open} onOpenChange={handleOpenChange}>
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
        <div className="px-4 pb-4 overflow-y-auto">{formContent}</div>
      </DrawerContent>
    </Drawer>
  );
}