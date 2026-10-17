import Icon from "../shared/Icon";
import "./SendButton.css";

interface Props {
  busy: boolean;
  disabled: boolean;
  onStop: () => void;
}

export default function SendButton({ busy, disabled, onStop }: Props) {
  return busy ? (
    <button type="button" className="asst-send stop" onClick={onStop} aria-label="Stop" title="Stop">
      <Icon name="square" size={12} />
    </button>
  ) : (
    <button type="submit" className="asst-send" disabled={disabled} aria-label="Send" title="Send (Enter)">
      <Icon name="send" size={14} />
    </button>
  );
}
