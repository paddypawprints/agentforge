import { useEffect, useState } from "react";
import {
  getDefaultEmbeddedToolDescription,
  getEmbeddedToolDescription,
  setEmbeddedToolDescription,
} from "../services/tools";
import { JsonCodeEditor } from "./JsonCodeEditor";

/** The tool prompt included in the message. The box is JSON. */
export function EmbeddedToolDescription() {
  const [description, setDescription] = useState(() => getEmbeddedToolDescription());

  useEffect(() => {
    setEmbeddedToolDescription(description);
  }, [description]);

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <JsonCodeEditor
        value={description}
        onChange={setDescription}
        label="Embedded tool description"
        height="20rem"
      />
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => setDescription(getDefaultEmbeddedToolDescription())}
          className="pkd-button pkd-button-secondary text-xs px-3 py-1"
        >
          RESET
        </button>
      </div>
    </div>
  );
}
