# RX-M

The live app is the reference. This file describes the system that `src/App.tsx` already uses. Tokens and classes are in `neo-pkd-design-system.css`. The `pkd-` prefix is historical. Type and color come from rx-m.com: Palanquin headings, Heebo text, RX-M blue on a pale blue page.

## Screen

Header, then two columns, then a footer.

The header is the page title (`pkd-heading pkd-heading-2 pkd-text-primary`) and a muted mono subtitle.

The main grid is `1fr 1fr` with a `1.5rem` gap. Collapsing concepts switches it to `2.75rem 1fr`. The left column scrolls with the page. The right column is sticky (`top: 0.75rem`, `max-height: calc(100vh - 6rem)`) and is a column flex: composer, inspector, then a hop list that scrolls.

The footer is muted Heebo: “RX-M”.

## Concepts

A concept is a `ConceptCard`: what the idea is, and the control that turns it on. Each card folds on its own. A folded card keeps its title and, when it has one, its ON/OFF switch.

- Title is mono, primary, weight 700, tracking `0.06em`.
- The definition is mono, muted, `text-sm`, line-height `1.45`.
- The toggle is a checkbox with `accent-color: var(--pkd-primary)`. The label is **ON** in primary or **OFF** in muted.
- The body hides when the concept is off. `keepBody` leaves it visible. The tool card uses that so the sandbox stays on screen.

Order on the reference screen: Architecture, Data, Model, Mode, Memory, Grounding, Embedded tool, MCP, Templates. Architecture has no switch. Data has no switch and shows the benefits, salary, and retirement tables the tools read, with the same field names as the tool result. Its diagram shows the user, memory, the grounding document, the harness, the model, the embedded tool in the page, and MCP in the page. Mode is one choice: None, Chatbot, or AgentLoop. None adds no prompt. Chatbot includes the chatbot prompt. SYSTEM, USER, ASSISTANT, MEMORY, and TOOL insert a JSON role with a blank line around it. {{memory}} is the stored turns as JSON, and {{tool}} is the tool prompt as JSON. AgentLoop sends the agent prompt. A chat reply is the answer. A workflow runs the planner, then the worker on each task, then the summarizer. The summarizer can send that workflow around again when the tasks did not achieve the request. Tasks, tool rounds, and retries are limited on the panel, and 0 does not stop. The chatbot, agent, planner, worker, and summarizer prompts start as JSON roles for the HR assistant. All five have the same JSON role buttons. Grounding keeps its body visible. The text starts as the 2026 benefits policy, and {{grounding}} inserts the edited text while that switch is on. Memory keeps its body visible and shows the current memory content as JSON. The session arrows name the harness.

## Session

The right column opens with **NEW SESSION**, aligned to the end of the row above the cards so that row matches **HIDE**. The composer sits in a card directly under that button: a mono `pkd-input`, a primary button, and a muted status line that names what is actually on.

The inspector is one card. Its label is mono, xs, primary, tracking `0.08em`, in the form `FROM → TO`. The payload is the whole hop: a model call is the JSON body that was posted, which is the compiled messages plus a tools array when the prompt has a `{{#tools}}` section, and a model reply is the choice object. An MCP hop is the JSON-RPC messages. The payload is a `pre`, `12rem` tall, mono, wrapping. With nothing selected, the label is **SELECT AN ARROW**.

**SESSION** is a primary section heading. **EXPORT SESSION** sits on that row, aligned to the end. It copies the whole trace as JSON: each hop’s turn, from, to, summary, and body. The body is the same payload the inspector shows. Each turn opens with a warning hairline and `TURN N`. A hop is a full-width button:

- Resting: transparent, `1px solid var(--pkd-border-color)`.
- Selected: `var(--pkd-primary)` border, `var(--pkd-primary-bg)` fill, `aria-pressed`.
- First line: `From → To`, primary, xs, tracking `0.06em`.
- Second line: a one-line summary, muted, xs.

Section headings carry a `0.75rem` square in `currentColor`. That pulse is the only decorative motion.

## Color

| Token | Value | Use on the screen |
| --- | --- | --- |
| `--pkd-primary` | `#16479c` | Titles, ON, selected hop, primary buttons |
| `--pkd-primary-light` | `#0c71c3` | Hover |
| `--pkd-primary-dark` | `#0e3270` | Pressed |
| `--pkd-primary-bg` | blue tint | Selected hop, badges, focus ring |
| `--pkd-secondary` | `#44627c` | Tool sandbox |
| `--pkd-accent` | `#ffca7d` | RX-M gold |
| `--pkd-warning` | `#8a5a12` | Empty session, turn rules. Text form of `#ffca7d` |
| `--pkd-destructive` | `#991b1b` | Tool errors |
| `--pkd-background` | `#ebf2fc` | Page |
| `--pkd-background-secondary` | `#ffffff` | Cards and inputs |
| `--pkd-foreground` | `#222222` | Text |
| `--pkd-foreground-muted` | `#757575` | Definitions, summaries |
| `--pkd-border-color` | `#d5deea` | Resting borders |

SVG cannot read these variables. `ArchitectureDiagram.tsx` copies the hex values and says so.

## Type

Palanquin (`--pkd-font-heading`) for headings. Heebo (`--pkd-font-sans` and `--pkd-font-mono`) for buttons, concepts, prompts, hops, and status.

| Token | Size | Use |
| --- | --- | --- |
| `--pkd-text-xs` | `0.75rem` | Labels, summaries, badges |
| `--pkd-text-sm` | `0.9375rem` | Definitions, prompts, inspector, inputs |
| `--pkd-text-base` | `1rem` | Default |
| `--pkd-text-lg` | `1.125rem` | Prominent text |

`pkd-heading` is Palanquin, 700, uppercase, tight tracking. `pkd-heading-2` (`1.125rem`) is the page title. `pkd-heading-3` (`--pkd-text-xs`) is a section label. Buttons are Heebo, 700, uppercase, xs.

## Classes

```html
<button class="pkd-button">[ SEND → AGENT ]</button>
<button class="pkd-button pkd-button-secondary">NEW SESSION</button>
<button class="pkd-button pkd-button-danger">DELETE</button>

<div class="pkd-card">…</div>
<input class="pkd-input" />
<span class="pkd-badge">TURNS: 3</span>

<p class="pkd-text-mono" style="color: var(--pkd-foreground-muted)">…</p>
```

`pkd-card` is white, 8px radius, a 1px border, a soft shadow, and a 2px blue rule on the top edge. `pkd-input` focuses to a blue border and a 3px `--pkd-primary-bg` ring.

`pkd-alert` is a white block with a 3px left rule. `pkd-alert-warning` and `pkd-alert-danger` recolor it. `pkd-spinner` is the loading indicator.

These classes are inert. Do not add them for effect: `pkd-scan-lines`, `pkd-glitch`, `pkd-paranoid-pulse`, `pkd-reality-distort`, `pkd-surveillance-blink`.

Spacing is an 8px grid (`--pkd-grid-size`). Cards pad by 3 units. Radius is 8px on cards, 6px on buttons and inputs, 4px on badges.

## Motion

No glow pulse, scan line, or glitch. The spinner rotates. Section squares pulse. `prefers-reduced-motion` collapses animation and transitions.

## Not the reference

`src/App-pkd.tsx` and `src/components/PKDShowcase.tsx` are older screens. Match `src/App.tsx`.
