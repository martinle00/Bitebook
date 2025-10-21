import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Star, Check, X } from "lucide-react";
// Image removed per request: we keep the top area for the tag but do not render an image.

export interface Place {
  id: string;
  name: string;
  type: "restaurant" | "bar" | "cafe";
  location: string;
  visited: boolean;
  rating?: number;
  notes?: string;
  imageUrl?: string;
}

interface PlaceCardProps {
  place: Place;
  onToggleVisited: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PlaceCard({ place, onToggleVisited, onDelete }: PlaceCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow h-full">
      <div className="p-3 sm:p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base sm:text-lg font-medium">{place.name}</h3>
          <Badge
            variant={place.visited ? "default" : "secondary"}
            className="capitalize text-xs"
          >
            {place.type}
          </Badge>
        </div>

        <div>
          <div className="flex items-center gap-1 text-gray-600 mb-2 sm:mb-3">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{place.location}</span>
          </div>

          {place.rating && (
            <div className="flex items-center gap-1 mb-2 sm:mb-3">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs sm:text-sm">{place.rating}/5</span>
            </div>
          )}

          {place.notes && (
            <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{place.notes}</p>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex gap-2">
          <Button
            size="sm"
            variant={place.visited ? "outline" : "default"}
            className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
            onClick={() => onToggleVisited(place.id)}
          >
            {place.visited ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Visited</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Mark as Visited</span>
                <span className="sm:hidden">Visit</span>
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-8 sm:h-9 px-2 sm:px-3"
            onClick={() => onDelete(place.id)}
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
