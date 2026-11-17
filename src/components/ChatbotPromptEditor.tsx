import { useEffect, useRef, useState } from "react";
import { getChatbotPrompt, getDefaultChatbotPrompt, setChatbotPrompt } from "../services/orchestrator";
import { JsonCodeEditor, JsonCodeEditorHandle } from "./JsonCodeEditor";
import { PromptRoleButtons } from "./PromptRoleButtons";

/** The prompt included while chatbot mode is on. Structure buttons insert message blocks. */
export function ChatbotPromptEditor() {
  const [prompt, setPromptState] = useState(() => getChatbotPrompt());
  const box = useRef<JsonCodeEditorHandle>(null);

  useEffect(() => {
    setChatbotPrompt(prompt);
  }, [prompt]);

  function insert(snippet: string) {
    if (box.current) {
      box.current.insert(snippet);
      return;
    }
    setPromptState(prompt.trim() ? `${prompt.replace(/\s*$/, "\n")}${snippet}` : snippet.trim());
  }

  return (
    <div>
      <PromptRoleButtons onInsert={insert} />
      <JsonCodeEditor
        ref={box}
        value={prompt}
        onChange={setPromptState}
        label="Chatbot prompt"
        height="16rem"
      />
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => setPromptState(getDefaultChatbotPrompt())}
          className="pkd-button pkd-button-secondary text-xs px-3 py-1"
        >
          RESET
        </button>
      </div>
    </div>
  );
}
