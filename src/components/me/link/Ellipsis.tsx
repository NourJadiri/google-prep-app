import "./Ellipsis.css";

/** Three real dots the reader can watch, so a slow poll looks like waiting; to anything that only sees text it is still "...". */
export default function Ellipsis() {
  return (
    <span className="ell" aria-hidden="true">
      <i>.</i>
      <i>.</i>
      <i>.</i>
    </span>
  );
}
