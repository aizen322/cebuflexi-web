import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, Mountain } from "lucide-react";
import { TourType } from "@/types";

interface DayTabsProps {
  currentDay: 1 | 2;
  day1TourType: TourType;
  day2TourType: TourType;
  day1LandmarkCount: number;
  day2LandmarkCount: number;
  onDayChange: (day: 1 | 2) => void;
}

export function DayTabs({
  currentDay,
  day1TourType,
  day2TourType,
  day1LandmarkCount,
  day2LandmarkCount,
  onDayChange
}: DayTabsProps) {
  
  const getTourTypeInfo = (type: TourType) => ({
    name: type === "cebu-city" ? "Cebu City" : "Mountain",
    icon: type === "cebu-city" ? Building2 : Mountain,
    color: type === "cebu-city" ? "blue" : "green"
  });

  const day1Info = getTourTypeInfo(day1TourType);
  const day2Info = getTourTypeInfo(day2TourType);

  return (
    <Tabs value={`day${currentDay}`} onValueChange={(value) => onDayChange(value === "day1" ? 1 : 2)}>
      <TabsList className="grid w-full grid-cols-2 h-auto p-1">
        <TabsTrigger value="day1" className="h-auto py-3">
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">Day 1</Badge>
              <day1Info.icon className={`h-4 w-4 text-${day1Info.color}-600`} />
            </div>
            <div className="text-sm font-semibold">{day1Info.name} Tour</div>
            <div className="text-xs text-gray-600">
              {day1LandmarkCount} landmark{day1LandmarkCount !== 1 ? 's' : ''} selected
            </div>
          </div>
        </TabsTrigger>
        
        <TabsTrigger value="day2" className="h-auto py-3">
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600">Day 2</Badge>
              <day2Info.icon className={`h-4 w-4 text-${day2Info.color}-600`} />
            </div>
            <div className="text-sm font-semibold">{day2Info.name} Tour</div>
            <div className="text-xs text-gray-600">
              {day2LandmarkCount} landmark{day2LandmarkCount !== 1 ? 's' : ''} selected
            </div>
          </div>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

