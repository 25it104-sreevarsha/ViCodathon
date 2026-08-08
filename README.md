# 🧠 Interviewer OS

### **An AI Technical Interviewer That Learns About You While It Interviews You.**

> **Not a scripted quiz. Not just another chatbot.**
> Interviewer OS conducts adaptive technical interviews based on a candidate's learning journey, evaluates every answer, remembers knowledge gaps, and dynamically decides what to ask next.

---

## 🚀 The Idea

Traditional AI interviewers often follow a predictable pattern:

**Question → Answer → Question → Answer → Feedback**

**Interviewer OS works differently.**

It combines the candidate's **learning history**, **curriculum**, **previous answers**, and **AI-powered evaluation** to continuously understand the candidate and adapt the interview in real time.

### Our core loop

```text
Candidate Profile + Curriculum
              ↓
      🧠 Interview Planner
              ↓
          Question
              ↓
      Candidate's Answer
              ↓
       🔍 AI Evaluation
              ↓
     Identify Strengths/Gaps
              ↓
        🧠 Memory Layer
              ↓
      Adaptive Follow-up
              ↓
        Next Question
              ↓
           ...8–10×
              ↓
       📊 Final Assessment
```

---

# ✨ Key Features

### 🎯 1. Personalized Interview Planning

The interviewer doesn't treat every candidate the same.

It considers:

* Completed curriculum days
* Attempted and skipped topics
* Learning signals
* Previously evaluated concepts
* Current interview performance

This creates a candidate-specific interview rather than a fixed question list.

---

### 🧠 2. Adaptive Questioning

Every answer influences what happens next.

A strong answer can trigger a **harder, deeper question**.

A weak or incomplete answer can trigger a **targeted follow-up**.

```text
Strong Answer
     ↓
Increase Difficulty
     ↓
Deeper Technical Question
```

```text
Weak Answer
     ↓
Identify Knowledge Gap
     ↓
Targeted Follow-up
```

The result is an interview that **evolves with the candidate**.

---

### 🔍 3. AI-Powered Answer Evaluation

Each response is analyzed for multiple dimensions, including:

* Correctness
* Technical depth
* Reasoning
* Conceptual clarity
* Missing concepts
* Misconceptions

The evaluation is structured so the system can use it to decide the next question.

---

### 🧠 4. Persistent Interview Memory

Powered by **Breeth**, the interviewer can retain useful insights about the candidate during the interview.

For example:

```text
Candidate Understanding

RAG
✓ Understands basic retrieval
✓ Understands embeddings
⚠ Weak on chunking trade-offs

Agentic AI
✓ Strong conceptual understanding

Vector Databases
⚠ Needs deeper evaluation
```

This memory isn't just conversation history.

**It represents what the interviewer has learned about the candidate.**

---

### 📈 5. Dynamic Difficulty

The interview can move between:

**Concept → Application → Reasoning → System Design → Edge Cases**

Instead of asking ten questions of the same difficulty, Interviewer OS adjusts the challenge according to demonstrated understanding.

---

### 🔄 6. Interview Context Retention

The interviewer remembers what was discussed earlier in the same session.

A candidate's earlier answer can become the basis for a later question.

Example:

> Candidate explains their RAG implementation.

Later:

> "Earlier you mentioned fixed-size chunking. What trade-offs did that introduce in your retrieval pipeline?"

This creates a more natural technical interview experience.

---

### 📊 7. Evidence-Based Final Report

After the interview, the system generates a structured assessment containing:

* Overall performance
* Technical strengths
* Weaknesses
* Conceptual gaps
* Misconceptions
* Topic-wise performance
* Recommended areas for improvement

Instead of generic feedback like:

> "You should improve RAG."

the system can provide evidence such as:

> "You correctly explained the retrieval-generation flow but struggled to explain how chunking affects retrieval quality."

---

### 🔎 8. Interview Replay

A judge or user can inspect **why the interview changed direction**.

```text
Question
   ↓
Candidate Answer
   ↓
AI Evaluation
   ↓
Knowledge Gap Detected
   ↓
Follow-up Selected
   ↓
Next Question
```

This makes the adaptive nature of the system visible instead of hiding it behind the AI.

---

# 🆚 What Already Exists?

AI interview platforms already exist and can:

* Ask technical questions
* Evaluate responses
* Generate feedback
* Simulate interview conversations

However, many conventional implementations behave primarily like:

```text
Question Bank
      ↓
Question
      ↓
Answer
      ↓
Evaluation
      ↓
Next Question
```

The experience can become similar to an AI-powered question-and-answer session.

---

# 💡 What Makes Interviewer OS Different?

