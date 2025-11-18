import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mountain, Building2, Check } from "lucide-react";
import { TourType, TourDuration } from "@/types";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useLandmarksData } from "@/contexts/ContentDataContext";

interface TourSelectionStepProps {
  step: "duration" | "tour-type";
  tourDuration: TourDuration | null;
  day1TourType: TourType | null;
  day2TourType: TourType | null;
  onDurationSelect: (duration: TourDuration) => void;
  onDay1TourTypeSelect: (type: TourType) => void;
  onDay2TourTypeSelect: (type: TourType) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function TourSelectionStep({
  step,
  tourDuration,
  day1TourType,
  day2TourType,
  onDurationSelect,
  onDay1TourTypeSelect,
  onDay2TourTypeSelect,
  onContinue,
  onBack
}: TourSelectionStepProps) {
  const { data: landmarks } = useLandmarksData();
  const { cebuLandmarks, mountainLandmarks } = useMemo(() => {
    const cebu = landmarks.filter((landmark) => landmark.tourType === "cebu-city");
    const mountain = landmarks.filter((landmark) => landmark.tourType === "mountain");
    return { cebuLandmarks: cebu, mountainLandmarks: mountain };
  }, [landmarks]);
  
  const canContinue = () => {
    if (step === "duration") return tourDuration !== null;
    if (step === "tour-type") {
      if (tourDuration === "1-day") return day1TourType !== null;
      if (tourDuration === "2-days") return day1TourType !== null && day2TourType !== null;
    }
    return false;
  };

  const getTourTypeInfo = (type: TourType) => {
    const landmarks = type === "cebu-city" ? cebuLandmarks : mountainLandmarks;
    return {
      name: type === "cebu-city" ? "Cebu City Tour" : "Mountain Tour",
      icon: type === "cebu-city" ? Building2 : Mountain,
      description: type === "cebu-city" 
        ? "Explore historical landmarks and cultural heritage sites in downtown Cebu"
        : "Discover scenic mountain viewpoints, gardens, and panoramic vistas",
      landmarkCount: landmarks.length,
      sampleImages: landmarks.slice(0, 3).map(l => l.image),
      color: type === "cebu-city" ? "blue" : "green"
    };
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className={`flex items-center gap-2 ${step === "duration" ? "text-blue-600" : "text-green-600"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
            step === "duration" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
          }`}>
            {step === "duration" ? "1" : <Check className="h-5 w-5" />}
          </div>
          <span className="font-semibold">Duration</span>
        </div>
        
        <div className="w-16 h-0.5 bg-gray-300"></div>
        
        <div className={`flex items-center gap-2 ${step === "tour-type" ? "text-blue-600" : "text-gray-400"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
            step === "tour-type" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
          }`}>
            2
          </div>
          <span className="font-semibold">Tour Type</span>
        </div>
      </div>

      {/* Step 1: Duration Selection */}
      {step === "duration" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Choose Your Tour Duration</h2>
            <p className="text-gray-600">How many days would you like to explore?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                tourDuration === "1-day" ? "ring-2 ring-blue-600 bg-blue-50" : ""
              }`}
              onClick={() => onDurationSelect("1-day")}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <Calendar className="h-16 w-16 mx-auto text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">1-Day Tour</h3>
                <p className="text-gray-600 mb-4">
                  Perfect for a focused exploration of one area
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Single destination focus</p>
                  <p>✓ 6-8 hours of exploration</p>
                  <p>✓ Ideal for first-time visitors</p>
                </div>
                {tourDuration === "1-day" && (
                  <Badge className="mt-4 bg-blue-600">Selected</Badge>
                )}
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                tourDuration === "2-days" ? "ring-2 ring-blue-600 bg-blue-50" : ""
              }`}
              onClick={() => onDurationSelect("2-days")}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <Calendar className="h-16 w-16 mx-auto text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">2-Days Tour</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive experience covering multiple areas
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Explore both city and mountains</p>
                  <p>✓ 12-16 hours total</p>
                  <p>✓ Best value for money</p>
                </div>
                {tourDuration === "2-days" && (
                  <Badge className="mt-4 bg-purple-600">Selected</Badge>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-8">
            <Button
              size="lg"
              onClick={onContinue}
              disabled={!canContinue()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue to Tour Selection
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Tour Type Selection */}
      {step === "tour-type" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Select Your Tour Type</h2>
            <p className="text-gray-600">
              {tourDuration === "1-day" 
                ? "Choose between city heritage or mountain scenery"
                : "Select tour types for each day of your adventure"
              }
            </p>
          </div>

          {/* 1-Day Tour Type Selection */}
          {tourDuration === "1-day" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {(["cebu-city", "mountain"] as TourType[]).map((type) => {
                const info = getTourTypeInfo(type);
                const isSelected = day1TourType === type;
                
                return (
                  <Card
                    key={type}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                      isSelected ? `ring-2 ring-${info.color}-600 bg-${info.color}-50` : ""
                    }`}
                    onClick={() => onDay1TourTypeSelect(type)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <info.icon className={`h-10 w-10 text-${info.color}-600`} />
                        <div>
                          <h3 className="text-xl font-bold">{info.name}</h3>
                          <p className="text-sm text-gray-600">{info.landmarkCount} landmarks</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{info.description}</p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {info.sampleImages.map((img, idx) => (
                          <div key={idx} className="h-20 rounded-lg overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      
                      {isSelected && (
                        <Badge className={`bg-${info.color}-600`}>Selected</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* 2-Days Tour Type Selection */}
          {tourDuration === "2-days" && (
            <div className="space-y-8">
              {/* Day 1 Selection */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Badge className="bg-blue-600">Day 1</Badge>
                  Select First Day Tour
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(["cebu-city", "mountain"] as TourType[]).map((type) => {
                    const info = getTourTypeInfo(type);
                    const isSelected = day1TourType === type;
                    
                    return (
                      <Card
                        key={type}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          isSelected ? `ring-2 ring-${info.color}-600 bg-${info.color}-50` : ""
                        }`}
                        onClick={() => onDay1TourTypeSelect(type)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <info.icon className={`h-8 w-8 text-${info.color}-600`} />
                            <h4 className="font-bold">{info.name}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{info.description}</p>
                          <div className="grid grid-cols-3 gap-1">
                            {info.sampleImages.map((img, idx) => (
                              <div key={idx} className="h-16 rounded overflow-hidden">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                          {isSelected && (
                            <Badge className={`mt-2 bg-${info.color}-600`}>Selected</Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Day 2 Selection */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Badge className="bg-purple-600">Day 2</Badge>
                  Select Second Day Tour
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(["cebu-city", "mountain"] as TourType[]).map((type) => {
                    const info = getTourTypeInfo(type);
                    const isSelected = day2TourType === type;
                    
                    return (
                      <Card
                        key={type}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          isSelected ? `ring-2 ring-${info.color}-600 bg-${info.color}-50` : ""
                        }`}
                        onClick={() => onDay2TourTypeSelect(type)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <info.icon className={`h-8 w-8 text-${info.color}-600`} />
                            <h4 className="font-bold">{info.name}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{info.description}</p>
                          <div className="grid grid-cols-3 gap-1">
                            {info.sampleImages.map((img, idx) => (
                              <div key={idx} className="h-16 rounded overflow-hidden">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                          {isSelected && (
                            <Badge className={`mt-2 bg-${info.color}-600`}>Selected</Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4 mt-8">
            <Button
              size="lg"
              variant="outline"
              onClick={onBack}
            >
              Back
            </Button>
            <Button
              size="lg"
              onClick={onContinue}
              disabled={!canContinue()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue to Build Itinerary
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

