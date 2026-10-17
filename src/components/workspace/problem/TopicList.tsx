import "./TopicList.css";

export default function TopicList({ topics }: { topics: string[] }) {
  return (
    <div className="ws-topics">
      {topics.map((t) => (
        <span key={t} className="ws-topic">
          {t}
        </span>
      ))}
    </div>
  );
}
