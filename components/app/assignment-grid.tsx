"use client";

import { useMemo, useState } from "react";
import { ArrowUpDownIcon, FileTextIcon, SearchIcon } from "lucide-react";
import {
  AssignmentCard,
  type AssignmentCardData,
} from "@/components/app/assignment-card";
import { EmptyState } from "@/components/app/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortKey = "due-asc" | "due-desc" | "title" | "submissions";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "due-asc", label: "Tenggat terdekat" },
  { id: "due-desc", label: "Tenggat terjauh" },
  { id: "title", label: "Judul (A–Z)" },
  { id: "submissions", label: "Pengumpulan terbanyak" },
];

function dueMs(dueDate: string | null, fallback: number): number {
  return dueDate ? new Date(dueDate).getTime() : fallback;
}

function refine(
  list: AssignmentCardData[],
  query: string,
  sort: SortKey,
): AssignmentCardData[] {
  const filtered = query
    ? list.filter((a) => a.title.toLowerCase().includes(query))
    : list;
  const sorted = [...filtered];
  switch (sort) {
    case "due-asc":
      // Deadline-less tasks sink to the bottom of an ascending sort.
      return sorted.sort((a, b) => dueMs(a.dueDate, Infinity) - dueMs(b.dueDate, Infinity));
    case "due-desc":
      return sorted.sort((a, b) => dueMs(b.dueDate, -Infinity) - dueMs(a.dueDate, -Infinity));
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "id"));
    case "submissions":
      return sorted.sort((a, b) => b.submissionCount - a.submissionCount);
  }
}

function Grid({
  items,
  classSubjectId,
  nowMs,
}: {
  items: AssignmentCardData[];
  classSubjectId: string;
  nowMs: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => (
        <AssignmentCard
          key={a.id}
          data={a}
          classSubjectId={classSubjectId}
          nowMs={nowMs}
        />
      ))}
    </div>
  );
}

export function AssignmentGrid({
  active,
  archived,
  classSubjectId,
  nowMs,
}: {
  active: AssignmentCardData[];
  archived: AssignmentCardData[];
  classSubjectId: string;
  nowMs: number;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("due-asc");

  const q = query.trim().toLowerCase();
  const activeView = useMemo(() => refine(active, q, sort), [active, q, sort]);
  const archivedView = useMemo(() => refine(archived, q, sort), [archived, q, sort]);

  const sortLabel = SORTS.find((s) => s.id === sort)?.label ?? "";
  const noResults = q.length > 0 && activeView.length === 0 && archivedView.length === 0;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul tugas..."
            aria-label="Cari tugas"
            className="h-9 pl-9"
          />
        </div>
        <DropdownMenuTrigger>
          <Button variant="outline" className="h-9 justify-start sm:w-60">
            <ArrowUpDownIcon aria-hidden="true" />
            <span className="text-muted-foreground">Urutkan:</span>
            {sortLabel}
          </Button>
          <DropdownMenu
            placement="bottom end"
            selectionMode="single"
            selectedKeys={[sort]}
            disallowEmptySelection
            onSelectionChange={(keys) => {
              const next = [...keys][0];
              if (typeof next === "string") setSort(next as SortKey);
            }}
            className="min-w-60"
          >
            {SORTS.map((s) => (
              <DropdownMenuItem key={s.id} id={s.id}>
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        </DropdownMenuTrigger>
      </div>

      {noResults ? (
        <EmptyState
          icon={FileTextIcon}
          title="Tidak ada hasil"
          description={`Tidak ada tugas yang cocok dengan "${query}".`}
          compact
        />
      ) : (
        <>
          <section className="grid gap-3">
            <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
              Aktif
            </h2>
            {activeView.length === 0 ? (
              <EmptyState
                icon={FileTextIcon}
                title={q ? "Tidak ada hasil" : "Tidak ada tugas aktif"}
                description={
                  q
                    ? "Coba kata kunci lain."
                    : "Semua tugas sudah melewati batas waktu."
                }
                compact
              />
            ) : (
              <Grid items={activeView} classSubjectId={classSubjectId} nowMs={nowMs} />
            )}
          </section>

          {archived.length > 0 ? (
            <section className="grid gap-3">
              <h2 className="font-[family-name:var(--font-serif)] text-lg font-semibold">
                Arsip
              </h2>
              {archivedView.length === 0 ? (
                <EmptyState
                  icon={FileTextIcon}
                  title="Tidak ada hasil"
                  description="Coba kata kunci lain."
                  compact
                />
              ) : (
                <Grid
                  items={archivedView}
                  classSubjectId={classSubjectId}
                  nowMs={nowMs}
                />
              )}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
