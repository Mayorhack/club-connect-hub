import { FormEvent, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, ImagePlus, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMemoryToCloudinary } from "@/lib/cloudinary";
import { createMemory, deleteMemory, getMemories } from "@/lib/storage";
import { useAuth } from "@/lib/auth";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export default function Memories() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uploadRef = useRef<HTMLElement>(null);

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ["memories"],
    queryFn: getMemories,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) pickFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  }

  function clearSelection() {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please choose a photo first.");
      return;
    }
    setUploading(true);
    try {
      const imageUrl = await uploadMemoryToCloudinary(selectedFile);
      await createMemory({
        imageUrl,
        caption: caption.trim() || undefined,
        uploaderName: uploaderName.trim() || undefined,
      });
      toast.success("Memory shared!");
      clearSelection();
      setUploaderName("");
      setCaption("");
      await qc.invalidateQueries({ queryKey: ["memories"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this memory?")) return;
    try {
      await deleteMemory(id);
      toast.success("Memory removed.");
      await qc.invalidateQueries({ queryKey: ["memories"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Layout>
      {/* ── Cinematic hero ──────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-black py-24 text-center select-none">
        {/* Decorative blur orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute top-8 right-1/3 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative z-10 container flex flex-col items-center">
          <div
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg shadow-primary/30"
            style={{ background: "var(--gradient-pitch)" }}
          >
            <Camera className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-pitch)" }}
            >
              My PIE Cup
            </span>
            <br />
            <span className="text-white">Memories</span>
          </h1>

          <p className="mt-4 max-w-sm text-white/55 text-sm sm:text-base leading-relaxed">
            Capture the moments. Share the magic.
            <br />
            Relive the tournament forever.
          </p>

          <button
            type="button"
            onClick={() =>
              uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition-all"
            style={{ background: "var(--gradient-pitch)" }}
          >
            <Sparkles className="h-4 w-4" />
            Share a Memory
          </button>

          {memories.length > 0 && (
            <p className="mt-5 text-xs text-white/30 tracking-wide">
              {memories.length} memor{memories.length === 1 ? "y" : "ies"} shared so far
            </p>
          )}
        </div>
      </div>

      <div className="container py-12 space-y-14">
        {/* ── Upload form ─────────────────────────────────────────── */}
        <section
          ref={uploadRef}
          className="relative rounded-2xl border border-border bg-card overflow-hidden max-w-xl mx-auto shadow-xl"
        >
          {/* Top gradient accent bar */}
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: "var(--gradient-pitch)" }}
          />

          <div className="p-6 pt-7">
            <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              Upload a Photo
            </h2>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-border shadow-inner">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-72 object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="absolute top-2 right-2 rounded-full bg-black/70 text-white p-1.5 hover:bg-black/90 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border hover:border-primary/50 hover:bg-muted/20"
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">
                      Drop a photo here or{" "}
                      <span className="text-primary underline-offset-2 hover:underline">
                        browse
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WebP · max 10 MB
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Your name (optional)
                  </Label>
                  <Input
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    placeholder="e.g. Tunde Adeyemi"
                    maxLength={80}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Caption (optional)
                  </Label>
                  <Input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. What a goal!"
                    maxLength={200}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-bold hover:opacity-90 active:scale-[0.98] transition-all"
                disabled={uploading || !selectedFile}
              >
                {uploading ? "Uploading…" : "Share memory"}
              </Button>
            </form>
          </div>
        </section>

        {/* ── Gallery ─────────────────────────────────────────────── */}
        <section>
          {memories.length > 0 && (
            <div className="flex items-center gap-3 mb-8">
              <h2 className="font-bold text-xl">All Memories</h2>
              <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5">
                {memories.length}
              </span>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-muted animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoading && memories.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Camera className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">No memories yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to share a moment from the PIE Cup!
                </p>
              </div>
            </div>
          )}

          {memories.length > 0 && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="break-inside-avoid rounded-2xl overflow-hidden shadow-md group cursor-default"
                >
                  <div className="relative">
                    <img
                      src={memory.imageUrl}
                      alt={memory.caption ?? "PIE Cup memory"}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-0.5">
                      {memory.caption && (
                        <p className="text-white text-sm font-medium leading-snug">
                          {memory.caption}
                        </p>
                      )}
                      <p className="text-white/60 text-xs">
                        {memory.uploaderName ? `📸 ${memory.uploaderName} · ` : ""}
                        {timeAgo(memory.createdAt)}
                      </p>
                    </div>

                    {/* Time badge (always visible when no overlay) */}
                    <div className="absolute bottom-2 right-2 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] text-white/80 group-hover:opacity-0 transition-opacity">
                      {timeAgo(memory.createdAt)}
                    </div>

                    {user?.role === "super" && (
                      <button
                        type="button"
                        onClick={() => void handleDelete(memory.id)}
                        className="absolute top-2 right-2 rounded-full bg-black/60 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
