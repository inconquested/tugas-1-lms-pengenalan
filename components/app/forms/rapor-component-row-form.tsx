"use client";

import { useActionState, useId, useState } from "react";
import { upsertRaporComponentAction } from "@/lib/actions/rapor";
import { idle } from "@/lib/actions/types";
import { Field } from "@/components/app/field";
import { SubmitButton } from "@/components/app/submit-button";
import { useActionToast } from "@/components/app/use-action-toast";
import { Input } from "@/components/ui/input";
import { formatScore } from "@/lib/format";

// One gradebook row: knowledge + skill inputs with a live-computed final score.
// Final = 50/50 average, mirroring the server's calculateFinalGrade.
export function RaporComponentRowForm({
  classSubjectId,
  studentId,
  knowledgeScore,
  skillScore,
}: {
  classSubjectId: string;
  studentId: string;
  knowledgeScore?: number | null;
  skillScore?: number | null;
}) {
  const uid = useId();
  const [state, formAction] = useActionState(
    upsertRaporComponentAction.bind(null, classSubjectId, studentId),
    idle,
  );
  useActionToast(state);

  const [knowledge, setKnowledge] = useState(
    knowledgeScore != null ? String(knowledgeScore) : "",
  );
  const [skill, setSkill] = useState(skillScore != null ? String(skillScore) : "");

  const finalScore =
    knowledge.trim() === "" && skill.trim() === ""
      ? null
      : ((Number(knowledge) || 0) + (Number(skill) || 0)) / 2;

  return (
    <form
      action={formAction}
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
    >
      <Field
        label="Pengetahuan"
        htmlFor={`${uid}-knowledge`}
        error={state.errors?.knowledgeScore}
      >
        <Input
          type="number"
          name="knowledgeScore"
          min={0}
          max={100}
          value={knowledge}
          onChange={(e) => setKnowledge(e.target.value)}
        />
      </Field>
      <Field
        label="Keterampilan"
        htmlFor={`${uid}-skill`}
        error={state.errors?.skillScore}
      >
        <Input
          type="number"
          name="skillScore"
          min={0}
          max={100}
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
      </Field>
      <div className="grid gap-2">
        <span className="text-sm font-medium">Nilai Akhir</span>
        <span
          aria-live="polite"
          className="flex h-8 items-center px-1 text-sm font-semibold tabular-nums"
        >
          {formatScore(finalScore)}
        </span>
      </div>
      <SubmitButton pendingLabel="Menyimpan...">Simpan</SubmitButton>
    </form>
  );
}
