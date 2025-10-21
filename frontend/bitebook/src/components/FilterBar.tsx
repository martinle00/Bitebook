import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search } from "lucide-react";

export interface FilterState {
  search: string;
  type: "all" | "restaurant" | "bar" | "cafe";
  visitedStatus: "all" | "visited" | "toVisit";
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
    <div className="space-y-3 sm:space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search places..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 shrink-0">Type:</span>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => (
              <Badge
                key={filter.value}
                variant={filters.type === filter.value ? "default" : "outline"}
                className="cursor-pointer text-xs sm:text-sm"
                onClick={() =>
                  onFilterChange({ ...filters, type: filter.value })
                }
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 shrink-0">Status:</span>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Badge
                key={filter.value}
                variant={filters.visitedStatus === filter.value ? "default" : "outline"}
                className="cursor-pointer text-xs sm:text-sm"
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
