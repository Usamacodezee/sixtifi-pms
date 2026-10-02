# Sixtifi Performance Management — End-to-End Flow Guide

In-depth walkthrough of how Performance works in this **Vite SPA demo** (`pnpm run dev`).  
All data is in-memory mock state (resets on full page reload / process restart).

Use the role switcher in the app shell to move between **Employee**, **Manager**, and **HR/Admin**.

---

## 1. What this module covers

| Area | Modules in the drawer | Purpose |
|------|------------------------|---------|
| Visibility | Dashboard, My Performance, Team Performance, Reports | See status and outcomes |
| Execution | Goals, Review Cycles, Reviews | Set goals, run a cycle, complete reviews |
| Configuration | Settings | Defaults, reference data, competencies, questions, ratings |

**Settings IA (HR):** Goal Settings · Review & Rating · **Reference Data** (Result Areas, Metrics) · **Competency** (Templates, Mapping) · **Questions** (Templates, Mapping).  
Cycle type, weights, review flow, and employee policies are set in **Create Cycle**, not in General settings.

**Not in the drawer (by design):** Tasks inbox, Feedback, Calibration 9-box, Development Plans. Result Areas / Metrics live under Settings → Reference Data.

---

## 2. Personas & demo identities

| Role | Who they represent in the demo | Typical access |
|------|--------------------------------|----------------|
| **Employee** | Rahul Shah (self) | Dashboard, My Performance, Goals (Mine + Company), Reviews |
| **Manager** | Vikram Patel / Priya Sharma style manager | Everything Employee has + Team Performance, Result Areas, Metrics |
| **HR/Admin** | HR operator | Full drawer including Review Cycles, Reports, Settings |

### Identity bridges (important for demos)

| Context | ID | Name |
|---------|----|------|
| Cycles / Reviews world | `emp-1` | Rahul Shah |
| My Team / Manager Review world | `tm-1` | Same person bridged in `App.tsx` |
| Self name in Goals | Rahul Shah | Manager shown as Vikram Patel |

Switching role **does not** log in as a different user — it changes which menus and screens you can open. Deep links that the new role cannot access redirect to Dashboard.

---

## 3. Module map (route ↔ screen)

| Drawer label | Route | Who sees it |
|--------------|-------|-------------|
| Dashboard | `#/performance` | All |
| My Performance | `#/performance/my-performance` | All |
| Team Performance | `#/performance/my-team` | Manager, HR/Admin |
| Goals | `#/performance/goals` (tabs: `/my`, `/team`, `/overall`) | All (Team tab Manager+) |
| Review Cycles | `#/performance/cycles` | HR/Admin |
| Reviews | `#/performance/reviews` | All |
| Reports | `#/performance/reports` | HR/Admin |
| Settings | `#/performance/settings` (see Settings IA) | HR/Admin |
| → Reference Data | `#/performance/settings/result-areas`, `.../metrics` | HR/Admin |
| → Competency | `#/performance/settings/competencies`, `.../competency-mapping` | HR/Admin |
| → Questions | `#/performance/settings/question-templates`, `.../question-mapping` | HR/Admin |

Hash routing: the app reads/writes `window.location.hash`.

---

## 4. Master lifecycle (happy path)

End-to-end story you can narrate in ~15–20 minutes.

```text
[HR] Settings defaults
        ↓
[HR] Result Areas + Metrics libraries
        ↓
[HR] Create Review Cycle (wizard) → Draft → Activate
        ↓
[Employee / Manager] Create & update Goals (Mine / Team / Company)
        ↓
[Employee] Self Review          ⎫
[Manager]  Manager Review       ⎬ depends on Review Flow preset
[HR]       Admin / Final Review ⎭
        ↓
[All] Reviews list + My/Team Performance status
        ↓
[HR] Reports + rating visibility settings
```

### Example narrative (full flow)

