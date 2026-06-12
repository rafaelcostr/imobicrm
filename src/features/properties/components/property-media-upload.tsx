"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadPropertyMedia, deletePropertyMedia } from "@/actions/properties";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import type { MediaType } from "@prisma/client";

type MediaItem = {
  id: string;
  url: string;
  fileName: string | null;
  type: MediaType;
};

interface PropertyMediaUploadProps {
  propertyId: string;
  media: MediaItem[];
  canEdit: boolean;
  storageConfigured?: boolean;
}

export function PropertyMediaUpload({
  propertyId,
  media,
  canEdit,
  storageConfigured = false,
}: PropertyMediaUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);

    try {
      await uploadPropertyMedia(propertyId, formData);
      toast.success("Arquivo enviado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(mediaId: string) {
    if (!confirm("Remover esta mídia?")) return;

    setDeletingId(mediaId);
    try {
      await deletePropertyMedia(mediaId);
      toast.success("Mídia removida");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover");
    } finally {
      setDeletingId(null);
    }
  }

  const images = media.filter((m) => m.type === "IMAGE");

  return (
    <div className="space-y-4">
      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.fileName ?? "Foto do imóvel"}
                className="aspect-video w-full object-cover"
              />
              {canEdit && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  aria-label="Remover foto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma foto cadastrada.</p>
      )}

      {canEdit && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={handleUpload}
            disabled={!storageConfigured || uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={!storageConfigured || uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Enviando..." : "Enviar foto"}
          </Button>
          {!storageConfigured && (
            <p className="text-xs text-muted-foreground">
              Configure R2/S3 (S3_*) no .env para habilitar upload.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
