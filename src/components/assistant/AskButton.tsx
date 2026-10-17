import { modKey } from "../../lib/platform";
import Icon from "../shared/Icon";
import Button from "../ui/Button";

export default function AskButton({ open, wide, onClick }: { open: boolean; wide: boolean; onClick: () => void }) {
  return (
    <Button variant="ghost" onClick={onClick} aria-pressed={open} title={"Ask the assistant (" + modKey() + "+K)"}>
      <Icon name="sparkles" size={14} />
      {wide && "Ask"}
    </Button>
  );
}
