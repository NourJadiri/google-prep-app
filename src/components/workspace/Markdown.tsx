import { useMemo } from "react";
import { renderMarkdown } from "./lib/markdown";
import "./Markdown.css";

export default function Markdown({ text }: { text: string }) {
  const html = useMemo(() => renderMarkdown(text), [text]);
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />;
}
