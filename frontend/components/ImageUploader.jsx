"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { RingLoader } from "react-spinners";

export default function ImageUploader({ onImageSelect, loading }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Pass file to parent
      onImageSelect(file);
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
    noClick: true,
    noKeyboard: true,
  });

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onDrop([file]);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Preview Mode
  if (preview) {
    return (
      <div className="relative w-full aspect-video bg-stone-100 rounded-2xl overflow-hidden border-2 border-stone-200">
        <Image
          src={preview}
          alt="Pantry preview"
          fill
          className="object-cover"
        />
        {!loading && (
          <button
            onClick={clearImage}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
          >
            <X className="w-5 h-5 text-stone-700" />
          </button>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <RingLoader color="white" />
          </div>
        )}
      </div>
    );
  }

  // Upload Mode
  return (
    <>
      <div
        {...getRootProps()}
        className={`relative w-full aspect-square border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
          isDragActive
            ? "border-orange-600 bg-orange-50 scale-[1.02]"
            : "border-stone-300 bg-stone-50 hover:border-orange-400 hover:bg-orange-50/50"
        }`}
      >
        <input {...getInputProps()} />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
          {/* Icon */}
          <div
            className={`p-4 rounded-full transition-all ${
              isDragActive ? "bg-orange-600 scale-110" : "bg-orange-100"
            }`}
          >
            {isDragActive ? (
              <ImageIcon className="w-8 h-8 text-white" />
            ) : (
              <Camera className="w-8 h-8 text-orange-600" />
            )}
          </div>

          {/* Text */}
          <div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">
              {isDragActive ? "Drop your image here" : "Scan Your Pantry"}
            </h3>
            <p className="text-stone-600 text-sm max-w-sm">
              {isDragActive
                ? "Release to upload"
                : "Take a photo or drag & drop an image of your fridge/pantry"}
            </p>
          </div>

          {/* Buttons */}
          {!isDragActive && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Camera/File Button - Works on both mobile & desktop */}
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </Button>

              {/* Upload Button - Opens file browser */}
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 gap-2"
              >
                <Upload className="w-4 h-4" />
                Browse Files
              </Button>
            </div>
          )}

          {/* Helper Text */}
          <p className="text-xs text-stone-400">
            Supports JPG, PNG, WebP • Max 10MB
          </p>
        </div>
      </div>

      {/* Hidden file input with capture attribute for mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </>
  );
}