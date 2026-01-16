export async function generateContent(prompt: string) {
  const response = await fetch("https://your-backend.onrender.com/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate");
  }

  return data.result;
}
