import { useReducer, useMemo } from "react";
import { Landmark, TourType, TourDuration } from "@/types";

export interface ItineraryState {
  currentStep: "duration" | "tour-type" | "itinerary";
  tourDuration: TourDuration | null;
  day1TourType: TourType | null;
  day2TourType: TourType | null;
  currentDay: 1 | 2;
  day1Landmarks: Landmark[];
  day2Landmarks: Landmark[];
  isFullPackage: boolean;
}

export type ItineraryAction =
  | { type: "SET_STEP"; payload: ItineraryState["currentStep"] }
  | { type: "SET_DURATION"; payload: TourDuration }
  | { type: "SET_DAY1_TOUR_TYPE"; payload: TourType }
  | { type: "SET_DAY2_TOUR_TYPE"; payload: TourType }
  | { type: "SET_CURRENT_DAY"; payload: 1 | 2 }
  | { type: "TOGGLE_LANDMARK"; payload: { landmark: Landmark; day?: 1 | 2 } }
  | { type: "SET_DAY1_LANDMARKS"; payload: Landmark[] }
  | { type: "SET_DAY2_LANDMARKS"; payload: Landmark[] }
  | { type: "REMOVE_LANDMARK"; payload: { landmarkId: string; day?: 1 | 2 } }
  | { type: "REORDER_LANDMARKS"; payload: { landmarks: Landmark[]; day?: 1 | 2 } }
  | { type: "TOGGLE_FULL_PACKAGE" }
  | { type: "SELECT_ALL"; payload: { landmarks: Landmark[]; day?: 1 | 2 } }
  | { type: "RESET" };

const initialState: ItineraryState = {
  currentStep: "duration",
  tourDuration: null,
  day1TourType: null,
  day2TourType: null,
  currentDay: 1,
  day1Landmarks: [],
  day2Landmarks: [],
  isFullPackage: false,
};

function itineraryReducer(
  state: ItineraryState,
  action: ItineraryAction
): ItineraryState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "SET_DURATION":
      return {
        ...state,
        tourDuration: action.payload,
        currentStep: "tour-type",
      };

    case "SET_DAY1_TOUR_TYPE":
      return { ...state, day1TourType: action.payload };

    case "SET_DAY2_TOUR_TYPE":
      return { ...state, day2TourType: action.payload };

    case "SET_CURRENT_DAY":
      return { ...state, currentDay: action.payload };

    case "TOGGLE_LANDMARK": {
      const { landmark, day } = action.payload;

      if (state.tourDuration === "2-days") {
        const targetDay = day || state.currentDay;
        const landmarksKey = targetDay === 1 ? "day1Landmarks" : "day2Landmarks";
        const currentLandmarks = state[landmarksKey];
        const exists = currentLandmarks.some((l) => l.id === landmark.id);

        return {
          ...state,
          [landmarksKey]: exists
            ? currentLandmarks.filter((l) => l.id !== landmark.id)
            : [...currentLandmarks, landmark],
        };
      } else {
        // Single day
        const exists = state.day1Landmarks.some((l) => l.id === landmark.id);
        const newLandmarks = exists
          ? state.day1Landmarks.filter((l) => l.id !== landmark.id)
          : [...state.day1Landmarks, landmark];

        return {
          ...state,
          day1Landmarks: newLandmarks,
          isFullPackage: false, // Reset full package when manually toggling
        };
      }
    }

    case "SET_DAY1_LANDMARKS":
      return { ...state, day1Landmarks: action.payload };

    case "SET_DAY2_LANDMARKS":
      return { ...state, day2Landmarks: action.payload };

    case "REMOVE_LANDMARK": {
      const { landmarkId, day } = action.payload;

      if (state.tourDuration === "2-days") {
        const targetDay = day || state.currentDay;
        const landmarksKey = targetDay === 1 ? "day1Landmarks" : "day2Landmarks";
        return {
          ...state,
          [landmarksKey]: state[landmarksKey].filter((l) => l.id !== landmarkId),
        };
      } else {
        return {
          ...state,
          day1Landmarks: state.day1Landmarks.filter((l) => l.id !== landmarkId),
          isFullPackage: false,
        };
      }
    }

    case "REORDER_LANDMARKS": {
      const { landmarks, day } = action.payload;

      if (state.tourDuration === "2-days") {
        const targetDay = day || state.currentDay;
        const landmarksKey = targetDay === 1 ? "day1Landmarks" : "day2Landmarks";
        return {
          ...state,
          [landmarksKey]: landmarks,
        };
      } else {
        return {
          ...state,
          day1Landmarks: landmarks,
        };
      }
    }

    case "TOGGLE_FULL_PACKAGE":
      return { ...state, isFullPackage: !state.isFullPackage };

    case "SELECT_ALL": {
      const { landmarks, day } = action.payload;

      if (state.tourDuration === "2-days") {
        const targetDay = day || state.currentDay;
        const landmarksKey = targetDay === 1 ? "day1Landmarks" : "day2Landmarks";
        return {
          ...state,
          [landmarksKey]: landmarks,
        };
      } else {
        return {
          ...state,
          day1Landmarks: landmarks,
          isFullPackage: landmarks.length > 0,
        };
      }
    }

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export function useItineraryState() {
  const [state, dispatch] = useReducer(itineraryReducer, initialState);

  // Derived state - memoized for performance
  const selectedLandmarks = useMemo(() => {
    if (state.tourDuration === "2-days") {
      return state.currentDay === 1 ? state.day1Landmarks : state.day2Landmarks;
    }
    return state.day1Landmarks;
  }, [
    state.tourDuration,
    state.currentDay,
    state.day1Landmarks,
    state.day2Landmarks,
  ]);

  const canProceedToItinerary = useMemo(() => {
    if (!state.tourDuration) return false;
    if (!state.day1TourType) return false;
    if (state.tourDuration === "2-days" && !state.day2TourType) return false;
    return true;
  }, [state.tourDuration, state.day1TourType, state.day2TourType]);

  const canBook = useMemo(() => {
    if (state.tourDuration === "2-days") {
      return state.day1Landmarks.length > 0 && state.day2Landmarks.length > 0;
    }
    return state.day1Landmarks.length > 0;
  }, [state.tourDuration, state.day1Landmarks, state.day2Landmarks]);

  return {
    state,
    dispatch,
    selectedLandmarks,
    canProceedToItinerary,
    canBook,
  };
}

