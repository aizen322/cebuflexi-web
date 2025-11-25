import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { TourCard } from "@/components/Tours/TourCard";
import { TourFilters } from "@/components/Tours/TourFilters";
import { DIYTourCallout } from "@/components/Tours/DIYTourCallout";
import { Tour } from "@/types";
import { useToursData } from "@/contexts/ContentDataContext";

interface TourFiltersData {
  category?: string;
  priceRange?: { min: number; max: number } | [number, number];
  duration?: string;
  location?: string;
  search?: string;
}

export default function ToursPage() {
  const router = useRouter();
  const { data: tours, loading } = useToursData();
  const [filteredTours, setFilteredTours] = useState<Tour[]>(tours);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setFilteredTours(tours);
  }, [tours]);

  const handleFilterChange = useCallback((filters: TourFiltersData) => {
    let filtered = [...tours];

    // Search filter (highest priority)
    const searchValue = filters.search;
    if (searchValue && searchValue.trim()) {
      const searchTerm = searchValue.toLowerCase().trim();
      filtered = filtered.filter(tour => 
        tour.title.toLowerCase().includes(searchTerm) ||
        tour.location.toLowerCase().includes(searchTerm)
      );
    }

    const categoryValue = filters.category;
    if (categoryValue && categoryValue !== "all") {
      filtered = filtered.filter(tour => tour.category === categoryValue);
      setSelectedCategory(categoryValue);
    } else {
      setSelectedCategory("all");
    }

    const durationValue = filters.duration;
    if (durationValue && durationValue !== "all") {
      const [min, max] = durationValue.split("-").map(Number);
      filtered = filtered.filter(tour => tour.duration >= min && tour.duration <= max);
    }

    const priceRange = filters.priceRange;
    if (priceRange) {
      const min = Array.isArray(priceRange) ? priceRange[0] : priceRange.min;
      const max = Array.isArray(priceRange) ? priceRange[1] : priceRange.max;
      filtered = filtered.filter(
        (tour) => tour.price >= min && tour.price <= max
      );
    }

    setFilteredTours(filtered);
  }, [tours]);

  useEffect(() => {
    const { category, search } = router.query;
    
    const filters: TourFiltersData = {};
    
    if (category && typeof category === "string") {
      filters.category = category;
    }
    
    if (search && typeof search === "string") {
      filters.search = search;
      setSearchQuery(search);
    } else {
      // Clear search query if not in URL
      setSearchQuery("");
    }
    
    handleFilterChange(filters);
  }, [router.query, handleFilterChange]);

  return (
    <>
      <Head>
        <title>Cebu Tours & Packages | CebuFlexi Tours</title>
        <meta name="description" content="Browse our comprehensive selection of Cebu tour packages. Beach tours, adventure tours, cultural experiences, and food tours. Book your perfect Cebu adventure today." />
        <meta name="keywords" content="Cebu tours, Cebu tour packages, beach tours Cebu, island hopping Cebu, Cebu adventure tours, cultural tours Philippines, Cebu whale shark tour, Kawasan Falls tour" />
        <link rel="canonical" href="https://cebuflexitours.com/tours" />
      </Head>

      <Header />

      <main className="pt-20 min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Cebu Tours
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl">
              Choose from our handpicked selection of tours designed to showcase the best of Cebu. From pristine beaches to rich cultural heritage, find your perfect adventure.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <aside className="lg:w-1/4">
                <TourFilters onFilterChange={handleFilterChange} />
              </aside>

              <div className="lg:w-3/4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {searchQuery && searchQuery.trim() ? (
                      <>
                        Search Results for "{searchQuery}"
                        <span className="text-gray-500 text-lg ml-2">({filteredTours.length})</span>
                      </>
                    ) : (
                      <>
                        {selectedCategory === "all" ? "All Tours" : `${selectedCategory} Tours`}
                        <span className="text-gray-500 text-lg ml-2">({filteredTours.length})</span>
                      </>
                    )}
                  </h2>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-600">Loading tours...</p>
                  </div>
                ) : filteredTours.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-600">No tours match your filters. Try adjusting your criteria.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredTours.map((tour) => (
                        <TourCard key={tour.id} tour={tour} />
                      ))}
                    </div>
                    
                    {/* DIY Tour Callout */}
                    <div className="mt-10">
                      <DIYTourCallout />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}