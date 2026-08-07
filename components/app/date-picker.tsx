"use client"

import * as React from "react"
import {
  getLocalTimeZone,
  parseDate,
  parseDateTime,
  toCalendarDateTime,
  toTime,
  today,
  type CalendarDateTime,
} from "@internationalized/date"
import {
  DateInput,
  DateSegment,
  TimeField,
} from "react-aria-components"
import { CalendarIcon, ClockIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger } from "@/components/ui/popover"

// Parse an ISO string into a CalendarDateTime, accepting both "YYYY-MM-DDTHH:mm"
// and date-only "YYYY-MM-DD" (defaults to midnight). Anything unparseable is ignored.
function toDateTime(value?: string): CalendarDateTime | null {
  if (!value) return null
  try {
    return parseDateTime(value)
  } catch {
    try {
      return toCalendarDateTime(parseDate(value))
    } catch {
      return null
    }
  }
}

type DatePickerProps = {
  /** Submitted under this name as an ISO "YYYY-MM-DDTHH:mm:ss" string (empty when unset). */
  name: string
  /** ISO "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" value to preselect (e.g. for edit forms). */
  defaultValue?: string
  placeholder?: string
  className?: string
  // Injected by <Field> via cloneElement so the trigger reports to its label + errors.
  id?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean
}

// Popover date+time picker (aria-nova): a Calendar for the day plus a segmented,
// keyboard-driven TimeField for the hour. It participates in native <form> submission
// through a hidden input carrying "YYYY-MM-DDTHH:mm:ss" (empty when left/cleared unset),
// which `z.coerce.date()` parses the same way <input type="date"> used to.
export function DatePicker({
  name,
  defaultValue,
  placeholder = "Pilih tanggal",
  className,
  id,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
}: DatePickerProps) {
  const [value, setValue] = React.useState<CalendarDateTime | null>(() =>
    toDateTime(defaultValue)
  )

  return (
    <>
      {/* Hidden field carries the value into FormData, like <input type="datetime-local">. */}
      <input type="hidden" name={name} value={value ? value.toString() : ""} />
      <PopoverTrigger>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-describedby={describedBy}
          data-empty={!value}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            invalid &&
              "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
            className
          )}
        >
          <CalendarIcon />
          {value ? (
            value.toDate(getLocalTimeZone()).toLocaleString("id-ID", {
              dateStyle: "long",
              timeStyle: "short",
            })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
        <Popover className="w-auto p-0">
          <Calendar
            value={value}
            onChange={(date) => setValue(toCalendarDateTime(date))}
          />
          <div className="px-2.5 border-t pt-2.5">
            <label>Tenggat waktu</label>
          </div>
          <div className="flex items-center gap-2 p-2.5 pt-0!">
            <ClockIcon className="size-4 shrink-0 text-muted-foreground" />
            <TimeField
              aria-label="Waktu"
              hourCycle={24}
              value={value ? toTime(value) : null}
              onChange={(time) =>
                setValue((prev) => {
                  if (!time) return prev
                  const base = prev ?? toCalendarDateTime(today(getLocalTimeZone()))
                  return base.set({
                    hour: time.hour,
                    minute: time.minute,
                    second: time.second,
                  })
                })
              }
            >
              <DateInput className="flex h-8 flex-1 items-center rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
                {(segment) => (
                  <DateSegment
                    segment={segment}
                    className="rounded px-0.5 text-center tabular-nums caret-transparent outline-none data-[disabled]:opacity-50 data-[focused]:bg-primary data-[focused]:text-primary-foreground data-[placeholder]:text-muted-foreground data-[type=literal]:px-0 data-[type=literal]:text-muted-foreground"
                  />
                )}
              </DateInput>
            </TimeField>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Hapus tanggal"
                onPress={() => setValue(null)}
              >
                <XIcon />
              </Button>
            ) : null}
          </div>
        </Popover>
      </PopoverTrigger>
    </>
  )
}
