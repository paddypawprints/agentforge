import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import monaco from "../monaco";

function formatJson(editor: monaco.editor.IStandaloneCodeEditor) {
  const text = editor.getValue().trim();
  if (!text) return;
  try {
    JSON.parse(text);
  } catch {
    return;
  }
  const action = editor.getAction("editor.action.formatDocument");
  if (action) void action.run();
}

export type JsonCodeEditorHandle = {
  insert: (snippet: string) => void;
};

type JsonCodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  height: string;
};

/** Monaco editor with the JSON language and formatting turned on. */
export const JsonCodeEditor = forwardRef<JsonCodeEditorHandle, JsonCodeEditorProps>(function JsonCodeEditor(
  { value, onChange, label, height },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const initialValue = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useImperativeHandle(ref, () => ({
    insert(snippet: string) {
      const editor = editorRef.current;
      const model = editor?.getModel();
      const selection = editor?.getSelection();
      if (!editor || !model || !selection) return;
      const offset = model.getOffsetAt(selection.getStartPosition());
      const gap = offset > 0 && model.getValue()[offset - 1] !== "\n" ? "\n" : "";
      editor.executeEdits("insert", [{ range: selection, text: gap + snippet, forceMoveMarkers: true }]);
      editor.focus();
    },
  }));

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const editor = monaco.editor.create(node, {
      value: initialValue.current,
      language: "json",
      theme: "rxm",
      ariaLabel: label,
      automaticLayout: true,
      formatOnPaste: true,
      formatOnType: true,
      tabSize: 2,
      insertSpaces: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      fontSize: 14,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      padding: { top: 8, bottom: 8 },
      scrollbar: { alwaysConsumeMouseWheel: false },
    });
    editorRef.current = editor;
    const subscription = editor.onDidChangeModelContent(() => {
      onChangeRef.current(editor.getValue());
    });
    formatJson(editor);
    return () => {
      subscription.dispose();
      editor.dispose();
      editorRef.current = null;
    };
  }, [label]);

  useEffect(() => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!model || model.getValue() === value) return;
    model.setValue(value);
    if (editor) formatJson(editor);
  }, [value]);

  return (
    <div
      style={{
        height,
        border: "1px solid var(--pkd-border-color)",
        borderRadius: "6px",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <div ref={host} style={{ height: "100%" }} />
    </div>
  );
});
