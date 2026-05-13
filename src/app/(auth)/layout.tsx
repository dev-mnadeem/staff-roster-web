type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span aria-hidden className="h-6 w-1.5 rounded-full bg-brand" />
          <span className="font-heading text-xl font-semibold">ShiftSync</span>
        </div>
        <div className="max-w-sm">
          <p className="font-heading text-3xl leading-tight">
            Four sites, two timezones, one roster.
          </p>
          <p className="mt-4 text-sm leading-relaxed opacity-80">
            Publish shifts, trade them, and see why the auto-fill picked who
            it picked.
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">
          Coastal Eats staff scheduling
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center gap-6 p-4 sm:p-8">
        <div className="flex items-center gap-2 lg:hidden">
          <span aria-hidden className="h-5 w-1.5 rounded-full bg-brand" />
          <span className="font-heading text-lg font-semibold">ShiftSync</span>
        </div>
        {children}
      </main>
    </div>
  );
}
