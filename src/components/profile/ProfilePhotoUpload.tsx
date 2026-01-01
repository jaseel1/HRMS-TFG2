import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Download, Loader2 } from "lucide-react";

interface ProfilePhotoUploadProps {
  currentUrl: string | null | undefined;
  userId: string;
  onUploadComplete: () => void;
}

export function ProfilePhotoUpload({
  currentUrl,
  userId,
  onUploadComplete,
}: ProfilePhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    onSuccess: () => {
      toast.success("Photo uploaded successfully");
      setPreviewUrl(null);
      onUploadComplete();
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
      setPreviewUrl(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    uploadMutation.mutate(file);
  };

  const handleDownload = () => {
    if (!currentUrl) return;
    
    const link = document.createElement("a");
    link.href = currentUrl;
    link.download = "profile_photo.jpg";
    link.click();
  };

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className="relative group">
      <Avatar className="h-32 w-32">
        <AvatarImage src={displayUrl || undefined} />
        <AvatarFallback className="text-2xl bg-primary/10">
          {uploadMutation.isPending ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <Camera className="h-8 w-8 text-muted-foreground" />
          )}
        </AvatarFallback>
      </Avatar>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload button overlay */}
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Camera className="h-4 w-4 mr-1" />
              Upload
            </>
          )}
        </Button>
      </div>

      {/* Download button */}
      {currentUrl && !uploadMutation.isPending && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}