import Icon from "../../shared/Icon";
import Button from "../../ui/Button";
import "./SolutionVeil.css";

export default function SolutionVeil({ onReveal }: { onReveal: () => void }) {
  return (
    <div className="ws-veil">
      <Icon name="lock" size={22} />
      <p>
        <b>Try it first.</b> The walkthrough and a reference solution are here when you want them — and they open by
        themselves once every test passes.
      </p>
      <Button onClick={onReveal}>
        <Icon name="eye" size={15} />
        Reveal the solution
      </Button>
    </div>
  );
}
