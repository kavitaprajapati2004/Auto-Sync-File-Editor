export default function SaveStatus({ status }) {
  const map = {
    "Saved": "saved",
    "Saving...": "saving",
    "Unsaved changes": "unsaved",
    "Save failed": "failed",
  };

  return (
    <p className={`status ${map[status] || ""}`}>
      {status}
    </p>
  );
}
