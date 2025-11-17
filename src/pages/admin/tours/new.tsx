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
import { ArrowLeft, Plus, Trash2, Upload, Loader2 } from "lucide-react";
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

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    
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

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  }

  function removeImage(index: number) {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: TourFormData) {
    if (imageFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First create tour with temporary ID to get tour ID
      const tempTourId = `temp-${Date.now()}`;
      
      // Upload images
      const imageUrls = await uploadTourImages(
        imageFiles,
        tempTourId,
        (index, progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [index]: progress,
          }));
        }
      );

      // Create tour with uploaded image URLs
      const tourId = await createTour({
        ...(data as TourFormData),
        images: imageUrls,
      } as Omit<Tour, "id">);

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
                  defaultChecked={true}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured Tour</Label>
                  <p className="text-sm text-muted-foreground">
                    Display this tour prominently on the home page
                  </p>
                </div>
                <Switch onCheckedChange={(checked) => setValue("featured", checked)} />
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <p className="text-white text-sm">{Math.round(uploadProgress[index])}%</p>
                      </div>
                    )}
                  </div>
                ))}

                <label className="border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Add Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              </div>
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


