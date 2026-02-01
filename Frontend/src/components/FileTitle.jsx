export default function FileTitle({ title, setTitle }) {
  return (
    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="File Title"
    />
  );
}
