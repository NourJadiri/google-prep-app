import type { SyncStatus } from "../../../lib/sync";
import Note from "../../ui/Note";
import { look } from "./lib/syncDisplay";

export default function SyncNote({ status }: { status: SyncStatus }) {
  if (!status.enabled) {
    return (
      <Note>
        Sync mirrors progress through the app's own cloud store. Turn it on here, then
        enter the code on the next device — the cloud copy wins there, so export first
        if that device has progress worth keeping.
      </Note>
    );
  }
  const { note } = look(status);
  return note ? <Note>{note}</Note> : null;
}
