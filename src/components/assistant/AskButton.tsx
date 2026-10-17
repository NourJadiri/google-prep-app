import { modKey } from "../../lib/platform";
import Icon from "../shared/Icon";
import Button from "../ui/Button";

export default function AskButton({ open, wide, onClick }: { open: boolean; wide: boolean; onClick: () => void }) {
  return (
    <Button variant="ghost" onClick={onClick} aria-pressed={open} title={"Ask Patrick (" + modKey() + "+K)"}>
      <Icon name="smile" size={14} />
      {wide && "Patrick"}
    </Button>
  );
}
