Excellent. Prompt design is **one of the most important parts** of a multi-agent narrative system. Poor prompts will cause instability even if the architecture is good.

Below is a **production-style prompt set** for each agent in your system. These prompts are designed to:

* minimize hallucinations
* enforce structure
* maintain narrative consistency
* reduce token usage

You can store these as **template files** in your project.

Example folder:

```text
prompts/
  storyArchitect.md
  storyDirector.md
  chapterPlanner.md
  writer.md
  validator.md
  memoryExtractor.md
  characterAgent.md
```

---

# 1. Story Architect Prompt

Purpose: build the **initial story framework**.

Input:

* theme
* protagonist
* setting
* genre
* desired length

Prompt template:

```
You are a professional novel architect.

Your task is to design the foundational structure for a long-form novel.

User Input:
Theme: {{theme}}
Protagonist: {{protagonist}}
Setting: {{setting}}
Genre: {{genre}}
Target Chapters: {{chapters}}

Generate a story architecture including:

1. Story premise
2. Main character profiles
3. Major antagonist
4. Core conflict
5. Three-act structure
6. Major plot threads

Return JSON in this format:

{
 "premise":"",
 "characters":[
   {
     "name":"",
     "role":"",
     "personality":[],
     "goals":[]
   }
 ],
 "antagonist":"",
 "core_conflict":"",
 "acts":[
   {"act":1,"description":""},
   {"act":2,"description":""},
   {"act":3,"description":""}
 ],
 "plot_threads":[]
}
```

Output becomes your **Story Bible**.

---

# 2. Story Director Prompt

Purpose: decide **what the next chapter should accomplish**.

Input:

* story bible
* story state
* tension target
* active plot threads
* recent summaries

Prompt:

```
You are the Story Director of a novel generation engine.

Your job is to decide the narrative objective for the next chapter.

Story Bible:
{{story_bible}}

Story State:
{{story_state}}

Active Plot Threads:
{{plot_threads}}

Recent Chapter Summaries:
{{recent_summaries}}

Target Tension Level:
{{target_tension}}

Your task:

Determine the objective of the next chapter.

The chapter should:
- move the story forward
- escalate or resolve at least one plot thread
- maintain pacing appropriate to the tension level

Return JSON:

{
 "chapter_goal":"",
 "focus_threads":[],
 "tension_change":"",
 "key_events":[]
}
```

---

# 3. Chapter Planner Prompt

Purpose: convert the chapter goal into **scene structure**.

Prompt:

```
You are a narrative scene planner.

Your task is to convert a chapter goal into a sequence of scenes.

Chapter Objective:
{{chapter_goal}}

Active Characters:
{{characters}}

Target Tension:
{{target_tension}}

Generate 3-6 scenes.

Each scene must include:
- location
- characters present
- narrative purpose
- tension level

Return JSON:

{
 "scenes":[
   {
     "scene_number":1,
     "location":"",
     "characters":[],
     "purpose":"",
     "tension":0.0
   }
 ]
}
```

---

# 4. Writer Agent Prompt

Purpose: generate the **actual prose**.

Prompt:

```
You are a professional novelist.

Write a chapter following the provided scene plan.

Story Canon (never contradict):
{{canon}}

Relevant Story Memories:
{{retrieved_memories}}

Character States:
{{character_states}}

Scene Plan:
{{scene_plan}}

Rules:
- Follow the scene order
- Maintain character personalities
- Maintain continuity with canon
- Write immersive narrative prose
- Do not summarize events

Write the chapter in full narrative form.
```

---

# 5. Completeness Checker Prompt

This avoids truncated chapters.

```
Determine whether the chapter text ends at a natural stopping point.

Chapter Text:
{{chapter_text}}

Return only one word:

COMPLETE
or
INCOMPLETE
```

If `INCOMPLETE`, call the writer again:

```
Continue the chapter until it reaches a natural ending.
Do not repeat text.
```

---

# 6. Memory Extraction Prompt

Purpose: convert narrative text into **structured memory**.

Prompt:

```
Extract narrative information from the chapter.

Chapter Text:
{{chapter}}

Return JSON with:

{
 "facts":[],
 "events":[],
 "character_changes":[],
 "plot_updates":[],
 "locations":[]
}

Guidelines:
- Facts must be objective truths.
- Events are things that happened in this chapter.
- Character changes describe emotional or relationship shifts.
- Plot updates describe developments in plot threads.
```

These entries are stored in **vector memory**.

---

# 7. Character Agent Prompt

Used in the **world simulation layer**.

Prompt:

```
You are simulating the decision making of a fictional character.

Character Profile:
{{character_profile}}

Current Goals:
{{goals}}

Knowledge:
{{knowledge}}

Current Situation:
{{world_state}}

What action would this character attempt next?

Return JSON:

{
 "action":"",
 "motivation":"",
 "target":""
}
```

---

# 8. Constraint Validator Prompt

Purpose: detect contradictions.

Prompt:

```
Check the chapter for logical inconsistencies.

Canon:
{{canon}}

World State:
{{world_state}}

Constraint Graph:
{{constraint_graph}}

Chapter Text:
{{chapter}}

Look for violations involving:
- canon facts
- character knowledge
- locations
- timeline order

Return JSON:

{
 "valid":true/false,
 "violations":[]
}
```

---

# 9. Plot Thread Updater Prompt

```
Update the status of plot threads based on the new chapter.

Existing Threads:
{{plot_threads}}

Chapter Summary:
{{summary}}

Return JSON:

{
 "threads":[
   {
     "id":"",
     "status":"active/resolved/escalating",
     "tension":0.0
   }
 ]
}
```

---

# 10. Chapter Summary Prompt

Keep summaries **short and factual**.

```
Summarize the chapter in under 120 tokens.

Focus on:
- major events
- plot progress
- important character changes
```

---

# Prompt Stability Tips

### 1. Always force JSON outputs

Prevents parsing errors.

### 2. Use small prompts for utility agents

Example:

* validator
* completeness checker

### 3. Keep writer prompt larger

This is where narrative creativity happens.

---

# Recommended LLM Role Assignment

Different agents can use **different model sizes**.

Example:

Director / Writer → large model
Validator / Extractor → smaller model

This reduces cost dramatically.

---

# Testing Strategy

Before building the full pipeline:

Test agents **individually**.

Example CLI command:

```bash
node test/storyDirector.js
```

Feed mock data.

---

# Final Advice

Do not try to perfect prompts immediately.

Use this workflow:

```
build pipeline
run story
observe failures
refine prompts
repeat
```

Your architecture is strong enough that **most improvements will come from prompt iteration**.

---

If you want, I can also show you something **very useful for actually running this system**:

A **complete orchestration loop (pseudo-code + TypeScript structure)** for the entire engine — the piece that ties all agents together.
