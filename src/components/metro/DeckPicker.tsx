import { useApp } from "../../state/AppState";
import { DECKS } from "../../data/questions";
import { deckStat } from "../../lib/engine";
import Icon from "../shared/Icon";
import type { DeckId } from "../../types";

/* The departures board. One row per line — roundel, destination, your numbers,
   platform tag — and the chosen row reads NOW BOARDING. Redemption runs as the
   delayed service: it only opens once you owe it something. */

interface LineLook {
  /** Roundel fill; "" means the Mix interchange (the four-colour conic). */
  color: string;
  /** Letter on the roundel. */
  glyph: string;
  /** Text colour for this line's tags. Yellow is never used as text — the app
   *  pairs the yellow line with --med for anything that has to be read. */
  text: string;
}

const LOOK: Record<DeckId, LineLook> = {
  mix:    { color: "",              glyph: "",  text: "var(--ink)" },
  graphs: { color: "var(--blue)",   glyph: "G", text: "var(--blue)" },
  bt:     { color: "var(--red)",    glyph: "B", text: "var(--red)" },
  dp:     { color: "var(--yellow)", glyph: "D", text: "var(--med)" },
  ds:     { color: "var(--green)",  glyph: "H", text: "var(--green)" },
  redo:   { color: "var(--med)",    glyph: "R", text: "var(--med)" },
};

const tagStyle = (text: string) => ({
  color: text,
  background: "color-mix(in srgb, " + text + " 14%, transparent)",
});

function subline(id: DeckId, n: number, pct: number | null): string {
  if (id === "redo") return n ? n + " missed · win them back" : "no misses yet — clean sheet";
  const ridden = pct === null ? "not yet ridden" : pct + "% right";
  if (id === "mix") return n + " cards · " + (pct === null ? "weakest first" : pct + "% · weakest first");
  return n + " cards · " + ridden;
}

export default function DeckPicker() {
  const { state, actions } = useApp();
  const { data } = state;
  const quiz = data.quiz;
  const selName = DECKS.find((d) => d.id === state.deck)?.n ?? "Mix";

  return (
    <>
      <div className="dboard" role="group" aria-label="Choose a deck">
        <div className="dboard-head">
          <span className="dboard-title">Departures — pick a line</span>
          <span className="dboard-live">
            <i aria-hidden="true" />
            {DECKS.length + " lines"}
          </span>
        </div>

        {DECKS.map((d, i) => {
          const look = LOOK[d.id];
          const { n, pct } = deckStat(data, d.id);
          const sel = state.deck === d.id;
          const off = d.id === "redo" && n === 0;

          return (
            <button
              key={d.id}
              className={"drow" + (sel ? " sel" : "")}
              disabled={off}
              aria-pressed={sel}
              onClick={() => actions.setDeck(d.id)}
            >
              {look.color ? (
                <span
                  className={"rdl" + (d.id === "dp" ? " onyellow" : "")}
                  style={
                    sel
                      ? {
                          background: look.color,
                          boxShadow:
                            "0 0 0 2px var(--sunken), 0 0 0 3.5px " + look.color,
                        }
                      : { background: look.color }
                  }
                >
                  {look.glyph}
                </span>
              ) : (
                <span className="rdl mix">
                  <i aria-hidden="true" />
                </span>
              )}
              <span className="drow-info">
                <span className="drow-name">{d.n}</span>
                <span className="drow-sub">{subline(d.id, n, pct)}</span>
              </span>
              {sel ? (
                <span className="dtag" style={tagStyle(look.text)}>NOW BOARDING</span>
              ) : d.id === "redo" && n > 0 ? (
                <span className="dtag" style={tagStyle(look.text)}>{"DELAYED · " + n}</span>
              ) : (
                <span className="dplat">{"P" + (i + 1)}</span>
              )}
            </button>
          );
        })}
      </div>

      <button className="board" onClick={actions.startRun}>
        <Icon name="train" size={18} />
        {"Board " + selName + " — 10 stops"}
      </button>

      {quiz.answered ? (
        <p className="storenote">
          {quiz.correct +
            "/" +
            quiz.answered +
            " lifetime · best streak " +
            quiz.bestStreak +
            " · " +
            quiz.sessions +
            " runs"}
        </p>
      ) : (
        <p className="storenote">
          Patterns, bug hunts, missing lines, complexity. Tap the right answer — streaks
          multiply the XP (×2 at 3, ×3 at 6). Wrong ones go to the Redemption deck.
        </p>
      )}
    </>
  );
}
