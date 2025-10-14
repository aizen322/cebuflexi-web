
import { useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface TourFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function TourFilters({ onFilterChange }: TourFiltersProps) {
  const router = useRouter();
  const [category, setCategory] = useState<string>("all");
  const [duration, setDuration] = useState<string>("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 15000]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Initialize search query from URL
  useState(() => {
    const { search } = router.query;
    if (search && typeof search === "string") {
      setSearchQuery(search);
    }
  });

  const applyFilters = () => {
    onFilterChange({
      category,
      duration,
      priceRange,
      search: searchQuery
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Update URL with search query
    const params = new URLSearchParams(router.query as Record<string, string>);
    if (value.trim()) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`/tours?${params.toString()}`, undefined, { shallow: true });
    
    // Apply filters immediately when search changes
    onFilterChange({
      category,
      duration,
      priceRange,
      search: value.trim() ? value : ""
    });
  };

  const resetFilters = () => {
    setCategory("all");
    setDuration("");
    setPriceRange([0, 15000]);
    setSearchQuery("");
    onFilterChange({
      category: "all",
      duration: "",
      priceRange: [0, 15000],
      search: ""
    });
    // Clear search from URL
    const params = new URLSearchParams(router.query as Record<string, string>);
    params.delete('search');
    router.push(`/tours?${params.toString()}`, undefined, { shallow: true });
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Filter Tours</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-3 block">Search Tours</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">Tour Category</Label>
          <RadioGroup value={category} onValueChange={setCategory}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer">All Tours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Beach" id="beach" />
              <Label htmlFor="beach" className="cursor-pointer">Beach</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Adventure" id="adventure" />
              <Label htmlFor="adventure" className="cursor-pointer">Adventure</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Cultural" id="cultural" />
              <Label htmlFor="cultural" className="cursor-pointer">Cultural</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Food" id="food" />
              <Label htmlFor="food" className="cursor-pointer">Food</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="duration" className="text-base font-semibold mb-3 block">Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger id="duration">
              <SelectValue placeholder="Any duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any duration</SelectItem>
              <SelectItem value="1-1">1 Day</SelectItem>
              <SelectItem value="2-2">2 Days</SelectItem>
              <SelectItem value="3-3">3 Days</SelectItem>
              <SelectItem value="4-7">4-7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">
            Price Range: ₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()}
          </Label>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={15000}
            step={500}
            className="mt-2"
          />
        </div>

        <div className="space-y-2 pt-4">
          <Button onClick={applyFilters} className="w-full bg-blue-600 hover:bg-blue-700">
            Apply Filters
          </Button>
          <Button onClick={resetFilters} variant="outline" className="w-full">
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
