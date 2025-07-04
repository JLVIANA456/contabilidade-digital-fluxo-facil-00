
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white rounded-lg shadow-lg border-0", className)}
      locale={ptBR}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between pt-2 pb-4 relative items-center px-10",
        caption_label: "text-lg font-semibold text-gray-800 flex-1 text-center",
        caption_dropdowns: "flex justify-center gap-3 flex-1",
        nav: "flex items-center space-x-2 absolute inset-x-2 top-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 shadow-sm"
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell: "text-red-600 rounded-md w-10 font-semibold text-sm uppercase tracking-wide",
        row: "flex w-full mt-1",
        cell: "h-10 w-10 text-center text-sm p-0 relative hover:bg-red-50 rounded-md transition-colors [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-red-50/50 [&:has([aria-selected])]:bg-red-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-medium hover:bg-red-50 hover:text-red-700 aria-selected:opacity-100 rounded-md transition-all duration-200"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-red-600 text-white hover:bg-red-700 hover:text-white focus:bg-red-700 focus:text-white shadow-md",
        day_today: "bg-red-100 text-red-700 font-bold border-2 border-red-300",
        day_outside: "day-outside text-gray-400 opacity-60 aria-selected:bg-red-100/50 aria-selected:text-gray-500 aria-selected:opacity-40",
        day_disabled: "text-gray-300 opacity-40 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-red-100 aria-selected:text-red-700",
        day_hidden: "invisible",
        dropdown_month: "relative inline-flex h-10 items-center justify-between rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-w-[120px]",
        dropdown_year: "relative inline-flex h-10 items-center justify-between rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-w-[100px]",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Dropdown: ({ value, onChange, children, ...dropdownProps }) => {
          const options = React.Children.toArray(children) as React.ReactElement<
            React.HTMLProps<HTMLOptionElement>
          >[];
          const selected = options.find((child) => child.props.value === value);
          const handleChange = (value: string) => {
            const changeEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };
          return (
            <Select
              value={value?.toString()}
              onValueChange={(value) => {
                handleChange(value);
              }}
            >
              <SelectTrigger className="h-10 border-red-200 bg-white hover:bg-red-50 focus:ring-red-500 focus:border-red-500 shadow-sm font-medium text-gray-700">
                <SelectValue>{selected?.props?.children ?? value}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" className="bg-white border-red-200 shadow-lg">
                {options.map((option, id: number) => (
                  <SelectItem
                    key={`${option.props.value}-${id}`}
                    value={option.props.value?.toString() ?? ""}
                    className="hover:bg-red-50 focus:bg-red-50 text-gray-700"
                  >
                    {option.props.children}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      }}
      captionLayout="dropdown-buttons"
      fromYear={1900}
      toYear={2030}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
