import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPickerSingleProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type Props = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
};

export const DatePicker = ({ value, onChange, disabled }: Props) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          disabled={disabled}
          variant="outline"
          className={cn("flex items-center space-x-2", {
            "cursor-not-allowed": disabled,
          })}
        >
          {value ? format(value, "dd/MM/yyyy") : "Select date"}
          <CalendarIcon className="size-4 mr-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange as DayPickerSingleProps["onSelect"]}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
