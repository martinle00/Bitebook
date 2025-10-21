export interface Place {
    placeId: string;
    name: string;
    cuisine?: string;
    type: string;
    location: string;
    visited: boolean;
    rating?: number;
}