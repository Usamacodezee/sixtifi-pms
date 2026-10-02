import React, { useState, useEffect } from 'react';
import { AppShell } from './components/shell/AppShell';
import { ToastContainer, ToastMessage, ToastType } from './components/ui/Toast';
import { UserRole, GoalStatus } from './types/performance';
import { getVisiblePerformanceSubmenu } from './data/navigation';
import { PerformanceOverviewView } from './views/PerformanceOverviewView';
import { MyPerformanceView } from './views/MyPerformanceView';
import { MyGoalDetailView } from './views/my-performance/MyGoalDetailView';
import { SelfReviewView } from './views/my-performance/SelfReviewView';
import {
  FinalReviewPlaceholderView
} from './views/my-performance/MyPerformancePlaceholders';
import { TeamPerformanceView } from './views/TeamPerformanceView';
import { TeamMemberDetailView, TeamMemberDetailTab } from './views/my-team/TeamMemberDetailView';
import { ManagerReviewView } from './views/my-team/ManagerReviewView';
import { PerformanceCyclesView } from './views/PerformanceCyclesView';
import { CreateCycleWizardView } from './views/cycles/CreateCycleWizardView';
import { PerformanceCycleDetailView, CycleDetailTab } from './views/cycles/PerformanceCycleDetailView';
import { EmployeePerformanceDetailView } from './views/cycles/EmployeePerformanceDetailView';
import { GoalDetailView } from './views/cycles/GoalDetailView';
import { ReviewDetailView } from './views/cycles/ReviewDetailView';
import { FinalReviewView } from './views/cycles/FinalReviewView';
import { SettingsShellView, parseSettingsTab } from './views/settings/SettingsShellView';
import { CompetencyDetailView } from './views/settings/CompetencyDetailView';
import { QuestionTemplateDetailView } from './views/settings/QuestionTemplateDetailView';
import { PerformanceReportsView } from './views/reports/PerformanceReportsView';
import { GenericPlaceholderView } from './views/GenericPlaceholderView';
import { GoalsShellView, GoalsTab, getDefaultGoalsTab } from './views/goals/GoalsShellView';
import { UnifiedGoalDetailView } from './views/goals/UnifiedGoalDetailView';
import { PerformanceShellView } from './views/performance/PerformanceShellView';
import { canAccessGoalsTab } from './utils/goalPermissions';
import { canAccessPerformanceTab } from './utils/performancePermissions';
import { ReviewsPage } from './views/modules/ReviewsPage';
import { MOCK_KRAS, MOCK_KPIS, KraItem, KpiItem } from './data/mockPerformanceModules';
import { MOCK_PERFORMANCE_CYCLES } from './data/mockCycles';
import { MyGoalItem, calculateGoalStatus } from './data/mockMyGoals';
import {
  ALL_INDIVIDUAL_GOALS_SEED,
  ALL_TEAM_MEMBER_GOAL_ROWS_SEED,
  MOCK_OVERALL_GOALS,
  MOCK_TEAM_GOALS,
  OverallGoal,
  TeamGoal,
  TeamMemberGoalRow,
  getIndividualGoalsForCompany
} from './data/mockGoalsModule';
import { DEFAULT_COMPANY_ID } from './data/mockCompanies';
import { INITIAL_SELF_REVIEW_RESPONSES, SelfReviewResponses } from './data/selfReviewConfig';
import { INITIAL_MANAGER_REVIEW, ManagerReviewResponses } from './data/mockManagerReview';
import { INITIAL_FINAL_REVIEW_DECISION, FinalReviewDecision } from './data/mockFinalReview';
import {
  MOCK_SETTINGS_COMPETENCIES,
  SettingsCompetency,
  MOCK_QUESTION_TEMPLATES,
  QuestionTemplate,
  DEFAULT_GOAL_SETTINGS,
  GoalSettings,
  DEFAULT_REVIEW_RATING_SETTINGS,
  ReviewRatingSettings,
  MOCK_COMPETENCY_MAPPINGS,
  CompetencyMapping,
  MOCK_QUESTION_MAPPINGS,
  QuestionMapping,
  getQuestionsForRole
} from './data/mockSettings';
import { PerformanceCycle } from './types/performance';
import './styles/global.css';

