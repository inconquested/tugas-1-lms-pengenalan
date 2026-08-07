// Classifies a teacher-provided material URL so the in-app viewer can render it
// inline (image, video, PDF, embeds) instead of only linking out. Pure and
// framework-free so it can be unit-tested and shared by any client viewer.

export type MaterialKind =
  | "image"
  | "video"
  | "audio"
  | "youtube"
  | "vimeo"
  | "pdf"
  | "drive"
  | "office"
  | "link";

export type Material = {
  /** Original URL as entered by the teacher. */
  url: string;
  kind: MaterialKind;
  /** URL to feed an <iframe>/<img>/<video>; null when the kind can't embed. */
  embedUrl: string | null;
};

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)$/i;
const VIDEO_EXT = /\.(mp4|webm|ogv|mov|m4v)$/i;
const AUDIO_EXT = /\.(mp3|wav|ogg|oga|m4a|aac|flac)$/i;
const OFFICE_EXT = /\.(docx?|pptx?|xlsx?)$/i;

/** Path with query + hash stripped — extension checks run against this. */
function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split(/[?#]/)[0] ?? url;
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/** YouTube video id from watch/shorts/embed/live/youtu.be forms; null otherwise. */
export function youTubeId(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "youtu.be") return u.pathname.slice(1) || null;
  if (host === "youtube.com" || host === "m.youtube.com") {
    if (u.pathname === "/watch") return u.searchParams.get("v");
    const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
    if (m) return m[1];
  }
  return null;
}

/** Vimeo numeric id from a vimeo.com/{id} or player link; null otherwise. */
export function vimeoId(url: string): string | null {
  const host = hostOf(url);
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
  const m = pathOf(url).match(/\/(\d+)/);
  return m ? m[1] : null;
}

/** Google Drive file id from a /file/d/{id} path or ?id= share link. */
export function driveFileId(url: string): string | null {
  if (hostOf(url) !== "drive.google.com") return null;
  const m = pathOf(url).match(/\/file\/d\/([^/]+)/);
  if (m) return m[1];
  try {
    return new URL(url).searchParams.get("id");
  } catch {
    return null;
  }
}

export function classifyMaterial(url: string): Material {
  const path = pathOf(url);
  const host = hostOf(url);

  const yt = youTubeId(url);
  if (yt) {
    return { url, kind: "youtube", embedUrl: `https://www.youtube.com/embed/${yt}` };
  }

  const vim = vimeoId(url);
  if (vim) {
    return { url, kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${vim}` };
  }

  const drive = driveFileId(url);
  if (drive) {
    return { url, kind: "drive", embedUrl: `https://drive.google.com/file/d/${drive}/preview` };
  }

  // Google Docs/Sheets/Slides embed cleanly via their /preview path.
  if (host === "docs.google.com") {
    return { url, kind: "drive", embedUrl: url.replace(/\/(edit|view|preview)?(\?[^#]*)?(#.*)?$/, "/preview") };
  }

  if (IMAGE_EXT.test(path)) return { url, kind: "image", embedUrl: url };
  if (VIDEO_EXT.test(path)) return { url, kind: "video", embedUrl: url };
  if (AUDIO_EXT.test(path)) return { url, kind: "audio", embedUrl: url };
  if (/\.pdf$/i.test(path)) return { url, kind: "pdf", embedUrl: url };
  if (OFFICE_EXT.test(path)) {
    return {
      url,
      kind: "office",
      embedUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`,
    };
  }

  // Anything else can't be safely framed (X-Frame-Options): show a link card.
  return { url, kind: "link", embedUrl: null };
}

const KIND_LABEL: Record<MaterialKind, string> = {
  image: "Gambar",
  video: "Video",
  audio: "Audio",
  youtube: "Video",
  vimeo: "Video",
  pdf: "PDF",
  drive: "Google Drive",
  office: "Dokumen",
  link: "Tautan",
};

/** Indonesian label for a material kind, used on the viewer's type badge. */
export function materialKindLabel(kind: MaterialKind): string {
  return KIND_LABEL[kind];
}
