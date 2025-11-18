import { useMemo } from "react";
import { Landmark } from "@/types";
import { ItineraryMap } from "./ItineraryMap";
import { LandmarkSelector } from "./LandmarkSelector";
import { SelectedLandmarks } from "./SelectedLandmarks";
import { ItineraryState } from "@/hooks/useItineraryState";
import { useLandmarksData } from "@/contexts/ContentDataContext";

interface ItineraryBuilderProps {
  state: ItineraryState;
  selectedLandmarks: Landmark[];
  onToggleLandmark: (landmark: Landmark) => void;
  onSelectAll: () => void;
  onReorder: (landmarks: Landmark[]) => void;
  onRemove: (landmark: Landmark) => void;
}

export function ItineraryBuilder({
  state,
  selectedLandmarks,
  onToggleLandmark,
  onSelectAll,
  onReorder,
  onRemove,
}: ItineraryBuilderProps) {
  const { data: landmarksData } = useLandmarksData();
  const { cebuLandmarks, mountainLandmarks } = useMemo(() => {
    const cebu = landmarksData.filter((landmark) => landmark.tourType === "cebu-city");
    const mountain = landmarksData.filter((landmark) => landmark.tourType === "mountain");
    return { cebuLandmarks: cebu, mountainLandmarks: mountain };
  }, [landmarksData]);

  const getLandmarksForCurrentView = () => {
    if (state.tourDuration === "1-day" && state.day1TourType) {
      return state.day1TourType === "mountain" ? mountainLandmarks : cebuLandmarks;
    }
    if (state.tourDuration === "2-days") {
      const tourType = state.currentDay === 1 ? state.day1TourType : state.day2TourType;
      return tourType === "mountain" ? mountainLandmarks : cebuLandmarks;
    }
    return [];
  };

  const landmarks = getLandmarksForCurrentView();
  const currentTourType =
    state.tourDuration === "1-day"
      ? state.day1TourType
      : state.currentDay === 1
      ? state.day1TourType
      : state.day2TourType;

  if (!currentTourType) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Interactive Map */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Interactive Route Map</h2>
        <ItineraryMap
          landmarks={landmarks}
          selectedLandmarks={selectedLandmarks}
          markerColor={state.tourDuration === "2-days" && state.currentDay === 2 ? "green" : "blue"}
        />
      </div>

      {/* Landmark Selector */}
      <div className="bg-white rounded-lg p-6">
        <LandmarkSelector
          landmarks={landmarks}
          selectedLandmarks={selectedLandmarks}
          onToggleLandmark={onToggleLandmark}
          onSelectAll={onSelectAll}
          isAllSelected={state.tourDuration === "1-day" ? state.isFullPackage : false}
          tourType={currentTourType}
        />
      </div>

      {/* Selected Landmarks with Drag & Drop */}
      <div className="bg-white rounded-lg p-6">
        <SelectedLandmarks
          selectedLandmarks={selectedLandmarks}
          onReorder={onReorder}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
}