## **We don't just evaluate the answer. We use the answer to decide what happens next.**

Our system combines four layers:

```text
          📚 Curriculum
               +
          👤 Candidate
               +
          🧠 Interview Memory
               +
          🔍 Answer Analysis
               ↓
       Adaptive Interview
```

### Our key differentiators

| Traditional AI Interview      | Interviewer OS                     |
| ----------------------------- | ---------------------------------- |
| Fixed or semi-fixed questions | Dynamically selected questions     |
| Generic candidate experience  | Candidate-specific interview       |
| Evaluates answers             | Uses evaluation to adapt           |
| Conversation history          | Structured candidate understanding |
| Same difficulty               | Dynamic difficulty                 |
| Generic feedback              | Evidence-based feedback            |
| Question → Answer flow        | Learning-gap → targeted assessment |
| Final score                   | Full technical profile             |

---

# 🏆 Our Unique Concept

### **The interviewer itself becomes a learner.**

During the interview, it continuously builds an internal understanding of:

> **"What does this candidate actually know?"**

It then uses that understanding to decide:

> **"What should I ask next to assess them better?"**

That creates a feedback loop:

```text
ASK
 ↓
LISTEN
 ↓
UNDERSTAND
 ↓
REMEMBER
 ↓
ADAPT
 ↓
ASK BETTER
```

This is the core idea behind Interviewer OS.

---

# 🛠️ Tech Stack

### Frontend

* **React**
* **Vite**
* **Tailwind CSS**
* **Framer Motion**

Used for the interactive interview experience, candidate dashboard, assessment report, and interview replay.

### Backend

* **Node.js**
* **Express.js**

Handles interview sessions, AI orchestration, evaluation, memory operations, and API endpoints.

### AI Layer

* **LLM-powered question generation**
* **Structured answer evaluation**
* **Adaptive follow-up generation**
* **Final candidate assessment**

### Memory

* **Breeth**

Used as the intelligent memory layer for retaining useful candidate insights during the interview.

### Data

* Hackathon-provided **Curriculum**
* Hackathon-provided **Candidate Profiles**
* Structured interview/session data

### Deployment

* **Vercel** — Frontend
* **Production backend hosting** — API & AI services

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │  Candidate Profile   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │      Curriculum      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Interview Planner   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Question Generator   │
                    └──────────┬───────────┘
                               │
                               ▼
                         Candidate
                           Answer
                               │
                               ▼
                    ┌──────────────────────┐
                    │   AI Evaluator       │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
          ┌──────────────┐          ┌────────────────┐
          │ Breeth       │          │ Follow-up      │
          │ Memory       │          │ Engine         │
          └──────┬───────┘          └───────┬────────┘
                 │                          │
                 └────────────┬─────────────┘
                              ▼
                       Next Question
                              │
                              ▼
                       Final Evaluator
                              │
                              ▼
                     📊 Interview Report
```

---

# 🎯 Hackathon Requirement Coverage

Interviewer OS is designed around the PS2 requirements:

* ✅ Conversational technical interview
* ✅ Minimum 8 questions
* ✅ Coverage across at least 4 curriculum days
* ✅ Adaptive follow-up questions
* ✅ Context retention
* ✅ Structured feedback
* ✅ Candidate-specific interview
* ✅ Public GitHub repository
* ✅ Live deployed application
* ✅ Required API implementation
* ✅ AI usage documentation through `PROMPTS.md`

---

# 📂 Project Structure

```text
interviewer-os/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── backend/
│   └── src/
│       ├── agent/
│       ├── api/
│       ├── candidates/
│       ├── curriculum/
│       ├── memory/
│       ├── prompts/
│       └── storage/
│
├── data/
│   ├── curriculum.json
│   └── candidates.json
│
├── docs/
│
├── PROMPTS.md
├── README.md
├── .env.example
└── package.json
```

---

# 🔮 Future Scope

Interviewer OS can eventually evolve into a complete technical assessment platform with:

* Multi-domain interviews
* Interview history
* Candidate progress tracking
* Role-specific interviews
* Company-specific interview rubrics
* Coding challenges
* Voice-based interviews
* Team/enterprise dashboards
* Long-term candidate skill graphs

---

# 👥 Team

### Genzspark

**R.M.K. Engineering College**

Built for the **ABTalks Vibe Code Hackathon 2026**.

---

## 💭 One-Line Pitch

> **Interviewer OS is an adaptive AI technical interviewer that remembers what you know, identifies what you don't, and changes the interview accordingly.**

---

### ⭐ The Philosophy

**Don't ask more questions.**

**Ask better questions.**
