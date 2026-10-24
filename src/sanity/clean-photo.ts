/**
 * Prepares a photo in the browser before the Studio uploads it, as
 * scripts/photos/prepare_photo.py does for photos in public/: turns it the
 * right way up, makes the long edge at most 2400 px, and draws it afresh as
 * a JPEG. Nothing of the original's metadata survives: no location, no
 * camera details, no dates, no file name (browsers write only the new
 * image's size and colour space). Phones put all of that in every photo,
 * and these photos are of children's libraries.
 *
 * Kept self-contained (no imports, nothing outside the function), so the
 * tests run exactly this code in a browser.
 */
export async function cleanPhoto(file: File): Promise<File> {
  const longEdge = 2400;
  const quality = 0.9;

  const url = URL.createObjectURL(file);
  try {
    // Browsers apply the photo's orientation flag when they decode it, so
    // the copy drawn below is the right way up.
    const image = new Image();
    image.src = url;
    await image.decode();

    const scale = Math.min(
      1,
      longEdge / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot prepare photos.");
    // A drawing scanned with a transparent background goes on white paper.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) throw new Error("The photo could not be saved.");
    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}
