import Hero from "../ui/Hero";

export default function DojoHero() {
  return (
    <Hero
      heading={
        <>
          The <b>dojo</b>
        </>
      }
      blurb="The daily ritual: write the day's template from a blank page, from memory. Then reveal and diff — the gap is the lesson."
    />
  );
}
