import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { featuredTours } from "@/lib/mockData";

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(featuredTours);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions(featuredTours);
    } else {
      const filtered = featuredTours.filter(tour => 
        tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [searchQuery]);

  // Set focus on search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current && 
        suggestionsRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/tours?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/tours');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-center bg-fixed bg-cover md:bg-cover bg-contain"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop')",
          backgroundPosition: "center center",
        }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"></div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Discover the Beauty of <span className="text-blue-400">Cebu</span>
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto drop-shadow-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Experience world-class beaches, rich history, and unforgettable adventures in the heart of the Philippines
        </motion.p>

        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-lg shadow-2xl p-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="relative">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for tours, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyPress={handleKeyPress}
                    className="bg-white/10 border-0 text-white placeholder:text-white/70 pl-10 h-12 text-lg focus:bg-white/20 focus:border-0 focus:ring-0 transition-all duration-200"
                  />
                </div>
                
                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-md rounded-lg shadow-xl z-50 overflow-y-auto glassmorphism-scrollbar"
                    style={{
                      maxHeight: '140px' // Reduced to show ~2 suggestions (60px each)
                    }}
                  >
                    {filteredSuggestions.slice(0, 5).map((tour) => (
                      <button
                        key={tour.id}
                        onClick={() => handleSuggestionClick(tour.title)}
                        className="w-full text-left px-4 py-3 hover:bg-white/20 transition-colors duration-200 border-b border-white/10 last:border-b-0"
                      >
                        <div className="text-white font-medium">{tour.title}</div>
                        <div className="text-white/70 text-sm flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {tour.location}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                className="bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm text-white px-8 h-12 transition-all duration-300 hover:scale-105"
                onClick={handleSearch}
              >
                Search Tours
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  );
}