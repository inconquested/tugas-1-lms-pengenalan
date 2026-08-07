"use client";

import { useMemo, useState } from "react";
import {
  AnimatePresence,
  Reorder,
  motion,
  useDragControls,
  useReducedMotion,
} from "framer-motion";
import {
  FileIcon,
  FileTextIcon,
  GripVerticalIcon,
  ImageIcon,
  LinkIcon,
  PlayIcon,
  PlusIcon,
  SparklesIcon,
  Volume2Icon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SOFT_SPRING, STAGGER_STEP } from "@/components/app/motion";
import {
  classifyMaterial,
  materialKindLabel,
  type Material,
  type MaterialKind,
} from "@/lib/materials";
import { fileLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type IconType = React.ComponentType<{ className?: string }>;

const KIND_ICON: Record<MaterialKind, IconType> = {
  image: ImageIcon,
  video: PlayIcon,
  youtube: PlayIcon,
  vimeo: PlayIcon,
  audio: Volume2Icon,
  pdf: FileTextIcon,
  drive: FileIcon,
  office: FileTextIcon,
  link: LinkIcon,
};

// The type picker doesn't constrain what's added (every URL is still auto-classified);
// it tailors the dropzone's icon, headline hint and input placeholder so the teacher
// knows what to paste for the kind of material they have in mind.
type PickerId = "auto" | "image" | "video" | "pdf" | "document" | "link";

const PICKERS: {
  id: PickerId;
  label: string;
  icon: IconType;
  hint: string;
  placeholder: string;
}[] = [
  {
    id: "auto",
    label: "Otomatis",
    icon: SparklesIcon,
    hint: "Tempel tautan apa pun — LMS mendeteksi jenisnya otomatis.",
    placeholder: "https://…",
  },
  {
    id: "image",
    label: "Gambar",
    icon: ImageIcon,
    hint: "Tautan gambar (.jpg, .png, .webp) atau dari Google Drive.",
    placeholder: "https://…/diagram.png",
  },
  {
    id: "video",
    label: "Video",
    icon: PlayIcon,
    hint: "Tautan YouTube, Vimeo, atau berkas video (.mp4).",
    placeholder: "https://youtu.be/…",
  },
  {
    id: "pdf",
    label: "PDF",
    icon: FileTextIcon,
    hint: "Tautan berkas PDF atau dari Google Drive.",
    placeholder: "https://…/bab-1.pdf",
  },
  {
    id: "document",
    label: "Dokumen",
    icon: FileIcon,
    hint: "Google Docs/Slides atau Office (.docx, .pptx, .xlsx).",
    placeholder: "https://docs.google.com/…",
  },
  {
    id: "link",
    label: "Tautan",
    icon: LinkIcon,
    hint: "Tautan situs, artikel, atau sumber lainnya.",
    placeholder: "https://…",
  },
];

/** A reference is friendlier shown by host (embeds/links) or filename (uploads). */
function chipTitle(m: Material): string {
  if (
    m.kind === "youtube" ||
    m.kind === "vimeo" ||
    m.kind === "drive" ||
    m.kind === "link"
  ) {
    try {
      return new URL(m.url).hostname.replace(/^www\./, "");
    } catch {
      /* fall through */
    }
  }
  return fileLabel(m.url);
}

/** A pasted string is only accepted if it parses to an http(s) URL with a real host. */
function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(candidate);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Teacher-facing material builder that replaces the plain references textarea. It
 * offers a type picker (contextual hints), a drag-and-drop / paste zone, and a
 * reorderable stack of material chips that glide in with the shared "soft breath"
 * spring. The whole selection is serialized into a hidden `externalReferences`
 * textarea (one URL per line) so the existing server action contract is untouched.
 *
 * No upload backend exists yet, so references are links; dropping an OS file surfaces
 * a hint to paste its share URL instead of storing an un-embeddable filename.
 */
export function MaterialComposer({
  inputId,
  describedBy,
  invalid,
  defaultValue = [],
}: {
  inputId: string;
  describedBy?: string;
  invalid?: boolean;
  defaultValue?: string[];
}) {
  const reduce = useReducedMotion();
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [picker, setPicker] = useState<PickerId>("auto");
  const [draft, setDraft] = useState("");
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const active = PICKERS.find((p) => p.id === picker) ?? PICKERS[0];
  const ActiveIcon = active.icon;

  function add(raw: string) {
    const url = normalizeUrl(raw);
    if (!url) {
      setNotice("Sepertinya itu bukan tautan yang valid.");
      return;
    }
    if (urls.includes(url)) {
      setNotice("Tautan itu sudah ditambahkan.");
      return;
    }
    setUrls((prev) => [...prev, url]);
    setDraft("");
    setNotice(null);
  }

  function remove(url: string) {
    setUrls((prev) => prev.filter((u) => u !== url));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const text =
      e.dataTransfer.getData("text/uri-list") ||
      e.dataTransfer.getData("text/plain");
    if (text.trim()) {
      // A text/uri-list payload may carry several lines; `#` lines are comments.
      text
        .split(/\r?\n/)
        .filter((line) => line.trim() && !line.startsWith("#"))
        .forEach(add);
      return;
    }
    if (e.dataTransfer.files.length > 0) {
      setNotice(
        "Unggah berkas belum tersedia — tempel tautan berkasnya (mis. dari Google Drive).",
      );
    }
  }

  return (
    <div className="grid gap-3">
      <ToggleGroup
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={new Set([picker])}
        onSelectionChange={(keys) => {
          const next = [...keys][0];
          if (typeof next === "string") setPicker(next as PickerId);
        }}
        variant="outline"
        size="sm"
        aria-label="Jenis materi"
        className="w-full flex-wrap"
      >
        {PICKERS.map((p) => {
          const Icon = p.icon;
          return (
            <ToggleGroupItem key={p.id} id={p.id}>
              <Icon aria-hidden="true" />
              {p.label}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          setDragging(false);
        }}
        onDrop={onDrop}
        animate={reduce ? undefined : { scale: dragging ? 1.01 : 1 }}
        transition={SOFT_SPRING}
        data-dragging={dragging || undefined}
        className={cn(
          "grid gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center transition-colors",
          "data-dragging:border-primary data-dragging:bg-primary/5",
        )}
      >
        <div className="flex flex-col items-center gap-1.5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={active.id}
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              transition={SOFT_SPRING}
              className="flex size-10 items-center justify-center rounded-full bg-background text-primary shadow-sm"
            >
              <ActiveIcon className="size-5" aria-hidden="true" />
            </motion.span>
          </AnimatePresence>
          <p className="text-sm font-medium">Seret &amp; lepas tautan ke sini</p>
          <p className="mx-auto max-w-sm text-xs text-muted-foreground">
            {active.hint}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            id={inputId}
            type="url"
            inputMode="url"
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            aria-label="Tautan materi"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(draft);
              }
            }}
            placeholder={active.placeholder}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onPress={() => add(draft)}
            isDisabled={draft.trim().length === 0}
          >
            <PlusIcon aria-hidden="true" />
            Tambah
          </Button>
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {notice ? (
          <motion.p
            key={notice}
            role="status"
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={SOFT_SPRING}
            className="text-xs text-muted-foreground"
          >
            {notice}
          </motion.p>
        ) : null}
      </AnimatePresence>

      {urls.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={urls}
          onReorder={setUrls}
          as="ul"
          className="grid gap-2"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: STAGGER_STEP } } }}
        >
          <AnimatePresence>
            {urls.map((url) => (
              <MaterialChip
                key={url}
                url={url}
                reduce={!!reduce}
                onRemove={() => remove(url)}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      ) : null}

      {/* Serializes to the existing server contract: `lines()` splits on newlines. */}
      <input type="hidden" name="externalReferences" value={urls.join("\n")} />
    </div>
  );
}