1. HR opens **Result Areas**, shows “Revenue Growth”, then **Metrics** “New ARR”.  
2. HR creates cycle **H1 Demo 2025** via wizard and picks review flow **Self → Manager → Admin** (step 3).  
3. (Optional) HR tunes rating scale / visibility under **Settings → Review & Rating**.  
4. Switch to **Employee**: Goals → Mine → add goal weighted 40%, update progress to 60%.  
5. My Performance → start **Self Review** → save draft → submit.  
6. Switch to **Manager**: Team Performance → open report → complete Manager Review.  
7. Switch to **HR/Admin**: Cycle detail → Reviews → open employee → complete Admin Review.  
8. Switch back to **Employee**: My Performance shows completed cycle (if visibility allows).  
9. HR opens **Reports** for distribution / completion story.

---

## 5. Role-by-role flows

### 5.1 Employee

**Menu:** Dashboard · My Performance · Goals · Reviews

| Step | Action | Where | Outcome |
|------|--------|-------|---------|
| E1 | Open Dashboard | `/performance` | Snapshot of personal milestones |
| E2 | Open Goals → **Mine** | `/performance/goals/my` | List of personal goals |
| E3 | Add goal (optional) | Create Goal modal | New goal on Mine list |
| E4 | Update progress | Update Progress modal | Progress % + Current stay in sync |
| E5 | View Company goals | Goals → **Company** | Read company priorities |
| E6 | Open My Performance | `/performance/my-performance` | Cycle banner + stage status |
| E7 | Self Review (if flow includes Self) | `/performance/my-performance/self-review` | Draft → Submit |
| E8 | Open Reviews list | `/performance/reviews` | Queue; Open review deep-links |

**Employee cannot:** Team Goals tab, Team Performance, Result Areas, Metrics, Cycles, Reports, Settings.

---

### 5.2 Manager

**Extra vs Employee:** Team Performance · Result Areas · Metrics · Goals → **Team**

| Step | Action | Where | Outcome |
|------|--------|-------|---------|
| M1 | Team Goals | `/performance/goals/team` | See / create goals for reports |
| M2 | Assign goal to teammate | Create Goal (Team mode) | Goal appears under selected employee |
| M3 | Team Performance | `/performance/my-team` | Direct reports scorecards |
| M4 | Open member | `/performance/my-team/:id` | Goals / review tabs |
| M5 | Manager Review | `/performance/my-team/:id/review` | Rate goals + competencies + overall |
| M6 | Browse Result Areas / Metrics | `/kras`, `/kpis` | Library for alignment talk track |

---

### 5.3 HR/Admin

**Extra vs Manager:** Review Cycles · Reports · Settings · full cycle ops

| Step | Action | Where | Outcome |
|------|--------|-------|---------|
| H1 | Configure defaults | Settings → General / Goals / Review & Rating | Company-wide behavior |
| H2 | Templates & mappings | Question Templates, Question Mapping, Competencies | Forms used in reviews |
| H3 | Create cycle | Cycles → Create | Draft cycle added to list |
| H4 | Operate cycle | `/performance/cycles/:id` | Employees / Goals / Reviews tabs |
| H5 | Admin / Final Review | Cycle → Reviews → Final Review | Finalize rating |
| H6 | Reports | `/performance/reports` | Export / filters (demo) |

---

## 6. Review flow presets (every case)

Configured **only** in:

- **Create Cycle wizard → Performance Setup** (per cycle)

My Performance / reviews use the **Active** cycle’s stored `reviewFlow`.

| Preset ID | UI label | Stages | Who acts |
|-----------|----------|--------|----------|
| `self_manager_admin` | Self + Manager + Admin Review | Self → Manager → Admin | Employee → Manager → HR |
| `manager_admin` | Manager + Admin Review | Manager → Admin | Manager → HR (no self) |
| `manager_only` | Manager Review Only | Manager | Manager only |

### Case A — Self + Manager + Admin (default)

```text
Self Pending → Self Completed → Manager Pending → Manager Completed → Admin Pending → Completed
```

| Stage state | My Performance “Current Stage” | Banner progress text |
|-------------|-------------------------------|----------------------|
| Self not done | Self Review | Self Review Pending |
| Self done, manager not | Manager Review | Manager Review Pending |
| Manager done, admin not | Admin Review | Awaiting Admin Review |
| Admin done | Completed | Review Completed |

