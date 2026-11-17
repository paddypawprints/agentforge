# Demonstration

A live walk-through of one session. The room sees Bob Smith’s pay, then an estimate of his Social Security at 67, using the in-page HR tools and Retirement Buddy.

Run the app with `npm run dev` and open `http://localhost:3000/agentforge/`. The static site cannot reach Ollama or a public MCP server.

---

## Before anyone sits down

1. Ollama is running and `qwen3.5:9b` is pulled.
2. On the model card: Ollama, `qwen3.5:9b`, reasoning effort **none**, temperature 1.
3. Mode is **Agent Loop**. Memory is **on**. Grounding is **off**. The embedded tool is **off**.
4. MCP is **on**. These three servers are checked:
   - **salary**, in the page, `/mcp/salary`
   - **retirement**, in the page, `/mcp/retirement`
   - **retirement-buddy**, Streamable HTTP, `https://mcp.yourretirementbuddy.com/mcp`
5. The helper on **retirement-buddy** is:

```text
Call compare_social_security_claiming_ages before run_retirement_check. Portfolio is vested_balance plus any other amount in the message. Annual spending comes from the message. Savings rate is the employee contribution as a fraction. Annual income is base pay plus bonus. Birth year is 2026 minus current age.
```

6. Press **RESET** on the agent, planner, and worker prompts if `{{mcp-helper}}` is missing.
7. Press **NEW SESSION**. The trace should open with six hops: initialize, then tools/list, for salary, retirement, and retirement-buddy. Point at one pair so the room sees the JSON-RPC, not a summary.

Say: the harness asked each server what it can do before anyone typed. Salary and retirement answered from this page. Retirement Buddy answered over HTTPS. The catalog in the prompt is that list. The helper is a note we wrote. It is not part of what the server returned.

---

## The records to keep in your head

Bob Smith is EMP002.

| | |
|---|---|
| Age | 34 |
| Base pay | 98000 |
| Bonus | 8% |
| Band | L3 |
| Income, base plus bonus | 105840 |
| Birth year, 2026 minus 34 | 1992 |
| 401(k) contribution | 4% |
| Vested balance | 31000 |

`employee_lookup` returns only the id. Pay is a second call. Age and the vested balance are a third call.

---

## Turn 1 — What is Bob’s income?

Type:

```text
what is Bob Smith's income?
```

What the room should see:

1. **User → Harness.** The typed sentence.
2. **Harness → Agent.** The agent prompt lists the three MCP servers and the retirement-buddy helper. There is no tools array. Say: the agent is not allowed to call a tool. It only chooses chat or a workflow.
3. **Agent → Harness.** `{"route":"workflow"}`.
4. **Harness → Planner.** Same catalog and the same helper. The planner must name tools. It does not call them.
5. **Planner → Harness.** Two tasks: `employee_lookup` to find Bob, then `salary_lookup` with that id.
6. **Harness → Worker**, first step. The tools array contains only `employee_lookup`, because that is the name on this task. The helper is still in the message, and it does not add Retirement Buddy to the array.
7. **Worker → Harness.** A tool call, `employee_lookup`, argument `name` set to `Bob Smith`.
8. **Harness → MCP → Harness.** Salary server, in the page. The result is `EMP002` and nothing else.
9. **Worker → Harness.** “Bob Smith's employee ID is EMP002.”
10. **Harness → Worker**, second step. `{{task-history}}` now contains that sentence. The tools array is only `salary_lookup`.
11. **Worker → Harness.** `salary_lookup` with `employee_id` `EMP002`.
12. **MCP.** `base_pay` 98000, `bonus_percent` 8, `band` L3.
13. **Summarizer → Harness → User.** A short reply: base salary $98,000, 8% bonus, Band L3.

Say: the id and the pay were two steps because the first tool refuses to return the salary. The second worker could use EMP002 because the first result was in the task history, not because the model remembered it.

Click **EXPORT SESSION** if you want the JSON for later. The button copies the whole trace.

---

## Turn 2 — Social Security at 67

Leave the session up. Memory now holds the first question and the reply the room just saw. It does not hold the tool JSON.

Type:

```text
estimate his social security payment if he retires at 67.
```

What the room should see:

1. **Memory → Harness.** One prior turn: the income question and the $98,000 reply.
2. **Agent → Harness.** `{"route":"workflow"}` again. The helper says a Retirement Buddy tool is required, so a direct answer would be a guess.
3. **Planner → Harness.** One task, tool `compare_social_security_claiming_ages`.
4. **Harness → Worker.** The tools array offers that one function. It needs `birth_year` and `current_annual_income`. The tables do not store a birth year. Income is base pay plus the bonus, which this reply did not add up.

The recorded session then wandered, and that is worth showing if it happens again:

- The worker called `employee_lookup` and `salary_lookup` even though those names were not on this task. The harness still runs a tool it knows.
- It called `retirement_lookup` and got age 34, contribution 4%, vested balance 31000.
- It then called `compare_social_security_claiming_ages` with `birth_year` 1989 and `current_annual_income` 97040.

Those two arguments are not the figures in the tables. Age 34 in 2026 is 1992, not 1989. Base 98000 plus an 8% bonus is 105840, not 97040. If the model repeats them, say so, and point at the DATA card.

The Retirement Buddy result in the recording, for those arguments:

| Claiming age | Monthly | Annual |
|---|---|---|
| 62 | 1971.20 | 23654.40 |
| 67 | 2816 | 33792 |
| 70 | 3491.84 | 41902.08 |

Full retirement age 67. The 62-versus-70 break-even was 80 years 4 months. The 67-versus-70 break-even was 82 years 6 months.

5. **Summarizer → User.** “Based on your projected income and retirement age of 67, your estimated Social Security benefits are $2,816 per month or $33,792 annually.”

Say: that monthly number is what a later retirement check should pass as `social_security_monthly`. It is an estimate from current pay, not an SSA statement. The helper told the planner to call this tool before `run_retirement_check`. This turn stopped after the first of those two tools.

---

## Turn 3 — Will the savings last?

The recorded session did not ask this. The helper is written for it. Annual spending and any extra savings are not in the tables, so they have to be in the sentence.

Type:

```text
He also has $10,000 in other retirement savings and expects to spend $60,000 a year. Will that last if he retires at 67?
```

Tell the room what a faithful plan looks like before the model answers:

1. `retirement_lookup` for EMP002, if this turn does not already have the age and the vested balance.
2. `compare_social_security_claiming_ages` if this turn does not already have the monthly benefit. Birth year 1992. Income 105840.
3. `run_retirement_check` with:
   - `current_age` 34
   - `retirement_age` 67
   - `portfolio` 41000, which is the 31000 vested balance plus the 10000 in the message
   - `annual_spending` 60000
   - `annual_income` 105840
   - `savings_rate` 0.04
   - `social_security_monthly` taken from the age-67 figure in the earlier result

The worker for the last step has to read those numbers out of `{{task-history}}` or out of memory’s reply. Memory only has the reply the user saw, so a plan that puts the lookup and the check in one workflow is the reliable path.

If the worker calls a tool that was not on the task, or invents the birth year or the income, stop on that hop and read the arguments against the DATA card. That is the demonstration: the helper is advice in the prompt, and the trace shows whether the model followed it.
