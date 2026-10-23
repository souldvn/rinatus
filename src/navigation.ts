type SectionPosition = { id: string; top: number; height: number };

// Reserve a real scroll interval for short sections near the page end.
// Unlike a forced last-section override, every heading can become active.
export function sectionStops(
  sections: SectionPosition[],
  maxScroll: number,
  offset: number,
) {
  const stops = sections.map((section) => ({
    id: section.id,
    top: Math.max(0, section.top - offset),
  }));
  for (let i = stops.length - 1; i >= 0; i--) {
    const limit =
      i === stops.length - 1
        ? maxScroll
        : stops[i + 1].top - Math.min(160, sections[i].height);
    stops[i].top = Math.max(0, Math.min(stops[i].top, limit));
  }
  return stops;
}

export function activeSection(
  stops: { id: string; top: number }[],
  scrollY: number,
) {
  return (
    stops.filter((stop) => stop.top <= scrollY + 1).at(-1)?.id ?? stops[0]?.id
  );
}
