import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BlogPost,
  Landmark,
  Testimonial,
  Tour,
  Vehicle,
} from "@/types";
import {
  fallbackTours,
  fallbackVehicles,
  fallbackBlogPosts,
  fallbackLandmarks,
  fallbackTestimonials,
} from "@/lib/fallbackData";
import {
  fetchBlogPosts,
  fetchLandmarks,
  fetchTestimonials,
  fetchTours,
  fetchVehicles,
} from "@/services/contentService";
import { db } from "@/lib/firebase";

type ContentDataContextValue = {
  tours: Tour[];
  vehicles: Vehicle[];
  blogPosts: BlogPost[];
  landmarks: Landmark[];
  testimonials: Testimonial[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
};

const defaultValue: ContentDataContextValue = {
  tours: fallbackTours,
  vehicles: fallbackVehicles,
  blogPosts: fallbackBlogPosts,
  landmarks: fallbackLandmarks,
  testimonials: fallbackTestimonials,
  loading: false,
  error: undefined,
  refresh: async () => undefined,
};

const ContentDataContext = createContext<ContentDataContextValue>(defaultValue);

export function ContentDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentDataContextValue>({
    ...defaultValue,
    loading: true,
  });

  const refresh = useCallback(async () => {
    if (!db) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Firestore is not initialized.",
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: undefined }));
      const [toursData, vehiclesData, blogData, landmarkData, testimonialData] =
        await Promise.all([
          fetchTours(),
          fetchVehicles(),
          fetchBlogPosts(),
          fetchLandmarks(),
          fetchTestimonials(),
        ]);

      setState({
        tours: toursData.length ? toursData : defaultValue.tours,
        vehicles: vehiclesData.length ? vehiclesData : defaultValue.vehicles,
        blogPosts: blogData.length ? blogData : defaultValue.blogPosts,
        landmarks: landmarkData.length ? landmarkData : defaultValue.landmarks,
        testimonials: testimonialData.length
          ? testimonialData
          : defaultValue.testimonials,
        loading: false,
        error: undefined,
        refresh,
      });
    } catch (error) {
      // Handle permission errors gracefully - use fallback data
      const firebaseError = error as { code?: string };
      if (firebaseError.code === "permission-denied") {
        // Use fallback data for unauthenticated users or permission issues
        setState({
          ...defaultValue,
          loading: false,
          error: undefined,
          refresh,
        });
        return;
      }
      
      // For other errors, still use fallback data but log the error
      if (process.env.NODE_ENV === "development") {
        console.error("[ContentData] Failed to load content:", error);
      }
      setState({
        ...defaultValue,
        loading: false,
        error: undefined,
        refresh,
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<ContentDataContextValue>(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh]
  );

  return (
    <ContentDataContext.Provider value={value}>
      {children}
    </ContentDataContext.Provider>
  );
}

export function useContentData() {
  return useContext(ContentDataContext);
}

export function useToursData() {
  const { tours, loading, error, refresh } = useContentData();
  return { data: tours, loading, error, refresh };
}

export function useVehiclesData() {
  const { vehicles, loading, error, refresh } = useContentData();
  return { data: vehicles, loading, error, refresh };
}

export function useBlogPostsData() {
  const { blogPosts, loading, error, refresh } = useContentData();
  return { data: blogPosts, loading, error, refresh };
}

export function useLandmarksData() {
  const { landmarks, loading, error, refresh } = useContentData();
  return { data: landmarks, loading, error, refresh };
}

export function useTestimonialsData() {
  const { testimonials, loading, error, refresh } = useContentData();
  return { data: testimonials, loading, error, refresh };
}

