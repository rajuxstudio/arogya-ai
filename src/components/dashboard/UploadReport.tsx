import { useRef, useState, useEffect, DragEvent, ChangeEvent } from "react";
import { FileUp, FileText, Image as ImageIcon, FileArchive, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type UploadedReport = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: number;
};

const STORAGE_KEY = "arogyaai.reports";
const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED = [".pdf", ".jpg", ".jpeg", ".png", ".dcm", ".dicom"];

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const iconFor = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return FileText;
  if (["jpg", "jpeg", "png"].includes(ext || "")) return ImageIcon;
  return FileArchive;
};

const isAccepted = (name: string) => {
  const lower = name.toLowerCase();
  return ACCEPTED.some((ext) => lower.endsWith(ext));
};

export const UploadReport = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [reports, setReports] = useState<UploadedReport[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setReports(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const persist = (next: UploadedReport[]) => {
    setReports(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const valid: UploadedReport[] = [];

    for (const file of files) {
      if (!isAccepted(file.name)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} — accepted: PDF, JPG, PNG, DICOM`,
          variant: "destructive",
        });
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 20MB limit.`,
          variant: "destructive",
        });
        continue;
      }
      valid.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        uploadedAt: Date.now(),
      });
    }

    if (valid.length === 0) return;

    setUploading(true);
    // Simulate brief processing for nicer UX
    setTimeout(() => {
      persist([...valid, ...reports]);
      setUploading(false);
      toast({
        title: "Report uploaded",
        description: `${valid.length} file${valid.length > 1 ? "s" : ""} ready for AI analysis.`,
      });
    }, 700);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const remove = (id: string) => {
    persist(reports.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-3xl p-5 border-2 border-dashed transition-all cursor-pointer text-center outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
          dragOver
            ? "border-primary bg-primary/15 scale-[1.01]"
            : "border-primary/30 bg-primary/5 hover:bg-primary/10"
        }`}
      >
        <div className="h-10 w-10 mx-auto rounded-xl gradient-primary grid place-items-center mb-2 shadow-[var(--shadow-card)]">
          {uploading ? (
            <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
          ) : (
            <FileUp className="h-5 w-5 text-primary-foreground" />
          )}
        </div>
        <p className="text-xs font-semibold">
          {uploading ? "Processing…" : dragOver ? "Drop to upload" : "Upload Medical Report"}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Click or drag — PDF, JPG, PNG, DICOM up to 20MB
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.dcm,.dicom,application/pdf,image/*"
          className="hidden"
          onChange={onChange}
        />
      </div>

      {reports.length > 0 && (
        <div className="glass-card rounded-3xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-display font-bold">Recent Reports</h4>
            <span className="text-[10px] text-muted-foreground">{reports.length} file{reports.length > 1 ? "s" : ""}</span>
          </div>
          <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {reports.map((r) => {
              const Icon = iconFor(r.name);
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                      {formatSize(r.size)}
                      <span className="text-success inline-flex items-center gap-0.5">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Analyzed
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => remove(r.id)}
                    aria-label={`Remove ${r.name}`}
                    className="h-7 w-7 rounded-lg grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
