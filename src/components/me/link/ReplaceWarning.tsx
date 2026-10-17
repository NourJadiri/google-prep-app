import "./ReplaceWarning.css";

/** What arrives replaces what's here, and on every device already on this code. */
export default function ReplaceWarning({ enabled }: { enabled: boolean }) {
  return (
    <p className="qrwarn">
      {enabled
        ? "What arrives replaces the progress here — and on every device already on this code. Export first if it's worth keeping."
        : "This device has progress. What arrives replaces it — export first if it's worth keeping."}
    </p>
  );
}
