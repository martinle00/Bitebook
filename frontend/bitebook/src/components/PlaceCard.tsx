import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import type { Place } from "../types/Place";
import { MapPin, Star, Check, UtensilsCrossed, Coffee, Wine, Trash2 } from "lucide-react";

// export interface Place {
//   id: string;
//   name: string;
//   type: "Restaurant" | "Bar" | "Cafe";
//   location: string;
//   visited: boolean;
//   rating?: number;
//   notes?: string;
// }

interface PlaceCardProps {
  place: Place;
  onToggleVisited: (id: string) => void;
  onDelete: (id: string) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Restaurant":
      return <UtensilsCrossed className="w-3.5 h-3.5" />;
    case "Cafe":
      return <Coffee className="w-3.5 h-3.5" />;
    case "Bar":
      return <Wine className="w-3.5 h-3.5" />;
    default:
      return null;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "restaurant":
      return "Restaurant";
    case "cafe":
      return "Cafe";
    case "bar":
      return "Bar";
    default:
      return type;
  }
};

export function PlaceCard({ place, onToggleVisited, onDelete }: PlaceCardProps) {
  return (
    <Card 
      className={`overflow-hidden hover:shadow-xl transition-all duration-200 ${
        place.visited ? "bg-green-50/30" : "bg-white"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Title and Type Badge */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl mb-1 truncate">{place.name}</h3>
          </div>
        </div>

        {/* Type with Icon */}
        <div className="flex items-center gap-1.5 text-gray-600 mb-2">
          {getTypeIcon(place.type)}
          <span className="text-xs sm:text-sm">{getTypeLabel(place.type)}</span>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-600 mb-3">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate">{place.location}</span>
        </div>

        {/* Rating */}
        {place.rating && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
            <span className="text-sm">{place.rating}/5</span>
          </div>
        )}

        {/* Notes */}
        {place.notes && (
          <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">{place.notes}</p>
        )}

        {/* Visit and Delete Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={place.visited ? "outline" : "default"}
            className={`flex-1 h-9 transition-all ${
              place.visited 
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" 
                : ""
            }`}
            onClick={() => onToggleVisited(place.placeId)}
          >
            {place.visited ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                <span>Visited</span>
              </>
            ) : (
              <span>Mark as Visited</span>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {place.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete {place.name}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={() => onDelete(place.placeId)}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
