interface CurrentTimeLineProps {
  minuteFraction: number;
}

export function CurrentTimeLine({ minuteFraction }: CurrentTimeLineProps) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-accent"
      style={{ top: `${minuteFraction * 100}%` }}
      aria-hidden="true"
    />
  );
}
