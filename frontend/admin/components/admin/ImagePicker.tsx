import * as React from "react";
import { Button } from "@/components/ui/button";
import { X, ImagePlus } from "lucide-react";

type Props = {
  label?: string;
  value: string[];
  onChange: (v: string[]) => void;
  maxBytes?: number;
  maxW?: number;
  maxH?: number;
};

async function fileToCompressedDataUrl(file: File, maxW = 1280, maxH = 1280, targetBytes = 900 * 1024) {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    const fr = new FileReader();
    fr.onload = () => {
      i.src = String(fr.result);
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
  const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  let q = 0.85;
  let out = canvas.toDataURL("image/jpeg", q);
  const size = (s: string) => {
    const i = s.indexOf(",");
    return i === -1 ? s.length : Math.floor((s.length - i - 1) * 0.75);
  };
  while (size(out) > targetBytes && q > 0.5) {
    q -= 0.1;
    out = canvas.toDataURL("image/jpeg", q);
  }
  return out;
}

export default function ImagePicker({ label, value, onChange, maxBytes = 900 * 1024, maxW = 1280, maxH = 1280 }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files;
    if (!fl || !fl.length) return;
    const urls: string[] = [];
    for (const f of Array.from(fl)) {
      const u = await fileToCompressedDataUrl(f, maxW, maxH, maxBytes);
      urls.push(u);
    }
    const merged = Array.from(new Set([...value, ...urls]));
    onChange(merged);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (idx: number) => {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {label && <div className="text-sm font-medium">{label}</div>}
      <div className="flex items-center gap-3">
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handlePick} className="hidden" />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="h-4 w-4 mr-2" />
          เพิ่มรูปภาพ
        </Button>
        <div className="text-sm text-gray-500">รองรับหลายไฟล์</div>
      </div>
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((src, i) => (
            <div key={`${src}-${i}`} className="relative rounded overflow-hidden border">
              <img src={src} alt={`img-${i}`} className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 inline-flex items-center justify-center rounded-full bg-white/90 hover:bg-white p-1 shadow"
                aria-label="remove"
              >
                <X className="h-4 w-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
