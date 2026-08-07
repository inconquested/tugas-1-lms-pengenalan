"use client";

import Link from "next/link";
import {
  BookOpenIcon,
  ChevronDownIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/app/copy-button";
import { JoinCode } from "@/components/app/join-code";
import { UserAvatar } from "@/components/app/user-avatar";

type TeacherLite = { name: string; email: string; avatar?: string };

type SubjectSlot = {
  id: string;
  subjectName: string;
  teacher: TeacherLite | null;
  teacherJoinCode: string | null;
};

export type ClassCardData = {
  id: string;
  name: string;
  href: string;
  studentJoinCode: string | null;
  studentCount: number;
  subjectCount: number;
  homeroom: TeacherLite | null;
  subjects: SubjectSlot[];
};

function buildSummary(data: ClassCardData): string {
  const lines = [`Kelas: ${data.name}`];
  lines.push(
    `Wali kelas: ${
      data.homeroom
        ? `${data.homeroom.name} <${data.homeroom.email}>`
        : "belum ada"
    }`,
  );
  for (const s of data.subjects) {
    lines.push(
      `${s.subjectName}: ${
        s.teacher
          ? `${s.teacher.name} <${s.teacher.email}>`
          : `belum ada (kode ${s.teacherJoinCode ?? "-"})`
      }`,
    );
  }
  return lines.join("\n");
}

/** One teacher slot inside the roster: a claimed teacher shows a copyable email;
 *  an empty slot surfaces the join code so an admin can hand it off in one copy. */
function TeacherRow({
  label,
  teacher,
  joinCode,
}: {
  label: string;
  teacher: TeacherLite | null;
  joinCode: string | null;
}) {
  return (
    <li className="flex items-center gap-2.5 py-1.5">
      {teacher ? (
        <UserAvatar name={teacher.name} src={teacher.avatar} size="sm" />
      ) : (
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          <TicketIcon className="size-4" />
        </span>
      )}
      <div className="grid min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">
            {teacher ? teacher.name : "Belum ditugaskan"}
          </span>
          <Badge variant="outline" className="shrink-0 text-[0.6875rem]">
            {label}
          </Badge>
        </div>
        <span className="truncate text-xs text-muted-foreground">
          {teacher ? teacher.email : joinCode ? `Kode: ${joinCode}` : "—"}
        </span>
      </div>
      {teacher ? (
        <CopyButton
          value={teacher.email}
          label={`Salin email ${teacher.name}`}
          size="icon-sm"
        />
      ) : joinCode ? (
        <CopyButton
          value={joinCode}
          label={`Salin kode ${label}`}
          size="icon-sm"
        />
      ) : null}
    </li>
  );
}

export function ClassCard({ data }: { data: ClassCardData }) {
  const rosterCount =
    (data.homeroom ? 1 : 0) + data.subjects.filter((s) => s.teacher).length;

  return (
    <Card className="transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <CardHeader>
        <CardTitle className="text-base">
          <Link
            href={data.href}
            className="underline-offset-4 hover:underline"
          >
            {data.name}
          </Link>
        </CardTitle>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="size-4" aria-hidden="true" />
            {data.studentCount} siswa
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpenIcon className="size-4" aria-hidden="true" />
            {data.subjectCount} mapel
          </span>
        </div>
      </CardHeader>

      <CardContent className="grid gap-3">
        {data.studentJoinCode ? (
          <JoinCode
            label="Kode gabung siswa"
            code={data.studentJoinCode}
            icon={UsersIcon}
          />
        ) : null}

        <Collapsible className="rounded-xl border">
          <div className="flex items-center gap-1 pr-1.5">
            <CollapsibleTrigger className="group/trigger flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.99] motion-reduce:active:scale-100">
              <span className="flex-1">
                Guru &amp; wali kelas
                <span className="ml-1.5 text-muted-foreground tabular-nums">
                  {rosterCount}/{data.subjects.length + 1}
                </span>
              </span>
              <ChevronDownIcon
                className="size-4 text-muted-foreground transition-transform duration-200 group-aria-expanded/trigger:rotate-180 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </CollapsibleTrigger>
            <CopyButton
              value={buildSummary(data)}
              label="Salin ringkasan guru & wali kelas"
              size="icon-sm"
            />
          </div>
          <CollapsibleContent>
            <ul className="divide-y divide-border/60 px-3 pb-1.5">
              <TeacherRow
                label="Wali kelas"
                teacher={data.homeroom}
                joinCode={null}
              />
              {data.subjects.map((s) => (
                <TeacherRow
                  key={s.id}
                  label={s.subjectName}
                  teacher={s.teacher}
                  joinCode={s.teacherJoinCode}
                />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
