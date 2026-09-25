import { cn } from '@/lib/utils'

export function Stepper({
  steps,
  current,
}: {
  steps: string[]
  current: number
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {steps.map((label, i) => {
        const active = i === current
        const done = i < current
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium',
                active && 'bg-brand text-white',
                done && 'bg-brand-light text-brand',
                !active && !done && 'bg-slate-100 text-slate-500',
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
                {i + 1}
              </span>
              {label}
            </div>
            {i < steps.length - 1 && <div className="hidden h-px w-4 bg-border sm:block" />}
          </div>
        )
      })}
    </div>
  )
}