**Example:** Employee submits self review → Manager finishes review for `tm-1` → HR completes final review for `emp-1` → Employee sees completed cycle.

### Case B — Manager + Admin (no self)

```text
Manager Pending → Manager Completed → Admin Pending → Completed
```

| Behavior | Detail |
|----------|--------|
| Self Review CTA | Hidden / treated as skipped (`effectiveSelfReviewDone = true`) |
| First actionable stage | Manager Review |
| Cycle complete when | Admin final decision status = Completed |

**Example:** Create (or activate) a cycle with Manager → Admin flow, then open My Performance as Employee — stage starts at Manager Review without asking for self assessment.

### Case C — Manager only

```text
Manager Pending → Completed (when manager submits)
```

| Behavior | Detail |
|----------|--------|
| Self | Skipped |
| Admin / Final | Skipped (`includesAdmin = false`) |
| Cycle complete when | Manager review is done |

**Example:** Small companies / continuous appraisal style — manager rating is the final rating.

### Edge cases (review flow)

| Case | What happens |
|------|----------------|
| Active cycle’s review flow differs from a draft cycle | My Performance follows the **Active** cycle only |
| Admin completed while self was never done | Upstream stages treated as done for UI (`isFinalReviewCompleted` short-circuits) |
| Employee visibility hides final score/rating | Cycle can be complete but result cards partially hidden |
| Manager comments hidden | Comments section suppressed even if review exists |
| Competency scores hidden | Competency breakdown suppressed |

Visibility toggles live under **Settings → Review & Rating → Employee Visibility**:

- Show final rating  
- Show final score  
- Show manager comments  
- Show competency scores  

---

## 7. Goals flow (every case)

### 7.1 Tabs

| Tab | Route | Roles | Create? | Meaning |
|-----|-------|-------|---------|---------|
| **Mine** | `/performance/goals/my` | All | Yes | Logged-in employee’s goals |
| **Team** | `/performance/goals/team` | Manager, HR | Yes (pick employee) | Direct report goals |
| **Company** | `/performance/goals/overall` | All | HR/Manager create in UI | Company-level priorities |

Default tab for every role: **Mine**.

### 7.2 Company scope

Goals are scoped by `companyId`:

| Company | ID |
|---------|----|
| Sixtifi Technologies | `co-sixtifi` (default) |
| Northstar Retail Pvt Ltd | `co-northstar` |

**Case — switch company:** Change company chip on Goals → lists filter to that company’s goals. Creating a goal stores the active `companyId`.

### 7.3 Create goal

Goals across **Mine / Team / Company** are created using `CreateGoalModal` based directly on the configured **Result Areas (KRAs)** and **Metrics (KPIs)**:

- **Result Area (KRA) Selection**: Required dropdown picking from active KRAs (*Revenue Growth*, *Product Delivery Excellence*, *Customer Retention*, *People Leadership*).
- **Metric (KPI) Selection**: Required dropdown filtering metrics linked to the selected KRA (*New ARR*, *Win Rate*, *Sprint Predictability*, *Production Incidents*, *Logo Churn*).
- **Autofilled Reference Standards**:
  - Selecting a KRA pre-populates the KRA's `weightHint` into Goal Weight and description into Goal Description.
  - Selecting a KPI pre-populates Goal Title and Target Unit expectations (`₹ Crore`, `%`, `Count`, `Score / 5`).
- **Weight rule (explained in UI):** Across one person’s goals for the cycle, weights should add to **100%**.  
  Example: 40% + 25% + 20% + 15% = 100%.

| Case | Result |
|------|--------|
| Create on Mine | Appears under Mine for Rahul Shah linked to selected KRA/KPI |
| Create on Team for Sneha | Appears in Team list under that member linked to selected KRA/KPI |
| Create on Company | Appears in Company tab for active company linked to selected KRA/KPI |
| Weight left at 20 | Valid; pre-populated from KRA weight hint |

### 7.4 Progress update & sync

Open a goal → **Update Progress**:

