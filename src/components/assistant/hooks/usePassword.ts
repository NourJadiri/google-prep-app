import { useCallback, useState } from "react";
import { useLatest } from "../../../hooks/useLatest";
import { forgetPassword, loadPassword, savePassword } from "../lib/storage";

export function usePassword() {
  const [value, setValue] = useState(loadPassword);
  const [refused, setRefused] = useState(false);
  const ref = useLatest(value);

  const unlock = useCallback(
    (password: string) => {
      savePassword(password);
      setValue(password);
      /* The chat transport reads this at once, for the question that bounced. */
      ref.current = password;
      setRefused(false);
    },
    [ref]
  );

  const forget = useCallback(() => {
    forgetPassword();
    setValue(null);
  }, []);

  const refuse = useCallback(() => {
    forget();
    setRefused(true);
  }, [forget]);

  return { value, refused, ref, unlock, forget, refuse };
}
