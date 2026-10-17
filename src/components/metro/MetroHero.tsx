import Hero from "../ui/Hero";

export default function MetroHero() {
  return (
    <Hero
      heading={
        <>
          Metro <b>mode</b>
        </>
      }
      blurb="Thumb-only drills for the commute or the plane. Ten stops per run, streaks multiply your XP. No keyboard, no excuses."
    />
  );
}
