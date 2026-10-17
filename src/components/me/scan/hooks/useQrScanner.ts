import { useEffect, useRef, useState } from "react";
import { useApp } from "../../../../state/AppState";
import { parseLink } from "../../../../lib/link";
import { openCamera, type CameraFailure } from "../lib/camera";
import { chooseDecoder } from "../lib/decoder";

const TICK_MS = 250;
/* How long "that wasn't ours" stays on screen before the hint comes back. */
const MISS_MS = 2_200;
const HINT = "Point the camera at the code on the other device.";
const NOT_OURS = "That code isn't one of this app's — still looking.";
const FAILURE: Record<CameraFailure, string> = {
  denied: "Camera access is off — type the code in instead.",
  unavailable: "No camera here — type the code in instead.",
};

/** Opens the camera into `video` and reads it four times a second. A hit stops the camera, closes, and hands the link on; nothing is acted on here. */
export function useQrScanner(onClose: () => void) {
  const { actions } = useApp();
  const video = useRef<HTMLVideoElement>(null);
  const [note, setNote] = useState(HINT);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    let live = true;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let missAt = 0;
    const decode = chooseDecoder();

    /* The one teardown, for the cleanup, a hit and a failure alike: a camera left running is a light left on. */
    const stopAll = (): void => {
      live = false;
      if (timer !== null) clearInterval(timer);
      timer = null;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      stream = null;
    };

    const scan = async (el: HTMLVideoElement): Promise<void> => {
      /* HAVE_CURRENT_DATA: before that there is no frame to read. */
      if (!live || el.readyState < 2) return;
      let hits: string[];
      try {
        hits = await decode(el);
      } catch {
        return; /* a frame the decoder didn't like; the next one is 250ms away */
      }
      if (!live) return;
      for (const raw of hits) {
        const d = parseLink(raw);
        if (d) {
          stopAll();
          onClose();
          actions.openLink(d);
          return;
        }
      }
      if (hits.length) {
        missAt = Date.now();
        setNote(NOT_OURS);
      }
    };

    const run = async (): Promise<void> => {
      const cam = await openCamera();
      if ("failure" in cam) {
        stopAll();
        setBroken(true);
        setNote(FAILURE[cam.failure]);
        return;
      }
      const s = cam.stream;
      if (!live) {
        /* Unmounted while the permission prompt was up. */
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      stream = s;
      const el = video.current;
      if (!el) {
        stopAll();
        return;
      }
      el.srcObject = s;
      try {
        await el.play();
      } catch {
        /* autoPlay covers the rest; a paused first frame still scans. */
      }
      /* Unmounted while the video warmed up: the cleanup has already stopped everything. */
      if (!live) return;
      timer = setInterval(() => {
        if (missAt && Date.now() - missAt > MISS_MS) {
          missAt = 0;
          setNote(HINT);
        }
        void scan(el);
      }, TICK_MS);
    };

    void run();
    return stopAll;
  }, [actions, onClose]);

  return { video, note, broken };
}
