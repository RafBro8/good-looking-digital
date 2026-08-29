import { testRun } from "@/lib/site";

/**
 * The credibility moment carried over from concept C.
 * Deliberately reads as instrumentation: mono throughout, tabular figures,
 * and spec names written in customer language rather than test-file names.
 */
export function TestRunPanel() {
  return (
    <div className="border-rule bg-surface border font-mono shadow-[var(--shadow-md)]">
      <div className="border-rule bg-surface-2 flex items-center justify-between gap-3 border-b px-3.5 py-2.5">
        <span className="text-2xs text-muted flex items-center gap-2 tracking-wider">
          <span
            aria-hidden="true"
            className="bg-pass inline-block size-1.5 rounded-full"
          />
          playwright — {testRun.browsers}
        </span>
        <span className="text-2xs text-muted tracking-wider">
          {testRun.suite}
        </span>
      </div>

      <ul className="py-2">
        {testRun.specs.map((spec) => (
          <li
            key={spec.name}
            className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-1.5 text-xs"
          >
            <span aria-hidden="true" className="text-pass">
              ✓
            </span>
            <span className="text-ink truncate">{spec.name}</span>
            <span className="tnum text-muted">{spec.ms}</span>
          </li>
        ))}
      </ul>

      <div className="border-rule text-2xs text-muted flex justify-between gap-3 border-t px-3.5 py-2.5">
        <span>
          <span className="text-pass">{testRun.specs.length} passed</span> · 0
          failed
        </span>
        <span className="tnum">{testRun.duration}</span>
      </div>
    </div>
  );
}
