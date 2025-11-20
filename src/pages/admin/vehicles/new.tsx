import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminProtectedRoute } from "@/components/Auth/AdminProtectedRoute";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { vehicleSchema, VehicleFormData } from "@/lib/validation/vehicleSchema";
import { createVehicle } from "@/services/admin/vehicleService";
import { uploadVehicleImage, validateImageFile } from "@/lib/admin/imageUpload";
import type { Vehicle } from "@/types";

export default function AdminNewVehiclePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: "",
      type: "Sedan",
      pricePerDay: 0,
      capacity: 4,
      transmission: "Automatic",
      fuelType: "Gasoline",
      withDriver: false,
      luggage: 2,
      features: [""],
      available: true,
      stockCount: 1,
    },
  });

  const features = watch("features");

  const addFeature = () => {
    const current = features ?? [];
    setValue("features", [...current, ""], { shouldDirty: true, shouldTouch: true });
  };

  const removeFeature = (index: number) => {
    const current = features ?? [];
    if (current.length <= 1) {
      return;
    }
    const next = current.filter((_, i) => i !== index);
    setValue("features", next, { shouldDirty: true, shouldTouch: true });
  };

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

  async function onSubmit(data: VehicleFormData) {
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please upload a vehicle image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create temp ID for image upload
      const tempVehicleId = `temp-${Date.now()}`;
      
      // Upload image
      const imageUrl = await uploadVehicleImage(
        imageFile,
        tempVehicleId,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Filter out empty features
      const processedFeatures = (data.features || []).filter(f => f.trim().length > 0);
      
      if (processedFeatures.length === 0) {
        throw new Error("At least one feature is required");
      }

      // Create vehicle with uploaded image URL
      const vehicleData: Omit<Vehicle, "id"> = {
        name: data.name,
        type: data.type,
        image: imageUrl,
        pricePerDay: data.pricePerDay,
        capacity: data.capacity,
        transmission: data.transmission,
        fuelType: data.fuelType,
        withDriver: data.withDriver,
        luggage: data.luggage,
        features: processedFeatures,
        available: data.available,
        stockCount: data.stockCount,
      };

      const vehicleId = await createVehicle(vehicleData);

      toast({
        title: "Success",
        description: "Vehicle created successfully",
      });

      router.push("/admin/vehicles");
    } catch (error: any) {
      console.error("Error creating vehicle:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create vehicle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminProtectedRoute>
      <Head>
        <title>New Vehicle - CebuFlexi Admin</title>
      </Head>

      <AdminLayout>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/vehicles")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Create New Vehicle</h1>
              <p className="text-muted-foreground mt-1">
                Add a new vehicle to your rental fleet
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Vehicle
            </Button>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General details about the vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vehicle Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Toyota Vios"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Vehicle Type *</Label>
                  <Select
                    onValueChange={(value) => setValue("type", value as any)}
                    value={watch("type")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive">{errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerDay">Price Per Day (₱) *</Label>
                  <Input
                    id="pricePerDay"
                    type="number"
                    {...register("pricePerDay", { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.pricePerDay && (
                    <p className="text-sm text-destructive">{errors.pricePerDay.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (seats) *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    {...register("capacity", { valueAsNumber: true })}
                    placeholder="4"
                  />
                  {errors.capacity && (
                    <p className="text-sm text-destructive">{errors.capacity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="luggage">Luggage Capacity *</Label>
                  <Input
                    id="luggage"
                    type="number"
                    {...register("luggage", { valueAsNumber: true })}
                    placeholder="2"
                  />
                  {errors.luggage && (
                    <p className="text-sm text-destructive">{errors.luggage.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmission *</Label>
                  <Select
                    onValueChange={(value) => setValue("transmission", value as any)}
                    value={watch("transmission")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.transmission && (
                    <p className="text-sm text-destructive">{errors.transmission.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type *</Label>
                  <Select
                    onValueChange={(value) => setValue("fuelType", value as any)}
                    value={watch("fuelType")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gasoline">Gasoline</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.fuelType && (
                    <p className="text-sm text-destructive">{errors.fuelType.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>With Driver</Label>
                  <p className="text-sm text-muted-foreground">
                    Include driver in rental package
                  </p>
                </div>
                <Switch
                  onCheckedChange={(checked) => setValue("withDriver", checked)}
                  checked={watch("withDriver")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Vehicle Image *</CardTitle>
                  <CardDescription>Upload vehicle image (Max 5MB, JPEG/PNG/WebP)</CardDescription>
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
                      alt="Vehicle preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
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

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features *</CardTitle>
              <CardDescription>List vehicle features and amenities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(features ?? []).map((_, index) => (
                <div key={`feature-${index}`} className="flex gap-2">
                  <Input
                    {...register(`features.${index}`)}
                    placeholder="e.g., Air Conditioning, GPS"
                  />
                  {(features?.length ?? 0) > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </CardContent>
          </Card>

          {/* Availability & Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Availability & Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stockCount">Stock Count *</Label>
                <Input
                  id="stockCount"
                  type="number"
                  {...register("stockCount", { valueAsNumber: true })}
                  placeholder="1"
                />
                {errors.stockCount && (
                  <p className="text-sm text-destructive">{errors.stockCount.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Available for Rental</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this vehicle visible and available for booking
                  </p>
                </div>
                <Switch
                  onCheckedChange={(checked) => setValue("available", checked)}
                  checked={watch("available")}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}

