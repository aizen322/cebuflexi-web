import { Landmark } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateMultiDayPrice } from "@/lib/pricingCalculator";

interface DaySummaryProps {
  landmarks: Landmark[];
  minutes: number;
  label: string;
}

interface MultiDayItinerarySummaryProps {
  day1: { landmarks: Landmark[]; minutes: number; isFullPackage: boolean };
  day2: { landmarks: Landmark[]; minutes: number; isFullPackage: boolean };
  groupSize: number;
}

function getVisitMinutes(landmarks: Landmark[]): number {
  return landmarks.reduce((sum, l) => sum + (l.estimatedDuration || 0), 0);
}

function DaySummary({ landmarks, minutes, label }: DaySummaryProps) {
  const visitMinutes = getVisitMinutes(landmarks);
  const travelMinutes = Math.max(minutes - visitMinutes, 0);
  const pctVisit = minutes > 0 ? (visitMinutes / minutes) * 100 : 0;
  const pctTravel = minutes > 0 ? (travelMinutes / minutes) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span>
          {Math.ceil(minutes / 60)}h • {landmarks.length} landmarks
        </span>
      </div>
      <Progress value={pctVisit} className="h-2" />
      <p className="text-xs text-gray-500">
        {pctVisit.toFixed(0)}% visiting • {pctTravel.toFixed(0)}% traveling
      </p>
    </div>
  );
}

export function MultiDayItinerarySummary({ day1, day2, groupSize }: MultiDayItinerarySummaryProps) {
  const combinedMinutes = (day1.minutes || 0) + (day2.minutes || 0);
  const isBothDaysFull = Boolean(day1.isFullPackage && day2.isFullPackage);
  const perPerson = calculateMultiDayPrice(day1.minutes || 0, day2.minutes || 0, isBothDaysFull);
  const totalForGroup = perPerson * Math.max(groupSize || 1, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>2-Day Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DaySummary landmarks={day1.landmarks} minutes={day1.minutes} label="Day 1" />
        <DaySummary landmarks={day2.landmarks} minutes={day2.minutes} label="Day 2" />
        <div className="border-t pt-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Combined Duration</span>
            <span>{Math.ceil(combinedMinutes / 60)} hours</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total (per person)</span>
            <span className="text-xl font-bold text-blue-600">₱{perPerson.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Group Total ({groupSize} {groupSize === 1 ? "person" : "people"})</span>
            <span className="font-bold text-blue-600">₱{totalForGroup.toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <strong>Note:</strong> This is a rough estimate of visit and travel time. Actual duration may vary depending on traffic conditions, time of day, and individual pace.
        </div>
      </CardContent>
    </Card>
  );
}


