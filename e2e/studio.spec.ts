import { readFile } from "node:fs/promises";

import { type APIRequestContext, expect, test } from "@playwright/test";

import { cleanPhoto } from "../src/sanity/clean-photo";

/* Phase 8: the Studio at /studio, and the way every photo gets into it.
   The Studio is kept out of search and stands apart from the site. A photo
   is cleaned in the browser before it is uploaded (src/sanity/clean-photo.ts):
   these run that exact code in Chromium and WebKit on a photo carrying what
   a phone puts in one (e2e/fixtures/photo-with-location.jpg: 3000 x 2000,
   left half red, an orientation flag that turns it upright, camera details
   and a GPS location). */

test("the Studio is kept out of search, apart from the site", async ({
  request,
}) => {
  const response = await request.get("/studio");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toMatch(/<meta name="robots" content="noindex"/);
  expect(await (await request.get("/robots.txt")).text()).toMatch(
    /Disallow: \//,
  );

  // None of the site's shell (no nav, no transition layer), and none of its
  // styles, which would restyle the Studio's own controls.
  expect(html).not.toContain("Back to the shelf");
  expect(html).not.toContain("data-page-root");
  const studioStyles = await stylesheets(request, html);
  expect(studioStyles).not.toContain(".spread");
  expect(studioStyles).not.toContain("--color-paper");
  // (The site's pages do have them.)
  const home = await (await request.get("/")).text();
  expect(await stylesheets(request, home)).toContain(".spread");
});

/** Every stylesheet a page links to, one after another. */
async function stylesheets(request: APIRequestContext, html: string) {
  const links = html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g);
  const sheets = await Promise.all(
    [...links].map(async ([, href]) => (await request.get(href!)).text()),
  );
  return sheets.join("\n");
}

/** The EXIF tags in a JPEG (the main list and the Exif and GPS lists). */
function exifTags(jpeg: Buffer): number[] {
  const start = jpeg.indexOf("Exif\0\0");
  if (start < 0) return [];
  const tiff = jpeg.subarray(start + 6);
  const little = tiff.toString("latin1", 0, 2) === "II";
  const u16 = (at: number) =>
    little ? tiff.readUInt16LE(at) : tiff.readUInt16BE(at);
  const u32 = (at: number) =>
    little ? tiff.readUInt32LE(at) : tiff.readUInt32BE(at);
  const tags: number[] = [];
  const list = (offset: number) => {
    for (let i = 0; i < u16(offset); i++) {
      const entry = offset + 2 + i * 12;
      const tag = u16(entry);
      tags.push(tag);
      if (tag === 0x8769 || tag === 0x8825) list(u32(entry + 8));
    }
  };
  list(u32(4));
  return tags;
}

/** All a browser writes into a JPEG of its own: the Exif list itself, the
    colour space, the image's size and its resolution. */
const harmless = new Set([
  0x8769, 0xa001, 0xa002, 0xa003, 0x011a, 0x011b, 0x0128, 0x0213,
]);

test("a photo loses its location and camera details before upload, and is turned upright", async ({
  page,
}) => {
  const fixture = await readFile("e2e/fixtures/photo-with-location.jpg");
  // The test photo really does carry them: GPS, make, model, orientation.
  expect(exifTags(fixture)).toEqual(
    expect.arrayContaining([0x8825, 0x010f, 0x0110, 0x0112]),
  );

  await page.goto("/get-involved/sent");
  await page.addScriptTag({
    content: `window.cleanPhoto = ${cleanPhoto.toString()};`,
  });
  const result = await page.evaluate(async (base64) => {
    const clean = (window as unknown as { cleanPhoto: typeof cleanPhoto })
      .cleanPhoto;
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const file = await clean(
      new File([bytes], "IMG_2041 at the shelter.jpg", { type: "image/jpeg" }),
    );

    const image = new Image();
    image.src = URL.createObjectURL(file);
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const pixel = (y: number) =>
      Array.from(
        context.getImageData(canvas.width / 2, y, 1, 1).data.slice(0, 3),
      );

    const out = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let i = 0; i < out.length; i += 0x8000) {
      binary += String.fromCharCode(...out.subarray(i, i + 0x8000));
    }
    return {
      name: file.name,
      type: file.type,
      width: image.naturalWidth,
      height: image.naturalHeight,
      top: pixel(5),
      bottom: pixel(canvas.height - 5),
      bytes: btoa(binary),
    };
  }, fixture.toString("base64"));

  // No file name to give anything away.
  expect(result.name).toBe("photo.jpg");
  expect(result.type).toBe("image/jpeg");
  // Nothing of the original's metadata: no location, camera, date or
  // orientation flag (it is drawn upright), no XMP.
  const clean = Buffer.from(result.bytes, "base64");
  expect(exifTags(clean).filter((tag) => !harmless.has(tag))).toEqual([]);
  expect(clean.includes("TestCam")).toBe(false);
  expect(clean.includes("ns.adobe.com/xap")).toBe(false);
  // Upright (portrait), with the long edge brought down to 2400 px: the
  // photo's left half, red, is now its top.
  expect([result.width, result.height]).toEqual([1600, 2400]);
  const [topRed = 0, , topBlue = 0] = result.top;
  const [bottomRed = 0, , bottomBlue = 0] = result.bottom;
  expect(topRed).toBeGreaterThan(150);
  expect(topBlue).toBeLessThan(100);
  expect(bottomBlue).toBeGreaterThan(150);
  expect(bottomRed).toBeLessThan(100);
});