| You edit | System syncs |
|----------|--------------|
| Progress % | Recalculates **Current** (scales previous Current when possible; else uses Target) |
| Current value | Recalculates Progress % from Target / prior pair |

Examples:
- Target `₹1 Crore`, current `₹50 Lakh` (50%), set percent to 80% → current becomes `₹80 Lakh`.
- Target `90%`, set current to `45%` → percent becomes 50%.

### 7.5 Single Goal Review & Ad-Hoc Evaluation

Managers can evaluate individual goals both ad-hoc during the cycle and during formal appraisal reviews:

| Review Mode | Where to Access | Capabilities & Business Rules |
|-------------|-----------------|-------------------------------|
| **Ad-Hoc Goal Review** | Goal Detail page (`#/performance/cycles/:cycleId/goals/:goalId` and `MyGoalDetailView`) | Managers can review and rate a goal **only after its target due date has passed OR when its status is marked as Completed**. Active goals whose due date is in the future display a locked state with instructions. |
| **Cycle Appraisal Session** | Manager Review wizard (`#/performance/my-team/:id/review`) | Single goal ratings & manager comments saved ad-hoc are **automatically pre-filled** into Section 1 with a `Pre-filled from Single Goal Review` badge indicator. Managers can refine or confirm these ratings before submitting the final appraisal. |




| Target | Previous Current | Previous Progress | New Progress | New Current |
|--------|------------------|-------------------|--------------|-------------|
| ₹1 Crore | ₹50 Lakh | 50% | 80% | ₹80 Lakh (scaled) |
| 90% | 45% | 50% | 100% | 90% |
| Non-numeric target | — | — | 40% | `40% Complete` fallback |

### 7.5 Goal status from progress

`calculateGoalStatus(progress)`:

| Progress | Status |
|----------|--------|
| ≥ 100 | Completed |
| ≥ 70 | On Track |
| ≥ 50 | At Risk |
| &lt; 50 | Needs Attention |

**Examples**

| Progress | Status |
|----------|--------|
| 0–49 | Needs Attention |
| 50–69 | At Risk |
| 70–99 | On Track |
| 100 | Completed |

### 7.6 Goals × reviews

- Self Review / Manager Review pull goal list for rating.  
- Final / Admin Review combines goals + competencies with weightages from cycle setup (typically Goals/KPI vs Competencies, default **70 / 30**).

---

## 8. Result Areas & Metrics (libraries)

Friendly names in UI; routes keep `/kras` and `/kpis`.

### Result Areas (`/performance/kras`)

| Field | Meaning | Example |
|-------|---------|---------|
| Code | Short id | `KRA-REV` |
| Name | Focus area | Revenue Growth |
| Department | Scope | Sales / Engineering / All |
| Linked metrics | Count of Metrics | 3 |
| Suggested weight | Planning hint | 30% |
| Status | Active / Draft / Archived | Active |

**Cases**

| Case | Steps |
|------|-------|
| Browse | Search / filter by status |
| Open row | Detail panel with description |
| View metrics | Action → navigates to Metrics |
| Add result area | Toast demo create (session mock) |

### Metrics (`/performance/kpis`)

| Field | Meaning | Example |
|-------|---------|---------|
| Code | Short id | `KPI-ARR` |
| Name | Metric | New ARR |
| Result area | Parent | Revenue Growth |
| Unit | Measure | ₹ Crore, %, Count |
| Tracked | Frequency | Monthly / Quarterly / Annual |
| Success means | Direction | Higher is better / Lower is better / Target band |
| Status | Active / Draft / Archived | Active |

**Direction cases**

| Direction | When to use | Example metric |
|-----------|-------------|----------------|
| Higher is better | Growth outcomes | New ARR, Win Rate |
| Lower is better | Risk / defect outcomes | Production Incidents, Logo Churn |
| Target band | Stay in a range | Sprint Predictability |

---

## 9. Review Cycles flow

**Who:** HR/Admin only.

### 9.1 Cycle statuses

