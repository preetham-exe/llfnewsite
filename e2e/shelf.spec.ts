import { expect, test } from "@playwright/test";

/* Phase 1 acceptance: the shelf is real links with real text, every spine
   title fits its spine, and spine lettering passes WCAG AA. */

type RGB = [number, number, number];

function parseColor(value: string): RGB {
  const parts = value.match(/[\d.]+/g)?.map(Number) ?? [];
  if (parts.length < 3) throw new Error(`Cannot parse colour: ${value}`);
  return [parts[0]!, parts[1]!, parts[2]!];
}

function luminance([r, g, b]: RGB): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as RGB;
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrast(a: RGB, b: RGB): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (light + 0.05) / (dark + 0.05);
}

/** Across the title, spine shading stays within 5% white or 5% black of the
    cloth (src/styles/shelf.css). */
function withHighlight([r, g, b]: RGB): RGB {
  return [r, g, b].map((channel) => channel * 0.95 + 255 * 0.05) as RGB;
}

function withShade([r, g, b]: RGB): RGB {
  return [r, g, b].map((channel) => channel * 0.95) as RGB;
}

const shelfName = "Sections of the site";

test("the shelf is seven real links, in reading order", async ({ page }) => {
  await page.goto("/");
  const links = page
    .getByRole("navigation", { name: shelfName })
    .getByRole("link");
  await expect(links).toHaveCount(7);

  // Phones show the pile, with Donate on top; larger screens show the shelf.
  // Accessible names are the titles alone: the LLF monogram is hidden.
  const shelfOrder = [
    "Our Story",
    "The Libraries",
    "How We Build",
    "Partners",
    "Stories",
    "Get Involved",
    "Donate",
  ];
  const pileOrder = ["Donate", ...shelfOrder.slice(0, -1)];
  const isPhone = (page.viewportSize()?.width ?? 0) < 768;
  const expected = isPhone ? pileOrder : shelfOrder;
  for (const [index, name] of expected.entries()) {
    await expect(links.nth(index)).toHaveAccessibleName(name);
  }
});

test("every spine title fits inside its spine", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const links = page
    .getByRole("navigation", { name: shelfName })
    .getByRole("link");

  for (let index = 0; index < 7; index++) {
    const fit = await links.nth(index).evaluate((spine) => {
      const title = spine.querySelector("[data-spine-title]")!;
      const outer = spine.getBoundingClientRect();
      const inner = title.getBoundingClientRect();
      return {
        name: title.textContent,
        inside:
          inner.left >= outer.left - 0.5 &&
          inner.right <= outer.right + 0.5 &&
          inner.top >= outer.top - 0.5 &&
          inner.bottom <= outer.bottom + 0.5,
      };
    });
    expect(fit.inside, `${fit.name} overflows its spine`).toBe(true);
  }
});

test("spine lettering passes WCAG AA contrast", async ({ page }) => {
  await page.goto("/");
  const links = page
    .getByRole("navigation", { name: shelfName })
    .getByRole("link");

  for (let index = 0; index < 7; index++) {
    const sample = await links.nth(index).evaluate((spine) => {
      const title = spine.querySelector("[data-spine-title]")!;
      return {
        name: title.textContent ?? "",
        color: getComputedStyle(title).color,
        cloth: getComputedStyle(spine).backgroundColor,
        size: parseFloat(getComputedStyle(title).fontSize),
      };
    });
    const text = parseColor(sample.color);
    const cloth = parseColor(sample.cloth);
    // Check the bare cloth and the lightest and darkest shading under the title.
    const ratio = Math.min(
      contrast(text, cloth),
      contrast(text, withHighlight(cloth)),
      contrast(text, withShade(cloth)),
    );
    const required = sample.size >= 24 ? 3 : 4.5;
    expect(
      ratio,
      `${sample.name}: ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(required);
  }
});
