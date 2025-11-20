import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { tourSchema, TourFormData } from "@/lib/validation/tourSchema";
import { createTour } from "@/services/admin/tourService";
import { uploadTourImages, validateImageFile } from "@/lib/admin/imageUpload";
import type { Tour } from "@/types";

export default function AdminNewTourPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
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
  } = useFieldArray<TourFormData, "itinerary">({
    control,
    name: "itinerary",
  });

  const inclusions = watch("inclusions");

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

    // Create previews and add files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => {
      const updated = [...prev, ...files];
      console.log("Updated imageFiles:", updated.length);
      return updated;
    });
    
    setImagePreviews(prev => {
      const updated = [...prev, ...newPreviews];
      console.log("Updated imagePreviews:", updated.length);
      return updated;
    });
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    // Clear the input so the same file can be selected again if needed
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

  function handleTestImages() {
    // Trigger file picker for quick testing
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const files = Array.from(target.files || []);
      if (files.length > 0) {
        processFiles(files);
      }
    };
    input.click();
  }

  function removeImage(index: number) {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    
    // Get all error messages (safely extract without stringifying)
    const errorMessages: string[] = [];
    const extractErrors = (errObj: any, prefix = "") => {
      Object.keys(errObj).forEach((key) => {
        const error = errObj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (error?.message) {
          errorMessages.push(`${fullKey}: ${error.message}`);
        } else if (error?.type) {
          errorMessages.push(`${fullKey}: ${error.type}`);
        } else if (typeof error === 'object' && error !== null && !Array.isArray(error)) {
          // Recursively extract nested errors
          extractErrors(error, fullKey);
        }
      });
    };
    
    extractErrors(errors);

    const errorMessage = errorMessages.length > 0 
      ? errorMessages.join(". ") 
      : "Please check all required fields";
    
    toast({
      title: "Validation Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  async function onSubmit(data: TourFormData) {
    console.log("Form submitted with data:", data);
    console.log("Image files count:", imageFiles.length);
    console.log("Image previews count:", imagePreviews.length);
    
    // Validate images - check if user has selected any images
    // Use imagePreviews as primary check since that's what user sees
    if (imagePreviews.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one image",
        variant: "destructive",
      });
      return;
    }

    // Ensure imageFiles and imagePreviews are in sync
    // If they don't match, use imagePreviews length but warn
    if (imageFiles.length !== imagePreviews.length) {
      console.warn("Image files and previews are out of sync. Files:", imageFiles.length, "Previews:", imagePreviews.length);
      console.warn("This might be a state sync issue. Proceeding with available files.");
      
      // If we have fewer files than previews, it's a problem
      if (imageFiles.length < imagePreviews.length) {
        toast({
          title: "Error",
          description: "Some images failed to load. Please try selecting images again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Use the actual files array length for upload
    const filesToUpload = imageFiles.length > 0 ? imageFiles : [];
    if (filesToUpload.length === 0) {
      toast({
        title: "Error",
        description: "No image files found. Please try selecting images again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Starting tour creation process...");
      
      // Process itinerary - split comma-separated activities and meals back into arrays
      const processedItinerary = data.itinerary.map((day, index) => {
        // Get the activities string (from activities[0] which is registered in the form)
        const activitiesStr = day.activities && day.activities.length > 0 ? day.activities[0] : "";
        const mealsStr = day.meals && day.meals.length > 0 ? day.meals[0] : "";

        const activities = activitiesStr.trim()
          ? activitiesStr.split(",").map(a => a.trim()).filter(Boolean)
          : [];
        const meals = mealsStr.trim()
          ? mealsStr.split(",").map(m => m.trim()).filter(Boolean)
          : [];

        // Ensure at least one activity (required by schema)
        if (activities.length === 0) {
          throw new Error(`Day ${index + 1}: At least one activity is required`);
        }

        // Ensure day title is provided
        if (!day.title || day.title.trim().length < 3) {
          throw new Error(`Day ${index + 1}: Title must be at least 3 characters`);
        }

        return {
          day: index + 1, // Ensure day number is correct
          title: day.title.trim(),
          activities,
          meals,
        };
      });

      // Filter out empty inclusions
      const processedInclusions = (data.inclusions || []).filter(inc => inc.trim().length > 0);
      
      if (processedInclusions.length === 0) {
        throw new Error("At least one inclusion is required");
      }

      // First create tour without images to get the real tour ID
      const tourData: Omit<Tour, "id"> = {
        title: data.title,
        category: data.category,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        duration: data.duration,
        location: data.location,
        groupSize: {
          min: data.groupSize.min,
          max: data.groupSize.max,
        },
        images: [], // Create with empty images first
        itinerary: processedItinerary,
        inclusions: processedInclusions,
        available: data.available,
        featured: data.featured,
      };

      // Create tour first to get the real tour ID
      const tourId = await createTour(tourData);
      console.log("Tour created with ID:", tourId);

      // Verify authentication before upload
      const { auth } = await import("@/lib/firebase");
      const currentUser = auth.currentUser;
      if (!currentUser) {
        const { deleteTour } = await import("@/services/admin/tourService");
        await deleteTour(tourId).catch(console.error);
        throw new Error("You must be logged in to upload images. Please refresh the page and try again.");
      }
      console.log("User authenticated:", currentUser.uid);

      // Now upload images with the real tour ID
      let imageUrls: string[] = [];
      try {
        imageUrls = await uploadTourImages(
          filesToUpload,
          tourId,
          (index, progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [index]: progress,
            }));
          }
        );
        console.log("Images uploaded successfully:", imageUrls.length);

        // Update tour with image URLs
        if (imageUrls.length > 0) {
          const { updateTour } = await import("@/services/admin/tourService");
          await updateTour(tourId, { images: imageUrls });
          console.log("Tour updated with images");
        }
      } catch (uploadError: any) {
        console.error("Error uploading images:", uploadError);
        console.error("Error details:", {
          code: uploadError.code,
          message: uploadError.message,
          stack: uploadError.stack
        });
        
        // Check if it's a CORS error (can appear in various forms)
        const errorMessage = String(uploadError.message || "");
        const errorCode = String(uploadError.code || "");
        const isCorsError = 
          errorMessage.includes("CORS") || 
          errorMessage.includes("blocked") ||
          errorMessage.includes("preflight") ||
          errorMessage.includes("ERR_FAILED") ||
          errorCode === "storage/unauthorized" ||
          errorCode === "storage/unknown";
        
        // If image upload fails, delete the tour and show error
        const { deleteTour } = await import("@/services/admin/tourService");
        try {
          await deleteTour(tourId);
        } catch (deleteError) {
          console.error("Error deleting tour after upload failure:", deleteError);
        }
        
        if (isCorsError || !errorMessage) {
          const detailedMessage = 
            "❌ Image upload failed due to Firebase Storage Security Rules.\n\n" +
            "📋 To fix this:\n" +
            "1. Go to Firebase Console: https://console.firebase.google.com/\n" +
            "2. Select your project: cebuflexitours\n" +
            "3. Navigate to Storage > Rules\n" +
            "4. Replace your rules with:\n\n" +
            "rules_version = '2';\n" +
            "service firebase.storage {\n" +
            "  match /b/{bucket}/o {\n" +
            "    match /tours/{tourId}/images/{fileName} {\n" +
            "      allow read: if true;\n" +
            "      allow write: if request.auth != null;\n" +
            "    }\n" +
            "    match /vehicles/{vehicleId}/image/{fileName} {\n" +
            "      allow read: if true;\n" +
            "      allow write: if request.auth != null;\n" +
            "    }\n" +
            "    match /landmarks/{landmarkId}/image/{fileName} {\n" +
            "      allow read: if true;\n" +
            "      allow write: if request.auth != null;\n" +
            "    }\n" +
            "  }\n" +
            "}\n\n" +
            "5. Click 'Publish'\n\n" +
            "See FIREBASE_STORAGE_RULES_SETUP.md for detailed instructions.";
          
          console.error(detailedMessage);
          throw new Error(
            "Image upload blocked by Firebase Storage Rules. " +
            "Please update your Storage rules in Firebase Console. " +
            "Check the browser console for detailed instructions."
          );
        }
        
        throw new Error(`Failed to upload images: ${uploadError.message || "Unknown error. Please check Firebase Storage rules and authentication"}`);
      }

      toast({
        title: "Success",
        description: "Tour created successfully",
      });

      router.push("/admin/tours");
    } catch (error: any) {
      console.error("Error creating tour:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create tour",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtectedRoute>
      <Head>
        <title>New Tour - CebuFlexi Admin</title>
      </Head>

      <AdminLayout>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
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
              <h1 className="text-3xl font-bold tracking-tight">Create New Tour</h1>
              <p className="text-muted-foreground mt-1">
                Add a new tour package to your offerings
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Tour
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
                    defaultValue="Beach"
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Images *</CardTitle>
                  <CardDescription>Upload tour images (Max 5MB each, JPEG/PNG/WebP)</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestImages}
                  className="shrink-0"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Quick Upload
                </Button>
              </div>
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
                  {imagePreviews.length} image{imagePreviews.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Itinerary - Due to size, I'll create a simplified version */}
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
                    <div className="space-y-2">
                      <Input
                        {...register(`itinerary.${index}.title`)}
                        placeholder="Day title"
                      />
                      {errors.itinerary?.[index]?.title && (
                        <p className="text-sm text-destructive">
                          {errors.itinerary[index]?.title?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        {...register(`itinerary.${index}.activities.0`)}
                        placeholder="Activities (comma-separated)"
                        rows={2}
                      />
                      {errors.itinerary?.[index]?.activities && (
                        <p className="text-sm text-destructive">
                          {errors.itinerary[index]?.activities?.message || "At least one activity is required"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        {...register(`itinerary.${index}.meals.0`)}
                        placeholder="Meals (comma-separated)"
                      />
                    </div>
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


