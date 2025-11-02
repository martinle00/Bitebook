import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface FilterState {
  search: string;
  type: "all" | "restaurant" | "bar" | "cafe";
  visitedStatus: "all" | "visited" | "toVisit";
  sortBy: "recentlyAdded" | "recentlyEdited" | "alphabetical" | "rating";
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const typeFilters: Array<{ value: FilterState["type"]; label: string }> = [
    { value: "all", label: "All" },
    { value: "restaurant", label: "Restaurants" },
    { value: "bar", label: "Bars" },
    { value: "cafe", label: "Cafes" },
  ];

  const statusFilters: Array<{ value: FilterState["visitedStatus"]; label: string }> = [
    { value: "all", label: "All" },
    { value: "visited", label: "Visited" },
    { value: "toVisit", label: "To Visit" },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Enhanced Search Bar and Sort */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by name or location..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-11 h-10"
          />
        </div>
        <Select
          value={filters.sortBy}
          onValueChange={(value: FilterState["sortBy"]) =>
            onFilterChange({ ...filters, sortBy: value })
          }
        >
          <SelectTrigger className="w-[180px] h-10">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recentlyAdded">Recently Added</SelectItem>
            <SelectItem value="recentlyEdited">Recently Edited</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grouped Filters */}
      <div className="space-y-3">
        {/* Type Filters */}
        <div>
          <span className="text-sm text-gray-600 mb-2 block">Type</span>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => (
              <Badge
                key={filter.value}
                variant={filters.type === filter.value ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 transition-all ${
                  filters.type === filter.value 
                    ? "shadow-sm" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() =>
                  onFilterChange({ ...filters, type: filter.value })
                }
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Status Filters */}
        <div>
          <span className="text-sm text-gray-600 mb-2 block">Status</span>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Badge
                key={filter.value}
                variant={filters.visitedStatus === filter.value ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 transition-all ${
                  filters.visitedStatus === filter.value 
                    ? "shadow-sm" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() =>
                  onFilterChange({ ...filters, visitedStatus: filter.value })
                }
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
