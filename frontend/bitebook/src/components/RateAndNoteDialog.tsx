import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import type { Place } from "../types/Place";

interface RateAndNoteDialogProps {
  place: Place;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (placeId: string, rating: number, notes: string) => Promise<void>;
}

export function RateAndNoteDialog({ place, isOpen, onClose, onSubmit }: RateAndNoteDialogProps) {
  const [rating, setRating] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !place.placeId) return;

    setIsSubmitting(true);
    try {
      await onSubmit(place.placeId, parseFloat(rating), notes);
      setRating("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          setRating("");
          setNotes("");
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Visit to {place?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="rating">Rating *</Label>
            <Input 
              id="rating" 
              type="number" 
              min="0" 
              max="5" 
              step="0.1" 
              value={rating} 
              onChange={(e) => setRating(e.target.value)}
              placeholder="0-5" 
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your visit" 
              rows={3} 
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !rating}
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}