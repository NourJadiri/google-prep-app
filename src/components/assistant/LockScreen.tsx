import { useState, type FormEvent, type RefObject } from "react";
import Icon from "../shared/Icon";
import Button from "../ui/Button";
import "./LockScreen.css";

interface Props {
  refused: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onUnlock: (password: string) => void;
}

export default function LockScreen({ refused, inputRef, onUnlock }: Props) {
  const [typed, setTyped] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const password = typed.trim();
    if (password) onUnlock(password);
  };

  return (
    <form className="asst-lock" onSubmit={submit}>
      <span className="asst-lockmark">
        <Icon name="lock" size={18} />
      </span>
      <p>
        <b>{refused ? "That password didn't work." : "Locked to you."}</b> Paste the password you saved in Cloudflare as <code>ASSISTANT_PASSWORD</code>. This browser keeps it; nothing else does.
      </p>
      <input
        ref={inputRef}
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        aria-label="Bana's password"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
      />
      <Button variant="primary" type="submit" disabled={!typed.trim()}>
        Unlock
      </Button>
    </form>
  );
}
