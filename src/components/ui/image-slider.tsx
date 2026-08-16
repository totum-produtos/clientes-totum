"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface SliderImage {
  src: string;
  alt?: string;
}

interface ImageSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  images: SliderImage[];
  interval?: number;
  overlayText?: string;
}

const ImageSlider = React.forwardRef<HTMLDivElement, ImageSliderProps>(
  ({ images, interval = 4000, overlayText, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useEffect(() => {
      if (images.length <= 1) return;
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }, interval);
      return () => clearInterval(timer);
    }, [images.length, interval]);

    return (
      <div
        ref={ref}
        className={cn("relative h-full w-full overflow-hidden bg-canvas", className)}
        {...props}
      >
        {images.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt ?? `Slide ${index + 1}`}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 50vw, 0px"
            className={cn(
              "object-cover transition-opacity duration-[900ms] ease-in-out",
              index === currentIndex ? "opacity-100" : "opacity-0"
            )}
          />
        ))}

        {/* Véu escuro — garante contraste do texto sobre imagens claras */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas from-5% via-canvas/60 via-45% to-transparent" />

        {overlayText ? (
          <p className="absolute bottom-16 left-8 right-8 text-[20px] font-light leading-[1.25] text-white-soft">
            {overlayText}
          </p>
        ) : null}

        <div className="absolute bottom-6 left-8 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                currentIndex === index ? "w-8 bg-rausch" : "w-1.5 bg-white/25 hover:bg-white/50"
              )}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }
);
ImageSlider.displayName = "ImageSlider";

export { ImageSlider };
