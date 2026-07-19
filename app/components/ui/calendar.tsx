import * as React from 'react'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import {
  DayPicker,
  getDefaultClassNames,
  type Locale,
} from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  locale = ptBR,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
  locale?: Locale
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('bg-background p-3', className)}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code || 'pt-BR', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit relative', defaultClassNames.root),
        months: cn('flex flex-col sm:flex-row gap-4', defaultClassNames.months),
        month: cn('flex flex-col gap-4', defaultClassNames.month),
        caption_label: cn('text-sm font-medium', defaultClassNames.caption_label),
        nav: cn('flex items-center gap-1 absolute inset-x-0 top-0 justify-between px-1 h-9 z-10', defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        month_caption: cn('flex justify-center items-center h-9 relative', defaultClassNames.month_caption),
        month_grid: 'w-full border-collapse',
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex-1 text-center',
          defaultClassNames.weekday
        ),
        week: cn('flex w-full mt-2', defaultClassNames.week),
        day: cn(
          'h-9 w-9 text-center text-sm p-0 relative flex-1 [&:has([data-selected][data-range-end])]:rounded-r-md [&:has([data-selected][data-outside])]:bg-accent/50 [&:has([data-selected])]:bg-accent first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
          defaultClassNames.day
        ),
        day_button: cn(
          buttonVariants({ variant: buttonVariant }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        range_end: 'day-range-end',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeftIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          ),
        ...components,
      }}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'

export { Calendar }
