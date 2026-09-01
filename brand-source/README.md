# Brand source

Working files, not shipping assets. Nothing in here is served to the browser —
`public/brand/` holds the processed versions the site actually loads.

## The loop mark — retained

The dimensional loop mark supplied at the start of the project, kept at full
resolution in every colourway. **These are deliberately retained, not
deprecated.**

| File | Notes |
| --- | --- |
| `mark-blue.png` | 1254², the original colourway |
| `mark-purple.png` | 1254² |
| `mark-navy.png` | 1254² |
| `mark-black.png` | 1254² |
| `mark-white.png` | 1254² |
| `mark-light.png` | 1254² |
| `brand-sheet.png` | the supplied sheet showing all variants together |

It was set aside for the site for two reasons, neither of them a judgement on
the mark: it has **no alpha channel** (every file is a flat rectangle, so it
cannot sit on a coloured ground without a cutout), and its blues and purples
**collide with the site palette** — the closest competitor site found during
research, Inertia Group, uses very nearly the same blue/purple/pink range.

Where it may still earn its place: a social avatar, a sticker, print, or as the
starting point for a paid designer once there is budget to finish it properly.

`scripts/recolour-mark.js` is the pipeline that produced `public/brand/` from
these — piecewise hue remapping into the site palette, plus background cutout
by border flood-fill and matte erosion. Re-runnable if the palette changes.

## Vector candidates

Hand-authored, single-stroke, no fills — which is what makes all three
cuttable in vinyl, embroiderable, and scalable with no raster fallback.

| File | Bytes | Idea |
| --- | --- | --- |
| `vector/gld-woven.svg` | 708 | letters pass over and under each other; the L is drawn by the gaps |
| `vector/gld-overlap.svg` | 421 | three letters tightened until the L's foot runs under the D's stem |
| `vector/gld-row.svg` | 424 | three letters in a row, touching nothing |

**Not yet chosen.** None is wired into the site — `src/components/BrandMark.tsx`
still renders the recoloured raster from `public/brand/`.

Directions already tried and rejected, so they are not attempted again:
continuous single stroke, shared spine, dual-reading form, abstract loop,
bar-through-letters (read as a strikethrough), and an L/D shared stem.