| Status | Meaning | Typical actions |
|--------|---------|-----------------|
| Draft | Not launched | Edit, Preview, Activate, Delete |
| Active | Running | View, Edit, Close |
| Completed | Finished | View |
| Archived | Historical | View |

Seed examples include Active FY cycle, Completed past cycles, and a Draft.

### 9.2 Create Cycle wizard (4 steps)

Route: `/performance/cycles/create`

| Step | Title | What you set | Validation cases |
|------|-------|--------------|------------------|
| 1 | Basic Details | Name, type, dates, description | Missing name / invalid date range blocks Next |
| 2 | Select Employees | Population mode | Must select something for dept/designation/specific |
| 3 | Performance Setup | Weights, review flow, deadlines, goal approval flag | Weights should make sense (Goals + Competencies) |
| 4 | Review & Create | Summary | Creates **Draft** cycle and returns to list |

#### Step 2 — population modes (every case)

| Mode | Behavior | Example |
|------|----------|---------|
| All | Entire org (~248 in mock) | Company-wide annual |
| Department | Sum of selected dept headcounts | Engineering + Sales |
| Designation | Sum of selected designations | Managers only |
| Specific | Exact employee IDs | Pilot group of 5 |

#### Step 3 — performance setup cases

| Setting | Options / notes |
|---------|-----------------|
| Goals / KPI weight | Default often 70 |
| Competencies weight | Default often 30 |
| Review flow | One of the 3 presets |
| Require goal approval | On/Off (demo flag) |
| Self / Manager deadlines | Shown when those stages exist |

**Weight cases**

| Goals % | Competencies % | Talk track |
|---------|----------------|------------|
| 70 | 30 | Balanced default |
| 100 | 0 | Goals-only appraisal |
| 50 | 50 | Equal split |
| 0 | 100 | Competency-only (unusual; show as edge) |

### 9.3 Cycle detail

Route: `/performance/cycles/:cycleId` with tabs:

| Tab | Route suffix | Content |
|-----|--------------|---------|
| Overview | `/overview` | Summary / health |
| Employees | `/employees` | Population + drill-in |
| Goals | `/goals` | Cycle goals list |
| Reviews | `/reviews` | Per-employee review pipeline |

**Drill-ins**

| From | To |
|------|----|
| Employee row | `/cycles/:id/employees/:empId` |
| Goal row | `/cycles/:id/goals/:goalId` |
| Review row | `/cycles/:id/reviews/:reviewId` |
| Final review | `/cycles/:id/reviews/:reviewId/final-review` |

### 9.4 Cycle review stage statuses (per employee)

From cycle reviews mock:

| Field | Values |
|-------|--------|
| Self / Manager / Final status | Completed, Pending, Not Started, Overdue |
| Overall | Completed, In Progress, … |
| Current stage | Self Review, Manager Review, Final Review, Completed |

**Example matrix**

| Employee | Self | Manager | Final | Current stage |
|----------|------|---------|-------|---------------|
| Rahul Shah | Completed | Completed | Completed | Completed |
| Priya Patel | Completed | Completed | Pending | Final Review |
| Someone overdue | Overdue | Not Started | Not Started | Self Review |

---

## 10. Reviews module (queue)

Route: `/performance/reviews`

List of reviews across cycles with:

- Employee, department, manager, cycle  
- Stage: Self / Manager / Peer / HR / Completed  
- Status: Not Started / In Progress / Pending / Completed / Overdue  
- Overall rating (or —)  
- **Open review** → deep link into My Performance / Team / Cycle review

**Cases**

| Case | Action |
|------|--------|
| Filter Pending | Status filter |
| Search by name | Search box |
| Open in-progress self | Lands on self-review workspace |
| Open manager work | Lands on Team Performance |
| Open HR stage | Lands on cycle review detail |
| Send reminders | Toast “Reminders queued” (demo) |

---

## 11. My Performance detailed flow

Route: `/performance/my-performance`

### Banner states (combined with review flow)

