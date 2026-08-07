"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ExternalLinkIcon,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  LibraryIcon,
  LinkIcon,
  PlayIcon,
  Volume2Icon,
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
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

/** A filename reads well for uploads; for embeds/links the host is friendlier. */
function displayName(m: Material): string {
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

/**
 * Renders a teacher's shared materials (`references`) directly inside the LMS:
 * images, video/audio, YouTube/Vimeo, PDFs, Google Drive and Office docs embed
 * inline; anything unembeddable falls back to a link card. Multiple materials get
 * a scrollable tab strip. The whole thing is fluid so it stays usable from phone
 * to desktop — students consume the content in parallel with their teacher.
 */
export function MaterialViewer({
  references,
  className,
  emptyTitle = "Belum ada materi",
  emptyDescription = "Guru belum menambahkan materi untuk bagian ini.",
}: {
  references: string[];
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const materials = useMemo(() => references.map(classifyMaterial), [references]);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  // On open, the reference blocks cascade in with the shared "soft breath" spring;
  // switching materials swaps the frame with the same character. Static when the
  // student prefers reduced motion.
  const item = reduce
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 8, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: SOFT_SPRING },
      };

  if (materials.length === 0) {
    return (
      <EmptyState
        icon={LibraryIcon}
        title={emptyTitle}
        description={emptyDescription}
        compact
      />
    );
  }

  const index = Math.min(active, materials.length - 1);
  const current = materials[index];
  const CurrentIcon = KIND_ICON[current.kind];

  return (
    <motion.div
      className={cn("flex flex-col gap-3", className)}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: STAGGER_STEP } } }}
    >
      {materials.length > 1 ? (
        <motion.div
          variants={item}
          role="group"
          aria-label="Daftar materi"
          className="scrollbar-none -mx-0.5 flex snap-x gap-2 overflow-x-auto px-0.5 pb-1"
        >
          {materials.map((m, i) => {
            const Icon = KIND_ICON[m.kind];
            return (
              <Button
                key={`${m.url}-${i}`}
                type="button"
                aria-pressed={i === index}
                variant={i === index ? "secondary" : "outline"}
                size="sm"
                onPress={() => setActive(i)}
                className="shrink-0 snap-start"
              >
                <Icon aria-hidden="true" />
                <span className="max-w-40 truncate">{displayName(m)}</span>
              </Button>
            );
          })}
        </motion.div>
      ) : null}

      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex min-w-0 items-center gap-2">
          <CurrentIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{displayName(current)}</span>
          <Badge variant="secondary">{materialKindLabel(current.kind)}</Badge>
        </div>
        <LinkButton
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          size="sm"
        >
          <ExternalLinkIcon aria-hidden="true" />
          Buka
        </LinkButton>
      </motion.div>

      <motion.div variants={item}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.99 }}
            transition={SOFT_SPRING}
          >
            <MaterialFrame material={current} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

const FRAME = "overflow-hidden rounded-xl border border-border bg-muted/30";

function MaterialFrame({ material }: { material: Material }) {
  const label = displayName(material);

  switch (material.kind) {
    case "image":
      return (
        <div className={cn(FRAME, "flex items-center justify-center")}>
          {/* Teacher-supplied external URLs; next/image can't optimize arbitrary hosts. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={material.url}
            alt={label}
            className="max-h-[70vh] w-full object-contain"
          />
        </div>
      );

    case "video":
      return (
        <div className={cn(FRAME, "bg-black")}>
          <video src={material.url} controls className="max-h-[70vh] w-full">
            <track kind="captions" />
          </video>
        </div>
      );

    case "audio":
      return (
        <div className={cn(FRAME, "flex items-center bg-card p-4")}>
          <audio src={material.url} controls className="w-full">
            <track kind="captions" />
          </audio>
        </div>
      );

    case "youtube":
    case "vimeo":
      return (
        <div className={cn(FRAME, "bg-black")}>
          <AspectRatio ratio={16 / 9}>
            <iframe
              src={material.embedUrl ?? material.url}
              title={label}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          </AspectRatio>
        </div>
      );

    case "pdf":
    case "drive":
    case "office":
      return (
        <div className={FRAME}>
          <iframe
            src={material.embedUrl ?? material.url}
            title={label}
            loading="lazy"
            allowFullScreen
            className="h-[65vh] min-h-[26rem] w-full border-0 bg-card"
          />
        </div>
      );

    case "link":
      return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <LinkIcon className="size-6" aria-hidden="true" />
          </span>
          <div className="grid gap-1">
            <p className="font-medium">Tautan eksternal</p>
            <p className="mx-auto max-w-sm text-sm break-all text-muted-foreground">
              {material.url}
            </p>
          </div>
          <LinkButton
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
          >
            <ExternalLinkIcon aria-hidden="true" />
            Buka di tab baru
          </LinkButton>
        </div>
      );
  }
}
