"use client";

import { type ChangeEvent, useEffect, useId, useRef, useState } from "react";
import type {
  AssetFromSource,
  AssetSource,
  AssetSourceComponentProps,
} from "sanity";

import { cleanPhoto } from "./clean-photo";

/*
 * The only way a photo gets into the Studio (config.ts turns off direct
 * uploads, which would keep a phone's location data). It opens over the
 * Studio as a plain dialog, cleans the chosen photo (clean-photo.ts) and
 * hands it to the Studio, which uploads it as usual.
 */

const styles = {
  dialog: {
    maxWidth: "28rem",
    padding: "1.5rem",
    border: "none",
    borderRadius: "0.5rem",
    boxShadow: "0 1rem 3rem rgb(0 0 0 / 0.3)",
    background: "#ffffff",
    color: "#1f2533",
    font: "inherit",
    lineHeight: 1.5,
  },
  heading: { margin: 0, fontSize: "1.1rem", fontWeight: 600 },
  text: { margin: "0.75rem 0 0", fontSize: "0.9rem", color: "#4a5163" },
  input: { display: "block", margin: "1.25rem 0 0", fontSize: "0.9rem" },
  alert: { margin: "0.75rem 0 0", fontSize: "0.9rem", color: "#a3302a" },
  button: {
    marginTop: "1.5rem",
    padding: "0.5rem 1rem",
    border: "1px solid #c9ccd4",
    borderRadius: "0.25rem",
    background: "#ffffff",
    color: "inherit",
    font: "inherit",
    cursor: "pointer",
  },
} as const;

function PhotoFromDeviceDialog({
  accept,
  onClose,
  onSelect,
}: AssetSourceComponentProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [state, setState] = useState<"choosing" | "preparing" | "failed">(
    "choosing",
  );

  // Opens as the Studio shows it. Closing it (Escape, or Cancel) tells the
  // Studio; once a photo is chosen the Studio removes it.
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setState("preparing");
    try {
      const clean = await cleanPhoto(file);
      // The Studio uploads the browser's File as it is; Sanity's types give
      // `value` the name of their own File type, which is a different thing.
      onSelect([
        { kind: "file", value: clean as unknown as AssetFromSource["value"] },
      ]);
    } catch {
      setState("failed");
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      style={styles.dialog}
    >
      <h2 id={`${id}-title`} style={styles.heading}>
        Add a photo
      </h2>
      <p style={styles.text}>
        Before it is uploaded, the photo is turned the right way up, made no
        larger than 2400 pixels across, and cleared of its location, camera
        details and file name.
      </p>
      <input
        type="file"
        accept={accept || "image/*"}
        disabled={state === "preparing"}
        onChange={choose}
        style={styles.input}
      />
      {state === "preparing" && (
        <p role="status" style={styles.text}>
          Preparing the photo...
        </p>
      )}
      {state === "failed" && (
        <p role="alert" style={styles.alert}>
          This photo could not be opened here. Save it as a JPEG and try again.
        </p>
      )}
      <button
        type="button"
        onClick={() => dialog.current?.close()}
        style={styles.button}
      >
        Cancel
      </button>
    </dialog>
  );
}

function PhotoIcon() {
  return (
    <svg
      viewBox="0 0 25 25"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <rect x="4.5" y="6.5" width="16" height="12" rx="1" />
      <circle cx="9.5" cy="10.5" r="1.5" />
      <path d="M5 17l5-5 3 3 2.5-2.5L20 17" />
    </svg>
  );
}

export const photoFromDevice: AssetSource = {
  name: "llf-photo-from-device",
  title: "Photo from this device",
  component: PhotoFromDeviceDialog,
  icon: PhotoIcon,
};
