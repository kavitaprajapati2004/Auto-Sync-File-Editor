let inFlight = null;

export async function saveToServer(payload) {
  if (inFlight) return inFlight;

  inFlight = fetch("http://localhost:5000/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).finally(() => {
    inFlight = null;
  });

  const res = await inFlight;
  if (!res.ok) throw new Error("Save failed");
  return res.json();
}
