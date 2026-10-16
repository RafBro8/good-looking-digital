import { testRun } from "@/lib/site";

/**
 * The credibility moment carried over from concept C.
 * Deliberately reads as instrumentation: mono throughout, tabular figures,
 * and spec names written in customer language rather than test-file names.
 *
 * Five specs show, the rest open on request. The full list used to sit in a
 * 22rem scroll box, which was honest about the count and also meant a thumb
 * swipe down the home page on a phone was caught inside eighty-nine rows of
 * test names before it reached the next section. Nothing is hidden: the
 * footer still counts every spec, and one tap shows them all.
 */

const featured = testRun.specs.filter((spec) =>
  (testRun.featured as readonly string[]).includes(spec.name),
);
const rest = testRun.specs.filter(
  (spec) => !(testRun.featured as readonly string[]).includes(spec.name),
);

function Row({ name, ms }: { name: string; ms: string }) {
  return (
    <li className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-1.5 text-xs">
      <span aria-hidden="true" className="text-pass">
        ✓
      </span>
      <span className="text-ink truncate">{name}</span>
      <span className="tnum text-muted">{ms}</span>
    </li>
  );
}

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

      <ul className="py-2" aria-label={`${featured.length} example specs`}>
        {featured.map((spec) => (
          <Row key={spec.name} name={spec.name} ms={spec.ms} />
        ))}
      </ul>

      {/* A native disclosure rather than state: it works before the page has
          hydrated, it is keyboard-operable for free, and the rows inside are
          real markup rather than something a crawler has to execute to see. */}
      <details className="group border-rule border-t">
        <summary className="text-2xs text-muted hover:text-ink flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 tracking-wider transition-colors duration-200 [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 group-open:rotate-90"
          >
            &rsaquo;
          </span>
          <span className="group-open:hidden">
            show all {testRun.specs.length}
          </span>
          <span className="hidden group-open:inline">hide</span>
        </summary>

        {/* Capped and scrollable only once opened, so the page never traps a
            swipe on its own. */}
        <ul
          tabIndex={0}
          aria-label={`the remaining ${rest.length} passing specs`}
          className="border-rule max-h-[22rem] overflow-y-auto overscroll-contain border-t py-2"
        >
          {rest.map((spec) => (
            <Row key={spec.name} name={spec.name} ms={spec.ms} />
          ))}
        </ul>
      </details>

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