| Includes Self | Includes Admin | Self done | Manager done | Admin done | Current stage |
|---------------|----------------|-----------|--------------|------------|---------------|
| Y | Y | N | N | N | Self Review |
| Y | Y | Y | N | N | Manager Review |
| Y | Y | Y | Y | N | Admin Review |
| Y | Y | Y | Y | Y | Completed |
| N | Y | — | N | N | Manager Review |
| N | Y | — | Y | N | Admin Review |
| N | N | — | N | — | Manager Review |
| N | N | — | Y | — | Completed |

### Self Review path

1. Open Self Review.  
2. Answer questions from mapped templates (rating / text / yes-no style).  
3. Rate goals.  
4. **Save draft** → status stays in progress.  
5. **Submit** → `selfReviewStatus = Completed`.  

**Cases**

| Case | Result |
|------|--------|
| Save draft only | Can return and edit |
| Submit | Stage advances; manager can review |
| Flow without Self | Screen not the starting point; stage already Manager |

### Final / Admin result visibility

After Admin completes:

| Visibility flag | Employee sees |
|-----------------|---------------|
| showFinalRating on | Rating label (e.g. Exceeds Expectations) |
| showFinalScore on | Numeric overall |
| showManagerComments on | Manager narrative |
| showCompetencyScores on | Competency breakdown |
| All off | Completion without detailed result cards |

---

## 12. Team Performance & Manager Review

### Team list

Route: `/performance/my-team`

- Filter by search / department / status  
- Open member detail  

### Member detail tabs

Route: `/performance/my-team/:memberId`

Typical: overview, goals, review entry points.

### Manager Review

Route: `/performance/my-team/:memberId/review`

1. Review goals (scores/comments).  
2. Review competencies.  
3. Overall questions / rating.  
4. Save draft or Submit.  

**Cases**

| Case | Result |
|------|--------|
| Submit manager review for `tm-1` | Employee My Performance shows manager done |
| Submit for another teammate | Only that member’s row updates |
| Flow is manager_only | Submitting completes the cycle for that employee (no admin wait) |
| Flow includes Admin | Status becomes awaiting Admin |

---

## 13. Settings flows (HR)

| Area | Route | Controls |
|------|-------|----------|
| Review & Rating | `/performance/settings/review-rating` | Org rating scale, visibility defaults, default deadline days |
| Competencies | `/performance/settings/competencies` | Library + detail |
| Competency Mapping | `/performance/settings/competency-mapping` | Map competencies to roles/levels |
| Question Templates | `/performance/settings/question-templates` | Form questions by role |
| Question Mapping | `/performance/settings/question-mapping` | Which questions appear for which review role |

> [!NOTE]
> **Cycle-Level Goal Rules**: Goal policies (min/max goals per employee, manager approval requirement, progress updates, and automated reminders) are managed directly within each **Appraisal Cycle** setup (`CreateCycleWizardView` and `PerformanceCycleDetailView`), rather than global settings.

### Goal rules managed per Appraisal Cycle

| Setting | On / Custom Value | Off |
|---------|-------------------|-----|
| Min / Max Goals per Employee | Configurable range (e.g. 3 to 8 goals) | Flexible |
| Require manager approval for goals | Goals gated until manager signoff | Free creation |
| Allow employee goal updates | Employees can log progress updates | Updates restricted |
| Send automated progress reminders | Dispatches reminder notifications | Silent |

### Question mapping cases

| Self role has template | Self Review shows those questions |
| Manager role has template | Manager Review shows those questions |
| Unmapped role | Hierarchical resolution fallback to Department or Company-Wide General Base |

### 13.1 Generalized Wildcard Resolution Engine (Competencies & Questions)

Competencies and Question Templates feature a **7-tier hierarchical specificity resolution algorithm** (`calculateRoleMatchScore`):

