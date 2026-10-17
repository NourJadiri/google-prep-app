import { useApp } from "../../../state/AppState";
import BoardButton from "./BoardButton";
import DepartureBoard from "./DepartureBoard";
import LifetimeNote from "./LifetimeNote";

export default function DeckPicker() {
  const { state, actions } = useApp();
  const { data } = state;

  return (
    <>
      <DepartureBoard data={data} selected={state.deck} onSelect={actions.setDeck} />
      <BoardButton deck={state.deck} onBoard={actions.startRun} />
      <LifetimeNote quiz={data.quiz} />
    </>
  );
}
