import { describe, test, expect } from "bun:test";
import {
  classifyMaterial,
  materialKindLabel,
  youTubeId,
  vimeoId,
  driveFileId,
} from "@/lib/materials";

describe("materials.classifyMaterial", () => {
  test("images are detected by extension, ignoring the query string", () => {
    const m = classifyMaterial("https://cdn.example.com/diagram.PNG?token=abc");
    expect(m.kind).toBe("image");
    expect(m.embedUrl).toBe("https://cdn.example.com/diagram.PNG?token=abc");
  });

  test("video, audio, and pdf files map to inline-embeddable kinds", () => {
    expect(classifyMaterial("https://x.test/lesson.mp4").kind).toBe("video");
    expect(classifyMaterial("https://x.test/song.mp3").kind).toBe("audio");
    expect(classifyMaterial("https://x.test/bab-1.pdf").kind).toBe("pdf");
  });

  test("office documents embed via the Office Online viewer", () => {
    const m = classifyMaterial("https://x.test/materi.docx");
    expect(m.kind).toBe("office");
    expect(m.embedUrl).toBe(
      "https://view.officeapps.live.com/op/embed.aspx?src=" +
        encodeURIComponent("https://x.test/materi.docx"),
    );
  });

  test("YouTube links (watch / youtu.be / shorts) become /embed URLs", () => {
    expect(classifyMaterial("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      kind: "youtube",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    });
    expect(classifyMaterial("https://youtu.be/abc123").embedUrl).toBe(
      "https://www.youtube.com/embed/abc123",
    );
    expect(classifyMaterial("https://youtube.com/shorts/xyz789").embedUrl).toBe(
      "https://www.youtube.com/embed/xyz789",
    );
  });

  test("Vimeo links become player embed URLs", () => {
    const m = classifyMaterial("https://vimeo.com/76979871");
    expect(m.kind).toBe("vimeo");
    expect(m.embedUrl).toBe("https://player.vimeo.com/video/76979871");
  });

  test("Google Drive file links become /preview embeds", () => {
    const m = classifyMaterial("https://drive.google.com/file/d/1AbCdEf/view?usp=sharing");
    expect(m.kind).toBe("drive");
    expect(m.embedUrl).toBe("https://drive.google.com/file/d/1AbCdEf/preview");
  });

  test("Google Docs links rewrite /edit to /preview", () => {
    const m = classifyMaterial("https://docs.google.com/document/d/1XyZ/edit?usp=sharing");
    expect(m.kind).toBe("drive");
    expect(m.embedUrl).toBe("https://docs.google.com/document/d/1XyZ/preview");
  });

  test("unknown/unembeddable URLs fall back to a link card", () => {
    const m = classifyMaterial("https://en.wikipedia.org/wiki/Algebra");
    expect(m.kind).toBe("link");
    expect(m.embedUrl).toBeNull();
  });

  test("edge: a non-URL string never throws and degrades to a link", () => {
    const m = classifyMaterial("not a url");
    expect(m.kind).toBe("link");
    expect(m.embedUrl).toBeNull();
  });
});

describe("materials id extractors", () => {
  test("youTubeId handles every common form; null for non-YouTube", () => {
    expect(youTubeId("https://www.youtube.com/watch?v=ID12345")).toBe("ID12345");
    expect(youTubeId("https://youtu.be/ID12345?t=30")).toBe("ID12345");
    expect(youTubeId("https://www.youtube.com/embed/ID12345")).toBe("ID12345");
    expect(youTubeId("https://vimeo.com/123")).toBeNull();
  });

  test("vimeoId and driveFileId extract ids, null otherwise", () => {
    expect(vimeoId("https://vimeo.com/76979871")).toBe("76979871");
    expect(vimeoId("https://youtu.be/x")).toBeNull();
    expect(driveFileId("https://drive.google.com/file/d/FILEID/view")).toBe("FILEID");
    expect(driveFileId("https://drive.google.com/open?id=FILEID2")).toBe("FILEID2");
    expect(driveFileId("https://example.com/file/d/x")).toBeNull();
  });
});

describe("materials.materialKindLabel", () => {
  test("every kind maps to an Indonesian label", () => {
    expect(materialKindLabel("image")).toBe("Gambar");
    expect(materialKindLabel("pdf")).toBe("PDF");
    expect(materialKindLabel("youtube")).toBe("Video");
    expect(materialKindLabel("drive")).toBe("Google Drive");
    expect(materialKindLabel("link")).toBe("Tautan");
  });
});