// The single logged-in demo employee ("Rahul Shah") across the Employee-role
// self-service views is represented by emp-1 in the Cycles/Reviews mock world.
const SELF_EMPLOYEE_ID = 'emp-1';
// The same person is tm-1 in the My Team / Manager Review mock world — bridged
// here so My Performance can show a real "has my manager reviewed me yet"
// status instead of collapsing it into the final-review-completed flag.
const SELF_TEAM_MEMBER_ID = 'tm-1';

export function App() {
  // State for active route (defaults to /performance)
  const [activeRoute, setActiveRoute] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash && hash.startsWith('/') ? hash : '/performance';
  });

  // Dynamic cycles state for frontend demo session
  const [cyclesList, setCyclesList] = useState<PerformanceCycle[]>(MOCK_PERFORMANCE_CYCLES);

  // Company-scoped Goals module state (frontend demo session)
  const [activeCompanyId, setActiveCompanyId] = useState<string>(DEFAULT_COMPANY_ID);
  const [myGoalsList, setMyGoalsList] = useState<MyGoalItem[]>(ALL_INDIVIDUAL_GOALS_SEED);
  const [overallGoalsList, setOverallGoalsList] = useState<OverallGoal[]>(MOCK_OVERALL_GOALS);
  const [teamGoalsList, setTeamGoalsList] = useState<TeamGoal[]>(MOCK_TEAM_GOALS);
  const [teamMemberGoalsList, setTeamMemberGoalsList] =
    useState<TeamMemberGoalRow[]>(ALL_TEAM_MEMBER_GOAL_ROWS_SEED);

  // Dynamic self review responses for employee
  const [selfReviewResponses, setSelfReviewResponses] = useState<SelfReviewResponses>(INITIAL_SELF_REVIEW_RESPONSES);

  // Manager review responses for direct reports, keyed by employeeId
  const [managerReviewResponses, setManagerReviewResponses] = useState<Record<string, ManagerReviewResponses>>({});

  // HR/Admin final review decisions, keyed by employeeId
  const [finalReviewDecisions, setFinalReviewDecisions] = useState<Record<string, FinalReviewDecision>>({});

  // PMS Settings state (frontend-only, session scoped)
  const [settingsCompetencies, setSettingsCompetencies] = useState<SettingsCompetency[]>(MOCK_SETTINGS_COMPETENCIES);
  const [questionTemplates, setQuestionTemplates] = useState<QuestionTemplate[]>(MOCK_QUESTION_TEMPLATES);
  const [reviewRatingSettings, setReviewRatingSettings] = useState<ReviewRatingSettings>(DEFAULT_REVIEW_RATING_SETTINGS);
  const [competencyMappings, setCompetencyMappings] = useState<CompetencyMapping[]>(MOCK_COMPETENCY_MAPPINGS);
  const [questionMappings, setQuestionMappings] = useState<QuestionMapping[]>(MOCK_QUESTION_MAPPINGS);
  const [resultAreas, setResultAreas] = useState<KraItem[]>(MOCK_KRAS);
  const [metrics, setMetrics] = useState<KpiItem[]>(MOCK_KPIS);

  // State for mock user role (defaults to HR/Admin to showcase all 5 submenu items initially)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('HR/Admin');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync route changes to hash for direct testing and browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash.startsWith('/')) {
        setActiveRoute(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const addToast = (type: ToastType, title: string, description?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleNavigate = (route: string) => {
    setActiveRoute(route);
    window.location.hash = route;
  };

  const renderSettingsShell = (settingsTab: ReturnType<typeof parseSettingsTab>) => (
    <SettingsShellView
      activeTab={settingsTab}
      competencies={settingsCompetencies}
      onUpdateCompetencies={setSettingsCompetencies}
      questionTemplates={questionTemplates}
      onUpdateQuestionTemplates={setQuestionTemplates}
      competencyMappings={competencyMappings}
      onUpdateCompetencyMappings={setCompetencyMappings}
      questionMappings={questionMappings}
      onUpdateQuestionMappings={setQuestionMappings}
      resultAreas={resultAreas}
      onUpdateResultAreas={setResultAreas}
      metrics={metrics}
      onUpdateMetrics={setMetrics}
      onNavigate={handleNavigate}
      onShowToast={addToast}
    />
  );

  const [selectedCycleId, setSelectedCycleId] = useState<string>('cycle-1');
  const activeCycle = cyclesList.find((c) => c.id === selectedCycleId) || cyclesList.find((c) => c.status === 'Active') || cyclesList[0];
  const activeCyclesList = cyclesList.filter((c) => c.status === 'Active');

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentUserRole(newRole);
    const visibleSubmenu = getVisiblePerformanceSubmenu(newRole);

    // If current route is within /performance but not accessible by new role, redirect
    if (activeRoute.startsWith('/performance')) {
      const isRouteAllowed = visibleSubmenu.some(
        (item) =>
          item.route === activeRoute ||
          (item.route !== '/performance' && activeRoute.startsWith(`${item.route}/`)) ||
          (activeRoute === '/performance' && item.route === '/performance') ||
          (activeRoute === '/performance/overview' && item.route === '/performance')
      );

      if (!isRouteAllowed) {
        handleNavigate('/performance');
        addToast(
          'info',
          `Switched to ${newRole} View`,
          `Navigation updated according to ${newRole} access permissions.`
        );
        return;
      }

      // Employees cannot stay on Team Goals
      if (newRole === 'Employee' && activeRoute.startsWith('/performance/goals/team')) {
        handleNavigate('/performance/goals/my');
        addToast(
          'info',
          `Switched to ${newRole} View`,
          'Team Goals is available to Managers and HR. Showing My Goals instead.'
        );
        return;
      }
    }

    addToast(
      'info',
      `Switched to ${newRole} View`,
      `Previewing ${visibleSubmenu.length} submenu item${visibleSubmenu.length > 1 ? 's' : ''} in Performance module.`
    );
  };

  const handleCreateCycle = (newCycle: PerformanceCycle) => {
    setCyclesList((prev) => [newCycle, ...prev]);
  };

  const handleUpdateMyGoal = (
    goalId: string,
    updatedFields: {
      progress: number;
      currentAchievement: string;
      comment?: string;
      attachmentName?: string;
    }
  ) => {
    setMyGoalsList((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const newProgress = Math.min(100, Math.max(0, updatedFields.progress));
        const newStatus = calculateGoalStatus(newProgress);
        const historyEntry = {
          date: '29 Aug 2026',
          previousPercent: g.progress,
          newPercent: newProgress,
          comment: updatedFields.comment,
          updatedBy: 'Rahul Shah'
        };

        return {
          ...g,
          progress: newProgress,
          currentAchievement: updatedFields.currentAchievement,
          status: newStatus,
          evidencePlaceholder: updatedFields.attachmentName || g.evidencePlaceholder,
          history: [historyEntry, ...(g.history || [])]
        };
      })
    );
  };

  const handleSaveManagerReviewDraft = (employeeId: string, response: ManagerReviewResponses) => {
    setManagerReviewResponses((prev) => ({ ...prev, [employeeId]: response }));
  };

  const handleSubmitManagerReview = (employeeId: string, response: ManagerReviewResponses) => {
    setManagerReviewResponses((prev) => ({ ...prev, [employeeId]: response }));
  };

  const handleFinalizeReview = (employeeId: string, decision: FinalReviewDecision) => {
    setFinalReviewDecisions((prev) => ({ ...prev, [employeeId]: decision }));
  };

  const handleSendBackForRevision = (employeeId: string, decision: FinalReviewDecision) => {
    setFinalReviewDecisions((prev) => ({ ...prev, [employeeId]: decision }));
  };

  const handleCreateCompetency = (competency: SettingsCompetency) => {
    setSettingsCompetencies((prev) => [competency, ...prev]);
  };

  const handleUpdateCompetency = (competency: SettingsCompetency) => {
    setSettingsCompetencies((prev) => prev.map((c) => (c.id === competency.id ? competency : c)));
  };

  const handleCreateQuestionTemplate = (template: QuestionTemplate) => {
    setQuestionTemplates((prev) => [template, ...prev]);
  };

  const handleUpdateQuestionTemplate = (template: QuestionTemplate) => {
    setQuestionTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)));
  };

  const handleUpdateTeamMemberGoal = (
    rowId: string,
    updatedFields: { progress?: number; status?: GoalStatus; managerRating?: number; managerComment?: string }
  ) => {
    setTeamMemberGoalsList((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, ...updatedFields } : row))
    );
  };

  const handleUpdateOverallGoal = (
    goalId: string,
    updatedFields: { progress?: number; status?: GoalStatus; managerComment?: string }
  ) => {
    setOverallGoalsList((prev) =>
      prev.map((og) => (og.id === goalId ? { ...og, ...updatedFields } : og))
    );
  };

  const companyScopedMyGoals = getIndividualGoalsForCompany(myGoalsList, activeCompanyId);

  const resolveGoalsTab = (raw: string, role: UserRole): GoalsTab => {
    if (raw === 'team' && canAccessGoalsTab('team', role)) return 'team';
    if (raw === 'overall' && canAccessGoalsTab('overall', role)) return 'overall';
    if (raw === 'my') return 'my';
    return getDefaultGoalsTab(role);
  };

  // Render view corresponding to route
  const renderCurrentView = () => {
    // 1. Single Unified Goal Detail Route: /performance/goals/:goalId (e.g. /performance/goals/my-goal-1 or /performance/goals/og-1)
    if (
      activeRoute.match(/^\/performance\/goals\/[^/]+$/) &&
      !['my', 'team', 'overall'].includes(activeRoute.split('/')[3])
    ) {
      const goalId = activeRoute.split('/')[3];
      return (
        <UnifiedGoalDetailView
          goalId={goalId}
          currentUserRole={currentUserRole}
          activeCycleStatus="Active"
          individualGoals={myGoalsList}
          overallGoals={overallGoalsList}
          teamGoals={teamGoalsList}
          teamMemberGoals={teamMemberGoalsList}
          onUpdateIndividualGoal={handleUpdateMyGoal}
          onUpdateTeamMemberGoal={handleUpdateTeamMemberGoal}
          onUpdateOverallGoal={handleUpdateOverallGoal}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    // 2. Legacy / Alias Goal Detail Routes (all map to UnifiedGoalDetailView)
    if (
      activeRoute.match(/^\/performance\/goals\/my\/[^/]+/) ||
      activeRoute.match(/^\/performance\/my-performance\/goals\/[^/]+/) ||
      activeRoute.match(/^\/performance\/cycles\/[^/]+\/goals\/[^/]+/)
    ) {
      const parts = activeRoute.split('/');
      const goalId = parts[parts.length - 1] || 'my-goal-1';
      return (
        <UnifiedGoalDetailView
          goalId={goalId}
          currentUserRole={currentUserRole}
          activeCycleStatus="Active"
          individualGoals={myGoalsList}
          overallGoals={overallGoalsList}
          teamGoals={teamGoalsList}
          teamMemberGoals={teamMemberGoalsList}
          onUpdateIndividualGoal={handleUpdateMyGoal}
          onUpdateTeamMemberGoal={handleUpdateTeamMemberGoal}
          onUpdateOverallGoal={handleUpdateOverallGoal}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    // 3. Goals module shell: /performance/goals[/my|team|overall]
    if (activeRoute === '/performance/goals' || activeRoute.startsWith('/performance/goals/')) {
      const rawTab = activeRoute.replace('/performance/goals', '').replace(/^\//, '').split('/')[0];
      const goalsTab = resolveGoalsTab(rawTab, currentUserRole);

      return (
        <GoalsShellView
          activeTab={goalsTab}
          currentUserRole={currentUserRole}
          companyId={activeCompanyId}
          onCompanyChange={setActiveCompanyId}
          individualGoals={myGoalsList}
          overallGoals={overallGoalsList}
          teamGoals={teamGoalsList}
          teamMemberGoals={teamMemberGoalsList}
          onUpdateIndividualGoal={handleUpdateMyGoal}
          onCreateMyGoal={(goal) => setMyGoalsList((prev) => [goal, ...prev])}
          onCreateTeamMemberGoal={(row) => setTeamMemberGoalsList((prev) => [row, ...prev])}
          onCreateOverallGoal={(goal) => setOverallGoalsList((prev) => [goal, ...prev])}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    // Check for final review route /performance/cycles/:cycleId/reviews/:employeeId/final-review
    if (activeRoute.match(/^\/performance\/cycles\/[^/]+\/reviews\/[^/]+\/final-review/)) {
      const parts = activeRoute.split('/');
      const cycleId = parts[3] || 'cycle-1';
      const employeeId = parts[5] || SELF_EMPLOYEE_ID;

      return (
        <FinalReviewView
          cycleId={cycleId}
          employeeId={employeeId}
          decision={finalReviewDecisions[employeeId] || INITIAL_FINAL_REVIEW_DECISION}
          onFinalize={handleFinalizeReview}
          onSendBack={handleSendBackForRevision}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    // Check for review detail route /performance/cycles/:cycleId/reviews/:employeeId
    if (activeRoute.match(/^\/performance\/cycles\/[^/]+\/reviews\/[^/]+/)) {
      const parts = activeRoute.split('/');
      const cycleId = parts[3] || 'cycle-1';
      const employeeId = parts[5] || 'emp-2';

      return (
        <ReviewDetailView
          cycleId={cycleId}
          employeeId={employeeId}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    // Check for goal detail route /performance/cycles/:cycleId/goals/:goalId
    if (activeRoute.match(/^\/performance\/cycles\/[^/]+\/goals\/[^/]+/)) {
      const parts = activeRoute.split('/');
      const goalId = parts[5] || 'goal-1';

      return (
        <UnifiedGoalDetailView
          goalId={goalId}
          currentUserRole={currentUserRole}
          activeCycleStatus="Active"
          individualGoals={myGoalsList}
          overallGoals={overallGoalsList}
          teamGoals={teamGoalsList}
          teamMemberGoals={teamMemberGoalsList}
          onUpdateIndividualGoal={handleUpdateMyGoal}
          onUpdateTeamMemberGoal={handleUpdateTeamMemberGoal}
          onUpdateOverallGoal={handleUpdateOverallGoal}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    // Check for employee performance detail route /performance/cycles/:cycleId/employees/:employeeId
    if (activeRoute.match(/^\/performance\/cycles\/[^/]+\/employees\/[^/]+/)) {
      const parts = activeRoute.split('/');
      const cycleId = parts[3] || 'cycle-1';
      const employeeId = parts[5] || 'emp-1';
      const rawSubTab = parts[6] || 'overview';
      const initialTab = ['overview', 'goals', 'reviews'].includes(rawSubTab)
        ? (rawSubTab as 'overview' | 'goals' | 'reviews')
        : 'overview';

      return (
        <EmployeePerformanceDetailView
          cycleId={cycleId}
          employeeId={employeeId}
          initialTab={initialTab}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    // Check for manager review route /performance/my-team/:employeeId/review
    if (activeRoute.match(/^\/performance\/my-team\/[^/]+\/review/)) {
      const parts = activeRoute.split('/');
      const employeeId = parts[3] || 'tm-1';

      return (
        <ManagerReviewView
          employeeId={employeeId}
          response={managerReviewResponses[employeeId] || INITIAL_MANAGER_REVIEW}
          questionTemplates={questionTemplates}
          questionMappings={questionMappings}
          onSaveDraft={handleSaveManagerReviewDraft}
          onSubmitReview={handleSubmitManagerReview}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    // Check for employee detail route /performance/employees/:employeeId or /performance/my-team/:employeeId
    if (
      activeRoute.match(/^\/performance\/employees\/[^/]+/) ||
      activeRoute.match(/^\/performance\/my-team\/[^/]+/)
    ) {
      const parts = activeRoute.split('/');
      const employeeId = parts[3] || 'tm-1';
      const rawTab = parts[4] || 'overview';
      const initialTab: TeamMemberDetailTab = ['overview', 'goals'].includes(rawTab)
        ? (rawTab as TeamMemberDetailTab)
        : 'overview';

      return (
        <TeamMemberDetailView
          employeeId={employeeId}
          initialTab={initialTab}
          managerReviewResponses={managerReviewResponses}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    // Check for the competency detail/edit/create route /performance/settings/competencies/:competencyId
    if (activeRoute.match(/^\/performance\/settings\/competencies\/[^/]+$/)) {
      const parts = activeRoute.split('/');
      const competencyId = parts[4] || 'new';

      return (
        <CompetencyDetailView
          competencyId={competencyId}
          competencies={settingsCompetencies}
          onCreateCompetency={handleCreateCompetency}
          onUpdateCompetency={handleUpdateCompetency}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    // Check for the question template detail/edit/create route /performance/settings/question-templates/:templateId
    if (activeRoute.match(/^\/performance\/settings\/question-templates\/[^/]+$/)) {
      const parts = activeRoute.split('/');
      const templateId = parts[4] || 'new';

      return (
        <QuestionTemplateDetailView
          templateId={templateId}
          templates={questionTemplates}
          onCreateTemplate={handleCreateQuestionTemplate}
          onUpdateTemplate={handleUpdateQuestionTemplate}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    // Settings shell (tabs + reference data / competency / questions parents)
    // Detail routes for competencies/:id and question-templates/:id are handled above.
    if (activeRoute.startsWith('/performance/settings')) {
      const rawTab = activeRoute.replace('/performance/settings', '').replace(/^\//, '');
      // Ignore nested detail segments that somehow reach here
      const tabKey = rawTab.split('/')[0] || '';
      const settingsTab = parseSettingsTab(tabKey);

      return renderSettingsShell(settingsTab);
    }

    // Check for dynamic cycle detail route /performance/cycles/:cycleId (with optional sub-tabs)
    if (activeRoute.startsWith('/performance/cycles/') && activeRoute !== '/performance/cycles/create') {
      const remainingPath = activeRoute.replace('/performance/cycles/', '');
      const parts = remainingPath.split('/');
      const cycleId = parts[0] || 'cycle-1';
      const rawTab = parts[1] || 'overview';
      const activeTab: CycleDetailTab = ['overview', 'employees', 'goals', 'reviews'].includes(rawTab)
        ? (rawTab as CycleDetailTab)
        : 'overview';

      return (
        <PerformanceCycleDetailView
          cycleId={cycleId}
          activeTab={activeTab}
          cycles={cyclesList}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      );
    }

    switch (activeRoute) {
      case '/performance':
      case '/performance/overview':
      case '/performance/overall':
        return (
          <PerformanceShellView
            activeTab="overall"
            currentUserRole={currentUserRole}
            goals={companyScopedMyGoals}
            selfReviewStatus={selfReviewResponses.status}
            managerReviewIsDone={managerReviewResponses[SELF_TEAM_MEMBER_ID]?.status === 'Completed'}
            finalReviewDecision={finalReviewDecisions[SELF_EMPLOYEE_ID]}
            employeeVisibility={{
              ...reviewRatingSettings.employeeVisibility,
              showFinalRating:
                activeCycle?.showFinalRatingToEmployee ??
                reviewRatingSettings.employeeVisibility.showFinalRating
            }}
            reviewFlow={activeCycle?.reviewFlow ?? 'self_manager_admin'}
            activeCycle={activeCycle}
            allCycles={activeCyclesList}
            managerReviewResponses={managerReviewResponses}
            onSelectCycleId={setSelectedCycleId}
            onNavigate={handleNavigate}
            onShowToast={addToast}
          />
        );

      case '/performance/my-performance':
        return (
          <PerformanceShellView
            activeTab="my"
            currentUserRole={currentUserRole}
            goals={companyScopedMyGoals}
            selfReviewStatus={selfReviewResponses.status}
            managerReviewIsDone={managerReviewResponses[SELF_TEAM_MEMBER_ID]?.status === 'Completed'}
            finalReviewDecision={finalReviewDecisions[SELF_EMPLOYEE_ID]}
            employeeVisibility={{
              ...reviewRatingSettings.employeeVisibility,
              showFinalRating:
                activeCycle?.showFinalRatingToEmployee ??
                reviewRatingSettings.employeeVisibility.showFinalRating
            }}
            reviewFlow={activeCycle?.reviewFlow ?? 'self_manager_admin'}
            activeCycle={activeCycle}
            allCycles={activeCyclesList}
            managerReviewResponses={managerReviewResponses}
            onSelectCycleId={setSelectedCycleId}
            onNavigate={handleNavigate}
            onShowToast={addToast}
          />
        );

      case '/performance/my-team':
        return (
          <PerformanceShellView
            activeTab="team"
            currentUserRole={currentUserRole}
            goals={companyScopedMyGoals}
            selfReviewStatus={selfReviewResponses.status}
            managerReviewIsDone={managerReviewResponses[SELF_TEAM_MEMBER_ID]?.status === 'Completed'}
            finalReviewDecision={finalReviewDecisions[SELF_EMPLOYEE_ID]}
            employeeVisibility={{
              ...reviewRatingSettings.employeeVisibility,
              showFinalRating:
                activeCycle?.showFinalRatingToEmployee ??
                reviewRatingSettings.employeeVisibility.showFinalRating
            }}
            reviewFlow={activeCycle?.reviewFlow ?? 'self_manager_admin'}
            activeCycle={activeCycle}
            allCycles={activeCyclesList}
            managerReviewResponses={managerReviewResponses}
            onSelectCycleId={setSelectedCycleId}
            onNavigate={handleNavigate}
            onShowToast={addToast}
          />
        );

      case '/performance/my-performance/self-review':
        return (
          <SelfReviewView
            goals={companyScopedMyGoals}
            responses={selfReviewResponses}
            questionTemplates={questionTemplates}
            questionMappings={questionMappings}
            onSaveDraft={(updated) => setSelfReviewResponses(updated)}
            onSubmitReview={(updated) => setSelfReviewResponses(updated)}
            onNavigate={handleNavigate}
            onShowToast={addToast}
          />
        );

      case '/performance/cycles':
        return (
          <PerformanceCyclesView
            cycles={cyclesList}
            onNavigate={handleNavigate}
            onShowToast={addToast}
          />
        );

      case '/performance/cycles/create':
        return (
          <CreateCycleWizardView
            onNavigate={handleNavigate}
            onCreateCycle={handleCreateCycle}
            onShowToast={addToast}
          />
        );

      case '/performance/kras':
      case '/performance/kpis':
        // Legacy drawer routes → Settings → Reference Data
        return renderSettingsShell(activeRoute.endsWith('kpis') ? 'metrics' : 'result-areas');

      case '/performance/reviews':
        return <ReviewsPage onNavigate={handleNavigate} onShowToast={addToast} />;

      case '/performance/reports':
        return (
          <PerformanceReportsView
            onNavigate={handleNavigate}
            onShowToast={addToast}
          />
        );

      case '/dashboard':
        return <GenericPlaceholderView moduleName="Dashboard" onNavigateToPerformance={() => handleNavigate('/performance')} />;

      case '/tasks':
        return <GenericPlaceholderView moduleName="Tasks" onNavigateToPerformance={() => handleNavigate('/performance')} />;

      case '/expenses':
        return <GenericPlaceholderView moduleName="Expenses" onNavigateToPerformance={() => handleNavigate('/performance')} />;

      case '/helpdesk':
        return <GenericPlaceholderView moduleName="Helpdesk" onNavigateToPerformance={() => handleNavigate('/performance')} />;

      case '/help':
        return <GenericPlaceholderView moduleName="Help & Documentation" onNavigateToPerformance={() => handleNavigate('/performance')} />;

      case '/settings':
        return <GenericPlaceholderView moduleName="System Settings" onNavigateToPerformance={() => handleNavigate('/performance')} />;

      default:
        return (
          <PerformanceOverviewView
            currentUserRole={currentUserRole}
            onNavigate={handleNavigate}
            onShowToast={addToast}
          />
        );
    }
  };

  return (
    <AppShell
      activeRoute={activeRoute}
      onNavigate={handleNavigate}
      currentUserRole={currentUserRole}
      onRoleChange={handleRoleChange}
      onShowToast={addToast}
    >
      {/* Route Views */}
      {renderCurrentView()}

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AppShell>
  );
}

export default App;