function chipVariants(reduce: boolean) {
  if (reduce) {
    return { hidden: { opacity: 1 }, visible: { opacity: 1 } };
  }
  return {
    hidden: { opacity: 0, y: 8, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: SOFT_SPRING },
  };
}

function MaterialChip({
  url,
  reduce,
  onRemove,
}: {
  url: string;
  reduce: boolean;
  onRemove: () => void;
}) {
  const controls = useDragControls();
  const material = useMemo(() => classifyMaterial(url), [url]);
  const Icon = KIND_ICON[material.kind];

  return (
    <Reorder.Item
      value={url}
      dragListener={false}
      dragControls={controls}
      variants={chipVariants(reduce)}
      exit={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.92, transition: { duration: 0.15 } }
      }
      whileDrag={
        reduce
          ? undefined
          : { scale: 1.02, boxShadow: "0 10px 24px -14px oklch(0 0 0 / 0.35)" }
      }
      className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label="Seret untuk mengubah urutan"
        className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
      >
        <GripVerticalIcon className="size-4" aria-hidden="true" />
      </button>
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
        aria-label={materialKindLabel(material.kind)}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="grid min-w-0 flex-1 text-left">
        <span className="truncate text-sm font-medium">{chipTitle(material)}</span>
        <span className="truncate text-xs text-muted-foreground">{url}</span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onPress={onRemove}
        aria-label={`Hapus ${chipTitle(material)}`}
      >
        <XIcon aria-hidden="true" />
      </Button>
    </Reorder.Item>
  );
}
