async function generateContent(userPrompt) {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userPrompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Generation failed");
    }

    // ✅ Use this result in your UI
    console.log(data.result);

    return data.result;
  } catch (error) {
    console.error("Error:", error.message);
    alert("Failed to generate content");
  }
}
