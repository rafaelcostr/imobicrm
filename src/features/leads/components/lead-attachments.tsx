"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { deleteLeadAttachment, uploadLeadAttachment } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

type AttachmentItem = {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  size: number | null;
  createdAt: Date;
};

export function LeadAttachments({
  leadId,
  attachments,
  canEdit,
}: {
  leadId: string;
  attachments: AttachmentItem[];
  canEdit: boolean;
}) {
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
      await uploadLeadAttachment(leadId, formData);
      toast.success("Anexo enviado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(attachmentId: string) {
    if (!confirm("Remover este anexo?")) return;

    setDeletingId(attachmentId);
    try {
      await deleteLeadAttachment(attachmentId);
      toast.success("Anexo removido");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover");
    } finally {
      setDeletingId(null);
    }
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-4">
      {attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((item) => {
            const isImage = item.mimeType?.startsWith("image/");
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.fileUrl}
                      alt={item.fileName}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm font-medium text-primary hover:underline"
                    >
                      {item.fileName}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(item.createdAt)}
                      {item.size ? ` · ${formatSize(item.size)}` : ""}
                    </p>
                  </div>
                </div>
                {canEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    aria-label="Remover anexo"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum anexo cadastrado.</p>
      )}

      {canEdit && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Enviando..." : "Enviar anexo"}
          </Button>
          <p className="text-xs text-muted-foreground">JPEG, PNG, WebP ou PDF (máx. 10 MB)</p>
        </div>
      )}
    </div>
  );
}
