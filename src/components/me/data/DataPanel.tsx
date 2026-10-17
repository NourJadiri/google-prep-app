import { storeNote } from "../../../lib/storage";
import ButtonRow from "../../ui/ButtonRow";
import Note from "../../ui/Note";
import PillButton from "../../ui/PillButton";
import TransferBox from "./TransferBox";
import { useProgressTransfer } from "./hooks/useProgressTransfer";

export default function DataPanel() {
  const transfer = useProgressTransfer();
  return (
    <>
      <ButtonRow>
        <PillButton onClick={transfer.exportProgress}>Export progress</PillButton>
        <PillButton onClick={transfer.importProgress}>Import</PillButton>
        <PillButton tone="danger" onClick={transfer.resetProgress}>
          Reset
        </PillButton>
      </ButtonRow>
      <TransferBox boxRef={transfer.box} open={transfer.open} value={transfer.value} onChange={transfer.setValue} />
      <Note>{storeNote()}</Note>
    </>
  );
}
