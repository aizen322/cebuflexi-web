import { Landmark } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { calculateTotalTime, formatTime } from "@/lib/distanceCalculator";
import { calculatePrice, getPricingBreakdown, isFullPackageBetter } from "@/lib/pricingCalculator";
import { Progress } from "@/components/ui/progress";

interface ItinerarySummaryProps {
  selectedLandmarks: Landmark[];
  isFullPackage: boolean;
}

export function ItinerarySummary({ selectedLandmarks, isFullPackage }: ItinerarySummaryProps) {
  const totalTime = calculateTotalTime(selectedLandmarks);
  const totalPrice = calculatePrice(totalTime, isFullPackage);
  const pricingBreakdown = getPricingBreakdown(totalTime, isFullPackage, selectedLandmarks.length);
  const shouldShowFullPackageSuggestion = !isFullPackage && isFullPackageBetter(totalTime) && selectedLandmarks.length > 0;

  const totalHours = Math.ceil(totalTime / 60);
  const visitTime = selectedLandmarks.reduce((sum, l) => sum + l.estimatedDuration, 0);
  const travelTime = totalTime - visitTime;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Itinerary Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedLandmarks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Start building your itinerary by selecting landmarks</p>
          </div>
        ) : (
          <>
            {/* Landmarks Count */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Landmarks</span>
              </div>
              <Badge className="bg-blue-600">{selectedLandmarks.length}</Badge>
            </div>

            {/* Time Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold">Total Duration</span>
                </div>
                <span className="font-bold text-lg text-orange-600">
                  {formatTime(totalTime)}
                </span>
              </div>
              
              <div className="pl-7 space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Visit time:</span>
                  <span>{formatTime(visitTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Travel time:</span>
                  <span>{formatTime(travelTime)}</span>
                </div>
              </div>

              {/* Time Progress Bar */}
              <div className="space-y-1">
                <Progress value={(visitTime / totalTime) * 100} className="h-2" />
                <p className="text-xs text-gray-500">
                  {((visitTime / totalTime) * 100).toFixed(0)}% visiting • {((travelTime / totalTime) * 100).toFixed(0)}% traveling
                </p>
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>Note:</strong> This is a rough estimate of visit and travel time. Actual duration may vary depending on traffic conditions, time of day, and individual pace.
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Pricing</span>
              </div>

              {isFullPackage ? (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Full Package Deal</span>
                    <Badge className="bg-green-600">Best Value</Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    ₱{totalPrice.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    All {selectedLandmarks.length} landmarks • {formatTime(totalTime)}
                  </p>
                  {pricingBreakdown.savings > 0 && (
                    <p className="text-xs text-green-600 mt-2 font-semibold">
                      Save ₱{pricingBreakdown.savings.toLocaleString()} vs hourly rate!
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base rate (3 hours):</span>
                    <span>₱{pricingBreakdown.baseRate.toLocaleString()}</span>
                  </div>
                  {pricingBreakdown.additionalHours > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>+{pricingBreakdown.additionalHours}h additional:</span>
                      <span>₱{pricingBreakdown.additionalCost.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Full Package Suggestion */}
            {shouldShowFullPackageSuggestion && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800 mb-1">
                      Full Package Recommended
                    </p>
                    <p className="text-xs text-yellow-700">
                      Select all landmarks for the full package and save ₱{pricingBreakdown.savings.toLocaleString()}!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Route Preview */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Route Preview
              </h4>
              <div className="space-y-2">
                {selectedLandmarks.map((landmark, index) => (
                  <div key={landmark.id} className="flex items-start gap-2 text-xs">
                    <Badge variant="outline" className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <div className="flex-grow">
                      <p className="font-medium">{landmark.name}</p>
                      <p className="text-gray-500">~{landmark.estimatedDuration}min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

