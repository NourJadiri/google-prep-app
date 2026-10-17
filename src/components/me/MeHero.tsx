export default function MeHero({ trackName }: { trackName: string }) {
  return (
    <div className="hero">
      <h1>
        Your <b>line</b>
      </h1>
      <p>{"The numbers, the ranks, the hardware — " + trackName + "."}</p>
    </div>
  );
}
