import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { User, Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

interface ProfileDialogProps {
  user: Omit<UserType, 'password'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Function to compress and resize image
async function compressImage(file: File, maxSize: number = 150): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // Calculate dimensions maintaining square ratio (centered crop)
        const size = Math.min(img.width, img.height);
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        
        canvas.width = maxSize;
        canvas.height = maxSize;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process image"));
          return;
        }
        
        // Draw cropped and resized image
        ctx.drawImage(
          img,
          offsetX, offsetY,
          size, size,
          0, 0,
          maxSize, maxSize
        );
        
        // Convert to JPEG with 80% quality
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        resolve(base64);
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function ProfileDialog({ user, open, onOpenChange }: ProfileDialogProps) {
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");
  const [displayName, setDisplayName] = useState(user.displayName || user.username);
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || "");
  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to translate technical errors to user-friendly messages
  const getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes("413") || message.includes("too large") || message.includes("payload")) {
      return t("profile.error.imageTooLarge");
    }
    if (message.includes("401") || message.includes("unauthorized") || message.includes("authentication")) {
      return t("profile.error.sessionExpired");
    }
    if (message.includes("400") || message.includes("invalid")) {
      return t("profile.error.invalidData");
    }
    if (message.includes("500") || message.includes("server")) {
      return t("profile.error.serverError");
    }
    if (message.includes("network") || message.includes("fetch")) {
      return t("profile.error.connectionError");
    }
    
    return t("profile.error.generic");
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setDisplayName(user.displayName || user.username);
      setAvatarPreview(user.avatarUrl || "");
      setAvatarFile(null);
    }
  }, [open, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { displayName?: string; avatarUrl?: string | null }) => {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      
      toast({
        title: t("profile.success.title"),
        description: t("profile.success.description"),
      });
      
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("profile.error.title"),
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("profile.error.title"),
        description: t("profile.error.invalidFile"),
        variant: "destructive",
      });
      return;
    }

    // Validate size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("profile.error.title"),
        description: t("profile.error.fileTooLarge"),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Compress and resize image to 150x150px
      const compressedImage = await compressImage(file, 150);
      setAvatarPreview(compressedImage);
      setAvatarFile(compressedImage);
    } catch (error) {
      toast({
        title: t("profile.error.title"),
        description: t("profile.error.processingError"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAvatarClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const handleRemovePhoto = () => {
    setAvatarPreview("");
    setAvatarFile("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    const avatarUrl = avatarFile !== null ? (avatarFile || null) : (avatarPreview || null);
    
    updateProfileMutation.mutate({
      displayName: displayName.trim() || undefined,
      avatarUrl,
    });
  };

  const initials = (displayName || user.username)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("profile.title")}
          </DialogTitle>
          <DialogDescription>
            {t("profile.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isProcessing}
              className="relative group cursor-pointer disabled:cursor-wait"
            >
              <Avatar className="h-24 w-24 transition-opacity group-hover:opacity-75">
                {avatarPreview && (
                  <AvatarImage 
                    src={avatarPreview} 
                    alt={displayName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Overlay with camera icon */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {isProcessing ? (
                  <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
              </div>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {isProcessing ? t("profile.avatar.processing") : t("profile.avatar.clickToChange")}
              </span>
              {avatarPreview && !isProcessing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePhoto}
                  className="text-destructive hover:text-destructive h-auto py-1 px-2"
                >
                  {t("profile.avatar.remove")}
                </Button>
              )}
            </div>
          </div>

          {/* Display Name */}
          <div className="grid gap-2">
            <Label htmlFor="displayName">{t("profile.displayName")}</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("profile.displayNamePlaceholder")}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {t("profile.displayNameHint")}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateProfileMutation.isPending || isProcessing}
          >
            {tCommon("buttons.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending || isProcessing}
          >
            {updateProfileMutation.isPending ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                {tCommon("buttons.saving")}
              </>
            ) : (
              tCommon("buttons.save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
