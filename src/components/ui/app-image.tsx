import { useState, ReactNode } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type AppImageProps = {
  containerClassName?: string;
  fallback?: React.ReactNode;
  fill?: boolean;
  children?: ReactNode;
} & Omit<ImageProps, "fill">;

export function AppImage({
  containerClassName,
  fallback,
  className,
  fill = false,
  width = 800,
  height = 600,
  onError,
  children,
  ...props
}: AppImageProps) {
  const { alt, ...rest } = props;
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          containerClassName,
          "flex items-center justify-center bg-gray-200 text-gray-400 text-xs"
        )}
      >
        {fallback ?? <span>No Image</span>}
      </div>
    );
  }

  const handleError: NonNullable<ImageProps["onError"]> = (event) => {
    setHasError(true);
    onError?.(event);
  };

  const image = (
    <Image
      {...rest}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      onError={handleError}
      sizes={props.sizes ?? "100vw"}
    />
  );

  if (fill) {
    // Always include 'relative' positioning when fill is true, as it's required for absolutely positioned children
    const containerClasses = containerClassName ? cn("relative", containerClassName) : "relative";
    return (
      <div className={containerClasses}>
        {image}
        {children}
      </div>
    );
  }

  if (containerClassName) {
    return (
      <div className={cn(containerClassName)}>
        {image}
        {children}
      </div>
    );
  }

  return (
    <>
      {image}
      {children}
    </>
  );
}

