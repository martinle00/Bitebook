export interface Place {
    placeId: string;
    name: string;
    type: "Restaurant" | "Bar" | "Cafe";
    location: string;
    visited: boolean;
    rating?: number;
    notes?: string;
    website?: string;
    socialMediaLinks?: { [key: string]: string };
    googlePlaceId?: string;
    lastUpdatedDateTime?: Date;
    createdDateTime?: Date;
    fullAddress?: string;
    openingHours?: { [key: string]: Array<OpeningHoursPeriod> };
    isPermanentlyClosed?: boolean;
}

interface OpeningHoursPeriod {
  openingHour: number;
  openingMinute: number;
  closingHour: number;
  closingMinute: number;
}