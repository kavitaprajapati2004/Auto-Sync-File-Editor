export default function Editor({ content, onChange }) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start typing..."
    />
  );
}
