import { useEffect, useRef, useState } from "react";
import { Upload, Image as ImageIcon, Video, Copy, Trash2, Check, ExternalLink, Loader2 } from "lucide-react";
import { uploadAndSaveMedia, fetchUserMedia, deleteMediaRecord, type MediaRecord } from "@/lib/cloudinary";
import { useSession } from "@/hooks/use-session";

export function MediaLibrary() {
  const { user } = useSession();
  const [mediaList, setMediaList] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const items = await fetchUserMedia(user?.id);
      setMediaList(items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load media.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      for (const file of Array.from(files)) {
        const saved = await uploadAndSaveMedia(file, user?.id);
        setMediaList((prev) => [saved, ...prev]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setErrorMsg(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMediaRecord(id);
      setMediaList((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not delete media.";
      setErrorMsg(msg);
    }
  };

  const formatBytes = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/20 bg-paper-2/40 px-6 py-12 text-center transition-all duration-300 hover:border-ink hover:bg-paper-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="grid h-14 w-14 place-items-center rounded-full bg-paper shadow-sm transition-transform duration-300 group-hover:scale-110">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-ink" />
          ) : (
            <Upload className="h-6 w-6 text-ink" />
          )}
        </div>
        <p className="mt-4 text-base font-medium text-ink">
          {uploading ? "Uploading to Cloudinary…" : "Click or drag files here to upload"}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          Images (JPG, PNG, WebP, GIF) or Videos (MP4, WebM) • Stored in Cloudinary & logged in Supabase
        </p>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Media Grid */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-ink">
            Uploaded Media ({mediaList.length})
          </h3>
          <button
            onClick={loadMedia}
            disabled={loading}
            className="text-xs text-ink-muted underline underline-offset-4 hover:text-ink"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-square animate-pulse rounded-lg bg-ink/5" />
            ))}
          </div>
        ) : mediaList.length === 0 ? (
          <div className="rounded-xl border border-ink/10 py-16 text-center text-ink-muted">
            <ImageIcon className="mx-auto h-10 w-10 opacity-30" />
            <p className="mt-3 text-sm">No media uploaded yet. Drop a file above to test!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {mediaList.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-ink/10 bg-paper transition-shadow hover:shadow-lg"
              >
                {/* Media Preview */}
                <div className="relative aspect-square w-full overflow-hidden bg-ink/5">
                  {item.resource_type === "video" ? (
                    <div className="grid h-full w-full place-items-center bg-ink/10 text-ink">
                      <Video className="h-10 w-10 opacity-70" />
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.original_filename || "Media asset"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-expo group-hover:scale-105"
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {item.format && (
                      <span className="rounded bg-paper/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink shadow-sm">
                        {item.format}
                      </span>
                    )}
                  </div>

                  {/* Action Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      onClick={() => handleCopy(item.id, item.url)}
                      title="Copy URL"
                      className="grid h-9 w-9 place-items-center rounded-full bg-paper text-ink transition-transform hover:scale-110"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open full size"
                      className="grid h-9 w-9 place-items-center rounded-full bg-paper text-ink transition-transform hover:scale-110"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete record"
                      className="grid h-9 w-9 place-items-center rounded-full bg-paper text-destructive transition-transform hover:scale-110"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="p-2.5 text-xs">
                  <p className="truncate font-medium text-ink">
                    {item.original_filename || item.public_id}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {formatBytes(item.bytes)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
