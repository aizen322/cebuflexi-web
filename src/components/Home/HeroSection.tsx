import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  const [tourType, setTourType] = useState<string>("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (tourType) {
      params.append("category", tourType);
    }

    const queryString = params.toString();
    router.push(`/tours${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
          Discover the Beauty of <span className="text-blue-400">Cebu</span>
        </h1>
        <p className="text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto drop-shadow-md">
          Experience world-class beaches, rich history, and unforgettable adventures in the heart of the Philippines
        </p>

        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select value={tourType} onValueChange={setTourType}>
              <SelectTrigger>
                <SelectValue placeholder="Tour Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beach">Beach Tours</SelectItem>
                <SelectItem value="Adventure">Adventure Tours</SelectItem>
                <SelectItem value="Cultural">Cultural Tours</SelectItem>
                <SelectItem value="Food">Food Tours</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              className="bg-blue-600 hover:bg-blue-700 w-full"
              onClick={handleSearch}
            >
              <Search className="mr-2 h-4 w-4" />
              Search Tours
            </Button>
          </div>

          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 w-full md:w-auto"
            onClick={handleSearch}
          >
            Book Your Cebu Adventure
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  );
}