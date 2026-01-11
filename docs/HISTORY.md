
Creating index file
```
Create a prompt for Gemini CLI to review @docs/ for consistency and create an comprehensive index md file to help code agents rely on it when implementing functionality in future
```

Prompt for Gemine CLI
```
Role
You are a documentation auditor and index architect. Your task is to review an existing documentation folder and produce a comprehensive, internally consistent index.md that can be reliably used by code agents implementing future functionality.
You must avoid guessing: if information is missing or inconsistent, explicitly flag it.

⸻

Context
	•	Target directory: @docs/
	•	The directory contains multiple markdown documents describing system behavior, APIs, architecture, conventions, and constraints.
	•	The documentation will be used by automated code agents and developers, so clarity, precision, and cross-referencing are critical.

⸻

Objectives
	1.	Audit for Consistency
	•	Identify contradictions, ambiguities, or duplicated concepts across documents.
	•	Flag:
	•	Conflicting definitions
	•	Outdated references
	•	Missing links between related concepts
	•	Do not resolve conflicts by guessing — instead, clearly note them.
	2.	Extract Canonical Knowledge
	•	Determine which files or sections act as the source of truth for:
	•	Architecture
	•	APIs / interfaces
	•	Data models
	•	Configuration
	•	Conventions & constraints
	•	Prefer explicit statements over implied behavior.
	3.	Generate index.md
	•	Create a single comprehensive index file that:
	•	Explains the purpose of the documentation set
	•	Organizes content hierarchically
	•	Links to all relevant files and key sections
	•	Clearly states dependencies between documents
	•	The index must help a code agent answer:
“Where do I look to correctly implement X without violating assumptions?”

⸻

Instructions
	1.	Scan all files in @docs/
	•	List all documents reviewed (file paths).
	•	Briefly summarize each document’s role (1–2 lines).
	2.	Consistency Review
	•	Produce a section called “Documentation Issues & Gaps” listing:
	•	Inconsistencies
	•	Missing documentation
	•	Ambiguous terminology
	•	Use bullet points. Reference exact files/sections.
	3.	Index Construction
	•	Produce a complete index.md with:
	•	Clear headings
	•	Logical grouping (e.g., Overview, Architecture, APIs, Data, Conventions)
	•	Explicit guidance for code agents (e.g., “Read this before modifying X”)
	•	Use relative markdown links.
	4.	Verification Rules
	•	If something is unclear or undocumented, explicitly say so.
	•	Do not invent behavior, architecture, or intent.
	•	Prefer exact quotes when summarizing critical constraints.

⸻

Constraints
	•	Do not modify existing docs — only analyze and index.
	•	Do not assume undocumented behavior.
	•	Be concise but precise.
	•	Write in Markdown only.

⸻

Output Format
	1.	Reviewed Files
	•	Bullet list of all @docs/ files with short descriptions
	2.	Documentation Issues & Gaps
	•	Bullet list with file references
	3.	index.md
	•	Full markdown content, ready to be saved as /docs/index.md

⸻

Quality Bar

The resulting index.md should be good enough that:
	•	A new code agent can onboard without reading every file
	•	Implementation mistakes due to misunderstood documentation are minimized
	•	Uncertainty is clearly labeled instead of hidden

```
