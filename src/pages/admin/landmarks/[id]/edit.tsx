import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminProtectedRoute } from "@/components/Auth/AdminProtectedRoute";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2, Trash2 } from "lucide-react";
import { landmarkSchema, LandmarkFormData } from "@/lib/validation/landmarkSchema";
import { updateLandmark, getLandmarkById } from "@/services/admin/landmarkService";
import { uploadLandmarkImage, validateImageFile } from "@/lib/admin/imageUpload";
import type { Landmark } from "@/types";

export default function AdminEditLandmarkPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingLandmark, setFetchingLandmark] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<LandmarkFormData>({
    resolver: zodResolver(landmarkSchema),
    defaultValues: {
      name: "",
      description: "",
      location: { lat: 10.3157, lng: 123.8854 },
      estimatedDuration: 60,
      category: "Cultural",
      tourType: "cebu-city",
    },
  });

  // Load landmark data when component mounts
  useEffect(() => {
    async function loadLandmark() {
      const landmarkId = Array.isArray(id) ? id[0] : id;
      if (!landmarkId || !router.isReady) return;

      try {
        setFetchingLandmark(true);
        const landmark = await getLandmarkById(landmarkId);

        if (!landmark) {
          toast({
            title: "Error",
            description: "Landmark not found",
            variant: "destructive",
          });
          router.push("/admin/landmarks");
          return;
        }

        // Set existing image
        setExistingImage(landmark.image || null);
        setImagePreview(landmark.image || null);

        // Pre-populate form with landmark data
        reset({
          name: landmark.name || "",
          description: landmark.description || "",
          location: landmark.location || { lat: 10.3157, lng: 123.8854 },
          estimatedDuration: landmark.estimatedDuration || 60,
          category: landmark.category || "Cultural",
          tourType: landmark.tourType || "cebu-city",
        });
      } catch (error: any) {
        console.error("Error loading landmark:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load landmark",
          variant: "destructive",
        });
        router.push("/admin/landmarks");
      } finally {
        setFetchingLandmark(false);
      }
    }

    loadLandmark();
  }, [id, router, reset, toast]);

  function processFile(file: File) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.error || "Please check file type and size.",
        variant: "destructive",
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(preview);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
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

    const file = Array.from(e.dataTransfer.files).find(
      f => f.type.startsWith('image/')
    );
    
    if (file) {
      processFile(file);
    }
  }

  function handleQuickUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        processFile(file);
      }
    };
    input.click();
  }

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    const firstError = Object.keys(errors)[0];
    const errorMessage = errors[firstError]?.message || "Please check all required fields";
    toast({
      title: "Validation Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  async function onSubmit(data: LandmarkFormData) {
    const landmarkId = Array.isArray(id) ? id[0] : id;
    if (!landmarkId) return;

    // Ensure at least one image (existing or new)
    if (!existingImage && !imageFile) {
      toast({
        title: "Error",
        description: "Please keep or upload a landmark image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = existingImage || "";

      // Upload new image if provided
      if (imageFile) {
        const newImageUrl = await uploadLandmarkImage(
          imageFile,
          landmarkId,
          (progress) => {
            setUploadProgress(progress);
          }
        );
        finalImageUrl = newImageUrl;
      }

      // Update landmark with processed data
      await updateLandmark(landmarkId, {
        name: data.name,
        description: data.description,
        location: data.location,
        estimatedDuration: data.estimatedDuration,
        image: finalImageUrl,
        category: data.category,
        tourType: data.tourType,
      } as Partial<Landmark>);

      toast({
        title: "Success",
        description: "Landmark updated successfully",
      });

      router.push("/admin/landmarks");
    } catch (error: any) {
      console.error("Error updating landmark:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update landmark",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (fetchingLandmark) {
    return (
      <AdminProtectedRoute>
        <Head>
          <title>Edit Landmark - CebuFlexi Admin</title>
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
        <title>Edit Landmark - CebuFlexi Admin</title>
      </Head>

      <AdminLayout>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/landmarks")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Edit Landmark</h1>
              <p className="text-muted-foreground mt-1">
                Update landmark details
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Landmark
            </Button>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General details about the landmark</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Landmark Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Magellan's Cross"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe the landmark..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
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
                      <SelectItem value="Historical">Historical</SelectItem>
                      <SelectItem value="Religious">Religious</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Nature">Nature</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tourType">Tour Type *</Label>
                  <Select
                    onValueChange={(value) => setValue("tourType", value as any)}
                    value={watch("tourType")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cebu-city">Cebu City</SelectItem>
                      <SelectItem value="mountain">Mountain</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tourType && (
                    <p className="text-sm text-destructive">{errors.tourType.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Estimated Duration (minutes) *</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  {...register("estimatedDuration", { valueAsNumber: true })}
                  placeholder="60"
                />
                {errors.estimatedDuration && (
                  <p className="text-sm text-destructive">{errors.estimatedDuration.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>GPS coordinates for the landmark</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    {...register("location.lat", { valueAsNumber: true })}
                    placeholder="10.3157"
                  />
                  {errors.location?.lat && (
                    <p className="text-sm text-destructive">{errors.location.lat.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    {...register("location.lng", { valueAsNumber: true })}
                    placeholder="123.8854"
                  />
                  {errors.location?.lng && (
                    <p className="text-sm text-destructive">{errors.location.lng.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Landmark Image *</CardTitle>
                  <CardDescription>Upload landmark image (Max 5MB, JPEG/PNG/WebP)</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleQuickUpload}
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
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                {imagePreview ? (
                  <div className="relative group aspect-video max-w-2xl mx-auto">
                    <img
                      src={imagePreview}
                      alt="Landmark preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={() => {
                        if (imageFile) {
                          // Remove new file, show existing
                          setImageFile(null);
                          setImagePreview(existingImage);
                        } else {
                          // Remove existing image
                          setExistingImage(null);
                          setImagePreview(null);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
                        <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                        <p className="text-white text-sm font-medium">{Math.round(uploadProgress)}%</p>
                      </div>
                    )}
                    {uploadProgress === 100 && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Uploaded
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer min-h-[200px] sm:min-h-[300px] touch-manipulation">
                    <Upload className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
                    <span className="text-sm sm:text-base text-muted-foreground text-center px-4 mb-2">
                      {isDragging ? "Drop image here" : "Click or drag image to upload"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Max 5MB · JPEG, PNG, or WebP
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}

