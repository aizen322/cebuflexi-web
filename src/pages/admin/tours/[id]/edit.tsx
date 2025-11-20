import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminProtectedRoute } from "@/components/Auth/AdminProtectedRoute";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { tourSchema, TourFormData } from "@/lib/validation/tourSchema";
import { updateTour, getTourById } from "@/services/admin/tourService";
import { uploadTourImages, validateImageFile } from "@/lib/admin/imageUpload";
import type { Tour } from "@/types";

export default function AdminEditTourPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingTour, setFetchingTour] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      title: "",
      category: "Beach",
      description: "",
      shortDescription: "",
      price: 0,
      duration: 1,
      location: "",
      groupSize: { min: 1, max: 10 },
      images: [],
      itinerary: [{ day: 1, title: "", activities: [""], meals: [""] }],
      inclusions: [""],
      available: true,
      featured: false,
    },
  });

  const {
    fields: itineraryFields,
    append: appendItinerary,
    remove: removeItinerary,
    replace: replaceItinerary,
  } = useFieldArray<TourFormData, "itinerary">({
    control,
    name: "itinerary",
  });

  const inclusions = watch("inclusions");

  // Load tour data when component mounts
  useEffect(() => {
    async function loadTour() {
      const tourId = Array.isArray(id) ? id[0] : id;
      if (!tourId || !router.isReady) return;

      try {
        setFetchingTour(true);
        const tour = await getTourById(tourId);

        if (!tour) {
          toast({
            title: "Error",
            description: "Tour not found",
            variant: "destructive",
          });
          router.push("/admin/tours");
          return;
        }

        // Set existing images
        setExistingImages(tour.images || []);
        setImagePreviews(tour.images || []);

        // Normalize itinerary data - join arrays with commas for form display
        const normalizedItinerary = (tour.itinerary || []).map((day) => ({
          ...day,
          activities: Array.isArray(day.activities) 
            ? [day.activities.join(", ")] 
            : [day.activities || ""].filter(Boolean),
          meals: Array.isArray(day.meals) 
            ? [day.meals.join(", ")] 
            : [day.meals || ""].filter(Boolean),
        }));

        // Pre-populate form with tour data
        reset({
          title: tour.title || "",
          category: tour.category || "Beach",
          description: tour.description || "",
          shortDescription: tour.shortDescription || "",
          price: tour.price || 0,
          duration: tour.duration || 1,
          location: tour.location || "",
          groupSize: tour.groupSize || { min: 1, max: 10 },
          images: tour.images || [],
          itinerary: normalizedItinerary.length > 0 ? normalizedItinerary : [{ day: 1, title: "", activities: [""], meals: [""] }],
          inclusions: tour.inclusions && tour.inclusions.length > 0 ? tour.inclusions : [""],
          available: tour.available ?? true,
          featured: tour.featured ?? false,
        });

        // Replace itinerary fields
        if (normalizedItinerary.length > 0) {
          replaceItinerary(normalizedItinerary);
        }
      } catch (error: any) {
        console.error("Error loading tour:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load tour",
          variant: "destructive",
        });
        router.push("/admin/tours");
      } finally {
        setFetchingTour(false);
      }
    }

    loadTour();
  }, [id, router, reset, replaceItinerary, toast]);

  const addInclusion = () => {
    const current = inclusions ?? [];
    setValue(
      "inclusions",
      [...current, ""],
      { shouldDirty: true, shouldTouch: true }
    );
  };

  const removeInclusion = (index: number) => {
    const current = inclusions ?? [];
    if (current.length <= 1) {
      return;
    }
    const next = current.filter((_, i) => i !== index);
    setValue(
      "inclusions",
      next,
      { shouldDirty: true, shouldTouch: true }
    );
  };

  function processFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }
    
    // Validate each file
    const invalidFiles = files.filter(file => !validateImageFile(file).valid);
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid files",
        description: "Some files are invalid. Please check file type and size.",
        variant: "destructive",
      });
      return;
    }

    // Create previews for new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      processFiles(files);
    }
  }

  function removeImage(index: number) {
    // Check if it's an existing image or a new file
    const totalExisting = existingImages.length;
    
    if (index < totalExisting) {
      // Remove existing image
      const newExisting = existingImages.filter((_, i) => i !== index);
      setExistingImages(newExisting);
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove new file
      const fileIndex = index - totalExisting;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  }

  async function onSubmit(data: TourFormData) {
    const tourId = Array.isArray(id) ? id[0] : id;
    if (!tourId) return;

    // Ensure at least one image (existing or new)
    if (existingImages.length === 0 && imageFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please keep at least one image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let finalImageUrls = [...existingImages];

      // Upload new images if any
      if (imageFiles.length > 0) {
        const newImageUrls = await uploadTourImages(
          imageFiles,
          tourId,
          (index, progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [existingImages.length + index]: progress,
            }));
          }
        );
        finalImageUrls = [...existingImages, ...newImageUrls];
      }

      // Process itinerary - split comma-separated activities and meals back into arrays
      const processedItinerary = data.itinerary.map((day) => ({
        ...day,
        activities: day.activities[0] 
          ? day.activities[0].split(",").map(a => a.trim()).filter(Boolean)
          : day.activities,
        meals: day.meals[0]
          ? day.meals[0].split(",").map(m => m.trim()).filter(Boolean)
          : day.meals,
      }));

      // Filter out empty inclusions
      const processedInclusions = (data.inclusions || []).filter(inc => inc.trim().length > 0);

      // Update tour with merged image URLs and processed data
      await updateTour(tourId, {
        ...(data as TourFormData),
        images: finalImageUrls,
        itinerary: processedItinerary,
        inclusions: processedInclusions,
      } as Partial<Tour>);

      toast({
        title: "Success",
        description: "Tour updated successfully",
      });

      router.push("/admin/tours");
    } catch (error: any) {
      console.error("Error updating tour:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update tour",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (fetchingTour) {
    return (
      <AdminProtectedRoute>
        <Head>
          <title>Edit Tour - CebuFlexi Admin</title>
        </Head>
        <AdminLayout>
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <Head>
        <title>Edit Tour - CebuFlexi Admin</title>
      </Head>

      <AdminLayout>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/tours")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Edit Tour</h1>
              <p className="text-muted-foreground mt-1">
                Update tour package details
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Tour
            </Button>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General details about the tour</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tour Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., Cebu Beach Escape"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    onValueChange={(value) => setValue("category", value as any)}
                    value={watch("category")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beach">Beach</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="e.g., Mactan, Moalboal"
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description *</Label>
                <Textarea
                  id="shortDescription"
                  {...register("shortDescription")}
                  placeholder="Brief description (20-200 characters)"
                  rows={2}
                />
                {errors.shortDescription && (
                  <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Detailed description of the tour (minimum 50 characters)"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₱) *</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    {...register("duration", { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.duration && (
                    <p className="text-sm text-destructive">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groupSizeMin">Min Group Size *</Label>
                  <Input
                    id="groupSizeMin"
                    type="number"
                    {...register("groupSize.min", { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.groupSize?.min && (
                    <p className="text-sm text-destructive">{errors.groupSize.min.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupSizeMax">Max Group Size *</Label>
                  <Input
                    id="groupSizeMax"
                    type="number"
                    {...register("groupSize.max", { valueAsNumber: true })}
                    placeholder="10"
                  />
                  {errors.groupSize?.max && (
                    <p className="text-sm text-destructive">{errors.groupSize.max.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Available for Booking</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this tour visible and bookable
                  </p>
                </div>
                <Switch
                  onCheckedChange={(checked) => setValue("available", checked)}
                  checked={watch("available")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured Tour</Label>
                  <p className="text-sm text-muted-foreground">
                    Display this tour prominently on the home page
                  </p>
                </div>
                <Switch
                  onCheckedChange={(checked) => setValue("featured", checked)}
                  checked={watch("featured")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images *</CardTitle>
              <CardDescription>Upload tour images (Max 5MB each, JPEG/PNG/WebP)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 p-4 rounded-lg border-2 border-dashed transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
                        <Loader2 className="h-6 w-6 text-white animate-spin mb-2" />
                        <p className="text-white text-sm font-medium">{Math.round(uploadProgress[index])}%</p>
                      </div>
                    )}
                    {uploadProgress[index] === 100 && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Uploaded
                      </div>
                    )}
                  </div>
                ))}

                <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors min-h-[120px] sm:min-h-[140px] touch-manipulation">
                  <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
                  <span className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                    {isDragging ? "Drop images here" : "Click or drag images"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              </div>
              {imagePreviews.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {imagePreviews.length} image{imagePreviews.length !== 1 ? "s" : ""} ({existingImages.length} existing, {imageFiles.length} new)
                </p>
              )}
            </CardContent>
          </Card>

          {/* Itinerary */}
          <Card>
            <CardHeader>
              <CardTitle>Day-by-Day Itinerary *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {itineraryFields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Day {index + 1}</CardTitle>
                      {itineraryFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItinerary(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      {...register(`itinerary.${index}.title`)}
                      placeholder="Day title"
                    />
                    <Textarea
                      {...register(`itinerary.${index}.activities.0`)}
                      placeholder="Activities (comma-separated)"
                      rows={2}
                    />
                    <Input
                      {...register(`itinerary.${index}.meals.0`)}
                      placeholder="Meals (comma-separated)"
                    />
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendItinerary({
                    day: itineraryFields.length + 1,
                    title: "",
                    activities: [""],
                    meals: [""],
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </CardContent>
          </Card>

          {/* Inclusions */}
          <Card>
            <CardHeader>
              <CardTitle>Inclusions *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(inclusions ?? []).map((_, index) => (
                <div key={`inclusion-${index}`} className="flex gap-2">
                  <Input
                    {...register(`inclusions.${index}`)}
                    placeholder="e.g., Professional guide"
                  />
                  {(inclusions?.length ?? 0) > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInclusion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addInclusion}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Inclusion
              </Button>
            </CardContent>
          </Card>
        </form>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}

