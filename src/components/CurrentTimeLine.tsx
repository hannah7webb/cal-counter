import { useEffect, useState, type RefObject } from 'react';

interface CurrentTimeLineProps {
  hourRefs: RefObject<Record<number, HTMLDivElement | null>>;
}

export function CurrentTimeLine({ hourRefs }: CurrentTimeLineProps) {
  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      const el = hourRefs.current[now.getHours()];
      if (!el) return;
      const minuteFraction = now.getMinutes() / 60;
      setTop(el.offsetTop + minuteFraction * el.offsetHeight);
    }
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [hourRefs]);

  if (top === null) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-accent"
      style={{ top }}
      aria-hidden="true"
    />
  );
}
