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
          playwright - {testRun.browsers}
        </span>
        <span className="text-2xs text-muted tracking-wider">
          {testRun.suite}
        </span>
      </div>

      {/*
        Every spec is listed, not a flattering selection - but twenty-seven
        rows is 868px, which turns a credibility detail into most of a screen.
        So the list keeps its full contents and gets a ceiling instead, and
        the footer count below always describes what is actually in here.
      */}
      <ul
        // A region that scrolls has to be reachable by keyboard, or the rows
        // below the fold exist for mouse users only. tabIndex makes it focusable
        // so arrow keys work; the label says what has just been focused.
        tabIndex={0}
        aria-label={`${testRun.specs.length} passing specs`}
        className="max-h-[22rem] overflow-y-auto overscroll-contain py-2"
      >
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
