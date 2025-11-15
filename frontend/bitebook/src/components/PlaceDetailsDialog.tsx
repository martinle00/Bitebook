import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Star, 
  Calendar, // TODO: Uncomment when implementing visitedDate field
  UtensilsCrossed, 
  Coffee, 
  Wine,
  // Plus, // TODO: Uncomment when implementing photos section
  // X, // TODO: Uncomment when implementing photos section
  Edit2,
  Save,
  Clock, // TODO: Uncomment when implementing opening hours
  Home, // TODO: Uncomment when implementing address field
  XCircle,
  ChefHat
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
// import { ImageWithFallback } from "./ImageWithFallback"; // TODO: Uncomment when implementing photos section
import type { Place } from "../types/Place";

interface PlaceDetailsDialogProps {
  place: Place | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdatePlace: (id: string, updates: Partial<Place>) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Restaurant":
      return <UtensilsCrossed className="w-4 h-4" />;
    case "Cafe":
      return <Coffee className="w-4 h-4" />;
    case "Bar":
      return <Wine className="w-4 h-4" />;
    default:
      return null;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "Restaurant":
      return "Restaurant";
    case "Cafe":
      return "Cafe";
    case "Bar":
      return "Bar";
    default:
      return type;
  }
};

export function PlaceDetailsDialog({ 
  place, 
  open, 
  onOpenChange,
  onUpdatePlace 
}: PlaceDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [editedRating, setEditedRating] = useState<number | undefined>(undefined);
  const [editedName, setEditedName] = useState("");
  const [editedType, setEditedType] = useState<"Restaurant" | "Bar" | "Cafe">("Restaurant");
  const [editedCuisine, setEditedCuisine] = useState("");
  const [editedFullAddress, setEditedFullAddress] = useState("");
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  // TODO: Uncomment when implementing photos section
  // const [newPhotoUrl, setNewPhotoUrl] = useState("");
  // const [showAddPhoto, setShowAddPhoto] = useState(false);

  // Reset editing state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setShowUnsavedChangesDialog(false);
    }
  }, [open]);

  // Update displayed values when place changes (after save)
  useEffect(() => {
    if (place && !isEditing) {
      setEditedNotes(place.notes || "");
      setEditedRating(place.rating);
      setEditedName(place.name);
      setEditedType(place.type);
      setEditedCuisine(place.cuisine || "");
      setEditedFullAddress(place.fullAddress || "");
    }
  }, [place, isEditing]);

  if (!place) return null;

  const handleStartEdit = () => {
    setEditedNotes(place.notes || "");
    setEditedRating(place.rating);
    setEditedName(place.name);
    setEditedType(place.type);
    setEditedCuisine(place.cuisine || "");
    setEditedFullAddress(place.fullAddress || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdatePlace(place.placeId, {
      name: editedName,
      type: editedType,
      notes: editedNotes,
      rating: editedRating,
      cuisine: editedCuisine,
      fullAddress: editedFullAddress,
    });
    setIsEditing(false);
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    // If trying to close while editing, show confirmation dialog
    if (!newOpen && isEditing) {
      setShowUnsavedChangesDialog(true);
    } else {
      onOpenChange(newOpen);
    }
  };

  const handleDiscardChanges = () => {
    setIsEditing(false);
    setShowUnsavedChangesDialog(false);
    onOpenChange(false);
  };

  const handleSaveAndClose = () => {
    handleSaveEdit();
    setShowUnsavedChangesDialog(false);
    onOpenChange(false);
  };

  const handleCancelClose = () => {
    setShowUnsavedChangesDialog(false);
  };

  // TODO: Uncomment when implementing visitedDate field
  // const formatDate = (date?: Date) => {
  //   if (!date) return null;
  //   return new Date(date).toLocaleDateString('en-US', { 
  //     month: 'short', 
  //     day: 'numeric', 
  //     year: 'numeric' 
  //   });
  // };

  const getCurrentDayName = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    return dayName;
  };

  const isCurrentlyOpen = () => {
    const openingHours = place.openingHours;

    if (!openingHours) {
      return false;
    }

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!(dayName in openingHours)) {
      return false;
    }

    const currentOpeningHours = openingHours[dayName];
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const resultList = [];
    for (const period of currentOpeningHours) {
      const openingMinutes = period.openingHour * 60 + period.openingMinute;
      const closingMinutes = period.closingHour * 60 + period.closingMinute;

      if (currentMinutes >= openingMinutes && currentMinutes <= closingMinutes) {
        resultList.push(true);
      }
    }
    if (resultList.includes(true)) {
      return true;
    }
    return false;
  };

  const openStatus = isCurrentlyOpen();

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{isEditing ? "Edit Place" : place.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            {/* Place Info */}
            {isEditing ? (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter place name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-type">Type *</Label>
                  <Select
                    value={editedType}
                    onValueChange={(value: "Restaurant" | "Bar" | "Cafe") => setEditedType(value)}
                  >
                    <SelectTrigger id="edit-type">
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
                  <Label htmlFor="edit-cuisine">Cuisine</Label>
                  <Input
                    id="edit-cuisine"
                    value={editedCuisine}
                    onChange={(e) => setEditedCuisine(e.target.value)}
                    placeholder="Enter cuisine"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-address">Full Address</Label>
                  <Input
                    id="edit-address"
                    value={editedFullAddress}
                    onChange={(e) => setEditedFullAddress(e.target.value)}
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  {getTypeIcon(place.type)}
                  <span className="text-sm">{getTypeLabel(place.type)}</span>
                </div>

                {place.cuisine && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <ChefHat className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{place.cuisine}</span>
                  </div>
                )}

                {place.fullAddress && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Home className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{place.fullAddress}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 flex-wrap pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    {place.visited && (
                      <Badge variant="outline" className="border-transparent bg-green-100 text-green-700">
                        Visited
                      </Badge>
                    )}
                    {!place.visited && (
                      <Badge variant="outline" className="border-transparent bg-orange-100 text-orange-700">
                        Want to Visit
                      </Badge>
                    )}
                    {place.isPermanentlyClosed ? (
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Permanently Closed
                      </Badge>
                    ) : (
                      openStatus !== null && (
                        <Badge 
                          variant="outline" 
                          className={openStatus ? "border-transparent bg-green-100 text-green-700" : "border-transparent bg-red-100 text-red-700"}
                        >
                          {openStatus ? "Open Now" : "Closed Now"}
                        </Badge>
                      )
                    )}
                  </div>

                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStartEdit}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Place Details
                    </Button>
                  )}
                </div>
              </div>
              )}

                        

            {/* Opening Hours Section */}
            {!isEditing && place.openingHours && !place.isPermanentlyClosed && (
              <div className="pt-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <label className="text-sm font-semibold text-gray-700">Opening Hours</label>
                </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const).map((day) => {
                      const hoursPeriods = place.openingHours?.[day];
                      const isToday = getCurrentDayName() === day;
                      
                      const formatHours = (hoursPeriods: any) => {
                        if (!hoursPeriods || !Array.isArray(hoursPeriods) || hoursPeriods.length === 0) {
                          return 'Closed';
                        }
                        
                        const formatTime = (hour: number, minute: number) => {
                          const period = hour >= 12 ? 'PM' : 'AM';
                          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                          const displayMinute = minute.toString().padStart(2, '0');
                          return `${displayHour}:${displayMinute} ${period}`;
                        };
                        
                        return hoursPeriods.map((period: any) => {
                          if (period.openingHour === undefined || 
                              period.openingMinute === undefined || 
                              period.closingHour === undefined || 
                              period.closingMinute === undefined) {
                            return null;
                          }
                          const openTime = formatTime(period.openingHour, period.openingMinute);
                          const closeTime = formatTime(period.closingHour, period.closingMinute);
                          return `${openTime} - ${closeTime}`;
                        }).filter(Boolean).join(', ');
                      };
                      
                      return (
                        <div 
                          key={day} 
                          className={`flex justify-between text-sm ${
                            isToday ? 'font-semibold text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          <span className="capitalize">{day}</span>
                          <span>{formatHours(hoursPeriods)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Rating Section */}
            {place.visited && (
              <div className="pt-6 pb-6 border-b border-gray-200">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Rating</label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={editedRating || ""}
                      onChange={(e) => setEditedRating(parseFloat(e.target.value) || undefined)}
                      placeholder="Rate out of 5"
                      className="w-32"
                    />
                    <span className="text-sm text-gray-500">/ 5</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {place.rating ? (
                      <>
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span>{place.rating}/5</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">No rating yet</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notes Section */}
            {place.visited && (
              <div className="pt-6 pb-6 border-b border-gray-200">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Notes</label>
                {isEditing ? (
                  <Textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add your notes about this place..."
                    rows={4}
                    className="w-full"
                  />
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {place.notes || <span className="text-gray-400">No notes yet</span>}
                  </p>
                )}
              </div>
            )}

            {/* Save/Cancel Buttons for Editing */}
            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  onClick={() => setIsEditing(false)} 
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            )}

         

            {/* TODO: Photos Section - Uncomment when Place type includes photos array */}
            {/* 
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-gray-600">Photos</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddPhoto(!showAddPhoto)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
              </div>

              {showAddPhoto && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <Input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Enter photo URL (e.g., from Unsplash)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPhoto();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddPhoto} size="sm">
                      Add Photo
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowAddPhoto(false);
                        setNewPhotoUrl("");
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photoUrl: string, index: number) => (
                    <div key={index} className="relative group aspect-square">
                      <ImageWithFallback
                        src={photoUrl}
                        alt={`${place.name} photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-400">No photos yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add photos to remember this place</p>
                </div>
              )}
            </div>
            */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save them before closing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardChanges}>
              Discard Changes
            </AlertDialogCancel>
            <AlertDialogCancel onClick={handleCancelClose}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndClose}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}