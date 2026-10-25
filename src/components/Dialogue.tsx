import type { DialogueLine } from "@/data";

export function Dialogue({ lines }: { lines: DialogueLine[] }) {
  const speakers = Array.from(new Set(lines.map((l) => l.speaker)));
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const mine = speakers.indexOf(line.speaker) % 2 === 1;
        return (
          <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] rounded-3xl px-4 py-3 sm:max-w-[75%] ${
                mine ? "rounded-br-md bg-forest-700 text-white" : "rounded-bl-md bg-forest-100 text-forest-900"
              }`}
            >
              <p className={`text-xs font-semibold ${mine ? "text-forest-200" : "text-forest-600"}`}>{line.speaker}</p>
              <p lang="tr" className="text-base font-semibold">
                {line.tr}
              </p>
              <p className={`text-sm ${mine ? "text-forest-100" : "text-ink-soft"}`}>{line.en}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
