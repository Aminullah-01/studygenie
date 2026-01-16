import { generateContent } from "./services/ai";

const handleGenerate = async () => {
  try {
    const result = await generateContent(userPrompt);
    setOutput(result);
  } catch (err) {
    alert("Generation failed");
  }
};
