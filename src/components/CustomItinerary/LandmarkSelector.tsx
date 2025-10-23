import { Landmark, TourType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandmarkSelectorProps {
  landmarks: Landmark[];
  selectedLandmarks: Landmark[];
  onToggleLandmark: (landmark: Landmark) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  tourType?: TourType; // Optional filter by tour type
}

export function LandmarkSelector({
  landmarks,
  selectedLandmarks,
  onToggleLandmark,
  onSelectAll,
  isAllSelected,
  tourType
}: LandmarkSelectorProps) {
  const isSelected = (landmarkId: string) => {
    return selectedLandmarks.some((l) => l.id === landmarkId);
  };

  // Filter landmarks by tour type if specified
  const filteredLandmarks = tourType 
    ? landmarks.filter(l => l.tourType === tourType)
    : landmarks;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Select Your Landmarks</h2>
          <p className="text-gray-600">
            Choose from {filteredLandmarks.length} {tourType === "cebu-city" ? "city" : tourType === "mountain" ? "mountain" : ""} landmarks • {selectedLandmarks.length} selected
          </p>
        </div>
        <Button
          onClick={onSelectAll}
          variant={isAllSelected ? "default" : "outline"}
          className={isAllSelected ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isAllSelected ? "Deselect All" : "Select All (Full Package)"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLandmarks.map((landmark) => {
          const selected = isSelected(landmark.id);
          
          return (
            <Card
              key={landmark.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selected ? "ring-2 ring-blue-600 bg-blue-50" : ""
              }`}
              onClick={() => onToggleLandmark(landmark)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={landmark.image}
                  alt={landmark.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-white text-gray-900">{landmark.category}</Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      selected ? "bg-blue-600" : "bg-white"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLandmark(landmark);
                    }}
                  >
                    <Checkbox
                      checked={selected}
                      className="pointer-events-none"
                    />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[56px]">
                  {landmark.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                  {landmark.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>~{landmark.estimatedDuration}min</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      {landmark.location.lat.toFixed(4)}, {landmark.location.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

