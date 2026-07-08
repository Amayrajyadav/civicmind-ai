import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { HiMiniPhoto, HiMiniXMark } from "react-icons/hi2";
import { Badge } from "./Badge";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  maxFiles?: number;
}

// Dedicated component to manage Object URL lifecycle and prevent memory leaks
const FilePreviewItem: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => {
  const [previewUrl, setPreviewUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <div className="flex items-center gap-3 min-w-0 pr-4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Thumbnail preview"
            className="h-10 w-10 shrink-0 rounded-lg object-cover border border-brand-line/60 shadow-sm"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-terracotta/5 border border-brand-terracotta/10 text-brand-terracotta text-[10px] font-bold">
            {file.type.includes("pdf") ? "PDF" : "FILE"}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-brand-ink truncate text-xs">{file.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-brand-ink-light/85">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <span className="h-1 w-1 rounded-full bg-brand-line/60" />
            <span className="text-[10px] text-brand-success font-semibold uppercase tracking-wider">
              Ready for submission
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-brand-ink/5 text-brand-ink-light hover:text-brand-ink transition-colors cursor-pointer"
      >
        <HiMiniXMark className="text-lg" />
      </button>
    </div>
  );
};

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  maxFiles = 5,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`rounded-[2rem] border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-brand-terracotta bg-brand-terracotta/5 scale-[0.99]"
            : "border-brand-line/60 bg-white/60 hover:bg-white/80"
        }`}
      >
        <input {...getInputProps()} />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-terracotta/10 text-2xl text-brand-terracotta shadow-sm">
          <HiMiniPhoto />
        </div>
        <p className="mt-4 text-base font-semibold text-brand-ink">
          {isDragActive ? "Drop the files here" : "Drag files here or browse"}
        </p>
        <p className="mt-2 text-xs text-brand-ink-light leading-relaxed">
          Photos, videos, or site documents (JPG, PNG, PDF). Max {maxFiles} files.
        </p>
        
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {["JPG", "PNG", "PDF"].map((item) => (
            <Badge key={item} tone="default">
              {item}
            </Badge>
          ))}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="rounded-[1.5rem] border border-brand-line/40 bg-white/40 p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-ink-light/80 px-1">
            Queued Evidence ({selectedFiles.length})
          </p>
          <div className="divide-y divide-brand-line/20">
            {selectedFiles.map((file, idx) => (
              <FilePreviewItem
                key={idx}
                file={file}
                onRemove={() => onRemoveFile(idx)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
