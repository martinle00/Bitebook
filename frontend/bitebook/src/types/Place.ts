export interface Place {
    placeId: string;
    name: string;
    type: "Restaurant" | "Bar" | "Cafe";
    location: string;
    visited: boolean;
    rating?: number;
    notes?: string;
    googlePlaceId?: string;
    LastUpdatedDateTime?: Date;
    CreatedDateTime?: Date;
}