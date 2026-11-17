import editorWorker from "monaco-editor/editor/editor.worker.js?worker";
import jsonWorker from "monaco-editor/languages/features/json/json.worker.js?worker";
import * as monaco from "monaco-editor/editor/editor.api.js";
import { jsonDefaults } from "monaco-editor/language/json/monaco.contribution.js";

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === "json") return new jsonWorker();
    return new editorWorker();
  },
};

jsonDefaults.setModeConfiguration({
  documentFormattingEdits: true,
  documentRangeFormattingEdits: true,
  completionItems: true,
  hovers: true,
  documentSymbols: true,
  tokens: true,
  colors: true,
  foldingRanges: true,
  diagnostics: true,
  selectionRanges: true,
});

jsonDefaults.setDiagnosticsOptions({
  validate: false,
  allowComments: true,
  trailingCommas: "ignore",
  schemaValidation: "ignore",
  schemas: [],
});

monaco.editor.defineTheme("rxm", {
  base: "vs",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#222222",
    "editorLineNumber.foreground": "#757575",
    "editor.selectionBackground": "#d6e4f7",
    "editorCursor.foreground": "#16479c",
  },
});

export default monaco;
