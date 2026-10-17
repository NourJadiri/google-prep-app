import Hero from "../ui/Hero";

export default function MeHero({ trackName }: { trackName: string }) {
  return (
    <Hero
      heading={
        <>
          Your <b>line</b>
        </>
      }
      blurb={"The numbers, the ranks, the hardware — " + trackName + "."}
    />
  );
}