1. **Company-Wide Base (`All` / `All` / `All`)**: Global competencies (e.g., *Integrity & Ethics*) and question templates apply to every single employee across the organization.
2. **Department-Wide General (`Dept` / `All` / `All`)**: Applies to all employees within a specific department regardless of designation/level (e.g., *Sales Client Empathy* for all Sales roles).
3. **Level-Wide General (`All` / `All` / `Level`)**: Applies to all employees at a given job level across the company (e.g., *People Leadership* for all Managers).
4. **Department + Level (`Dept` / `All` / `Level`)**: Applies to a specific job level within a department.
5. **Department + Designation (`Dept` / `Desig` / `All`)**: Applies to a specific designation within a department across all levels.
6. **Role-Specific Exact Match (`Dept` / `Desig` / `Level`)**: Highly specific competencies/templates (e.g., *Sales Executive IC*).

**Merging Strategy:**
- **Competencies (`getRelevantCompetencies`)**: Merges Company-Wide + Department-Wide + Role-Specific competencies seamlessly, deduplicating titles and sorting by specificity rank.
- **Questions (`getQuestionsForRole`)**: Evaluates active templates by specificity score, selecting the highest-ranked primary template and merging company-wide core questions when appropriate.

---

## 14. Reports flow (HR)

Route: `/performance/reports`

1. Choose cycle.  
2. Optional filters: department, job level.  
3. Read summary cards, completion, rating distribution, department / employee tables.  
4. Export PDF / Excel / CSV → toast (frontend preview only).  

**Cases**

| Case | Result |
|------|--------|
| Clear filters | Full population |
| Filter Engineering | Only that dept rows |
| Export Excel | Success toast; no real file download backend |

---

## 15. Dashboard flow

Route: `/performance` (also `/performance/overview`)

Content varies by role:

| Role | Focus |
|------|-------|
| Employee | Personal progress / next actions → My Performance |
| Manager | Team attention items → Team Performance |
| HR/Admin | Org cycle health → Review Cycles |

---

## 16. Decision trees (quick reference)

### “What should I open next?”

```text
Are you configuring the company?
  YES → Settings (HR)
  NO ↓

Do libraries (Result Areas / Metrics) need a story?
  YES → Result Areas → Metrics (Manager/HR)
  NO ↓

Is there an Active cycle with population?
  NO → Review Cycles → Create / Activate (HR)
  YES ↓

Do employees have goals?
  NO → Goals (Mine/Team)
  YES ↓

Which review flow is active?
  self_manager_admin → Self → Manager → Admin
  manager_admin      → Manager → Admin
  manager_only       → Manager → Done

Need leadership view?
  → Reports (HR)
```

### “Why doesn’t Employee see Self Review?”

1. Review flow is `manager_admin` or `manager_only`, **or**  
2. Admin already finalized (UI treats upstream as done), **or**  
3. You’re on wrong screen (use My Performance / Reviews deep link).

### “Why doesn’t Employee see final rating?”

1. Admin review not completed (if flow includes Admin), **or**  
2. Flow is manager_only and manager not done, **or**  
3. Employee visibility flags hide score/rating.

---

## 17. Full demo scripts by scenario

### Scenario 1 — Classic annual (Self → Manager → Admin)

1. Role **HR/Admin** → Cycles → Create (or open Active cycle) with **Self + Manager + Admin** flow.  
2. Cycles → open Active cycle → Reviews tab (show pipeline).  
3. Role **Employee** → Goals → update one goal progress (show Lakh/Crore sync).  
4. My Performance → Self Review → Submit.  
5. Role **Manager** → Team → Rahul (`tm-1`) → Manager Review → Submit.  
6. Role **HR** → Cycle → Reviews → Final Review → Complete.  
7. Role **Employee** → My Performance → show Completed + rating (visibility on).  

### Scenario 2 — No self assessment

1. HR creates/activates a cycle with flow **Manager + Admin**.  
2. Employee My Performance: stage = Manager Review (no self CTA path).  
3. Manager submits → Employee sees Awaiting Admin.  
4. HR finalizes → Completed.

### Scenario 3 — Manager-only lightweight review

1. HR creates/activates a cycle with flow **Manager only**.  
2. Manager submits review.  
3. Employee My Performance shows **Completed** without Admin step.

### Scenario 4 — Libraries → Goals alignment

1. Manager opens **Result Areas** → Revenue Growth.  
2. **Metrics** → New ARR (Higher is better, ₹ Crore, Quarterly).  
3. Goals → Mine → create goal “Grow ARR” with target `₹1 Crore`, weight 40%.  
4. Talk track: metric direction + unit drive how progress is interpreted.

### Scenario 5 — Multi-company Goals

1. Goals → switch company to **Northstar Retail**.  
2. Show Mine/Company lists change.  
3. Create a goal → stays under Northstar.  
4. Switch back to Sixtifi → Northstar goal disappears from list.

### Scenario 6 — Visibility lockdown

1. Complete a review (Scenario 1).  
2. HR → Review & Rating → turn **off** final rating & score.  
3. Employee My Performance: cycle may show complete but result details hidden.  
4. Turn flags back on → details reappear.

### Scenario 7 — Cycle creation from scratch

1. HR → Review Cycles → Create.  
2. Step 1: name “Pilot Q2”, type Quarterly, dates.  
3. Step 2: Specific employees (pick 3).  
4. Step 3: weights 60/40, flow Manager → Admin, require goal approval ON.  
5. Step 4: Create → appears as **Draft**.  
6. Activate from list actions (toast / status story).

---

## 18. Status cheat sheets

### Cycle

`Draft` → `Active` → `Completed` → `Archived`

### Goal progress status

`Needs Attention` → `At Risk` → `On Track` → `Completed` (by % thresholds)

### Review list status

`Not Started` | `In Progress` | `Pending` | `Overdue` | `Completed`

### Result Area / Metric library status

`Draft` | `Active` | `Archived`

---

## 19. Technical notes (for implementers / technical demos)

| Topic | Detail |
|-------|--------|
| App entry | `src/App.tsx` owns route switch + shared mock state |
| Navigation | `src/data/navigation.ts` + role filter |
| Review flow helpers | `src/data/mockSettings.ts` (`REVIEW_FLOW_OPTIONS`, `stagesFromReviewFlow`, visibility) |
| Goal progress sync | `src/utils/goalProgressSync.ts` |
| Goals UI | `src/views/goals/*` |
| Cycles UI | `src/views/cycles/*` |
| Libraries | `src/views/modules/KrasPage.tsx`, `KpisPage.tsx` |
| Reviews queue | `src/views/modules/ReviewsPage.tsx` |
| State lifetime | React `useState` in `App` — refresh resets |

**Do not confuse** with Payroll “Performance Incentive” configs — out of scope for this SPA.

---

## 20. Known demo limitations

| Limitation | Impact |
|------------|--------|
| In-memory mocks | Data resets on reload |
| Role switch ≠ real auth | Permissions are menu filters only |
| Some actions are toasts | Create library item / export / remind may not persist fully |
| Peer stage in Reviews list | Shown in seed rows; full peer nomination UX is thinner than self/manager/admin |
| Weight sum 100% | Explained in UI; not hard-enforced on submit |
| Bank / multi-tenant login | Not modeled beyond Goals company chip |

---

## 21. Quick path cheat sheet

```text
Dashboard                 → #/performance
My Performance            → #/performance/my-performance
  Self Review             → #/performance/my-performance/self-review
Team Performance          → #/performance/my-team
  Member                  → #/performance/my-team/:memberId
  Manager Review          → #/performance/my-team/:memberId/review
Goals Mine / Team / Co.   → #/performance/goals/my|team|overall
Result Areas              → #/performance/kras
Metrics                   → #/performance/kpis
Review Cycles             → #/performance/cycles
  Create                  → #/performance/cycles/create
  Detail                  → #/performance/cycles/:cycleId/:tab
  Review detail           → #/performance/cycles/:id/reviews/:reviewId
  Final review            → #/performance/cycles/:id/reviews/:reviewId/final-review
Reviews queue             → #/performance/reviews
Reports                   → #/performance/reports
Settings                  → #/performance/settings
  Review & Rating         → #/performance/settings/review-rating
  Question Mapping        → #/performance/settings/question-mapping
  Competency Mapping      → #/performance/settings/competency-mapping
```

---

*Generated for the Sixtifi PMS Vite demo. Update this file when routes, review presets, or module IA change.*
