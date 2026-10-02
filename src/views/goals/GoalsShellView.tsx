import React, { useMemo, useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { UserRole } from '../../types/performance';
import { Company, MOCK_COMPANIES } from '../../data/mockCompanies';
import {
  OverallGoal,
  TeamGoal,
  TeamMemberGoalRow,
  getOverallGoalsForCompany,
  getTeamGoalsForCompany,
  getIndividualGoalsForCompany,
  getAssignableEmployees,
  calculateGoalStatus
} from '../../data/mockGoalsModule';
import { MyGoalItem } from '../../data/mockMyGoals';
import { SimpleGoalsPanel, SimpleGoalCard } from './SimpleGoalsPanel';
import { CreateGoalModal, CreateGoalFormValues, CreateGoalMode } from './CreateGoalModal';
import { UpdateProgressModal } from '../my-performance/UpdateProgressModal';
import { ToastType } from '../../components/ui/Toast';
import { Target, Users, Building2 } from 'lucide-react';
import { getGoalPermissions, canAccessGoalsTab } from '../../utils/goalPermissions';
import '../my-performance/MyGoalsStyles.css';
import './GoalsModule.css';

export type GoalsTab = 'my' | 'team' | 'overall';

const SELF_NAME = 'Rahul Shah';
const SELF_MANAGER = 'Vikram Patel';

export interface GoalsShellViewProps {
  activeTab: GoalsTab;
  currentUserRole: UserRole;
  companyId: string;
  onCompanyChange: (companyId: string) => void;
  individualGoals: MyGoalItem[];
  overallGoals: OverallGoal[];
  teamGoals: TeamGoal[];
  teamMemberGoals: TeamMemberGoalRow[];
  onUpdateIndividualGoal: (
    goalId: string,
    updatedFields: {
      progress: number;
      currentAchievement: string;
      comment?: string;
      attachmentName?: string;
    }
  ) => void;
  onCreateMyGoal: (goal: MyGoalItem) => void;
  onCreateTeamMemberGoal: (row: TeamMemberGoalRow) => void;
  onCreateOverallGoal: (goal: OverallGoal) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

const TAB_META: Array<{
  id: GoalsTab;
  label: string;
  icon: typeof Target;
  route: string;
}> = [
  {
    id: 'my',
    label: 'My Goals',
    icon: Target,
    route: '/performance/goals/my'
  },
  {
    id: 'team',
    label: 'Team Goals',
    icon: Users,
    route: '/performance/goals/team'
  },
  {
    id: 'overall',
    label: 'Overall Goals',
    icon: Building2,
    route: '/performance/goals/overall'
  }
];

export const getDefaultGoalsTab = (_role: UserRole): GoalsTab => 'my';

export const GoalsShellView: React.FC<GoalsShellViewProps> = ({
  activeTab,
  currentUserRole,
  companyId,
  onCompanyChange,
  individualGoals,
  overallGoals,
  teamGoals,
  teamMemberGoals,
  onUpdateIndividualGoal,
  onCreateMyGoal,
  onCreateTeamMemberGoal,
  onCreateOverallGoal,
  onNavigate,
  onShowToast
}) => {
  const perms = getGoalPermissions(currentUserRole);
  const company: Company =
    MOCK_COMPANIES.find((c) => c.id === companyId) ?? MOCK_COMPANIES[0];

  // Guard tab access based on permissions
  useEffect(() => {
    if (!canAccessGoalsTab(activeTab, currentUserRole)) {
      onShowToast?.(
        'warning',
        'Access Restricted',
        `Your role (${currentUserRole}) does not have permission to view ${activeTab === 'team' ? 'Team Goals' : 'Overall Goals'}. Redirecting to My Goals.`
      );
      onNavigate('/performance/goals/my');
    }
  }, [activeTab, currentUserRole]);

  const visibleTabs = TAB_META.filter((t) => canAccessGoalsTab(t.id, currentUserRole));

  const canManageCompany = currentUserRole === 'HR/Admin';
  const canAddTeam = perms.canEditTeamGoals;
  const canAddCompany = perms.canEditOverallGoals;
  const canAddMine = true;

  const [updateGoal, setUpdateGoal] = useState<MyGoalItem | null>(null);
  const [createMode, setCreateMode] = useState<CreateGoalMode | null>(null);

  const myGoals = useMemo(
    () => getIndividualGoalsForCompany(individualGoals, company.id),
    [individualGoals, company.id]
  );
  const companyGoals = useMemo(
    () => getOverallGoalsForCompany(overallGoals, company.id),
    [overallGoals, company.id]
  );
  const teamOkrs = useMemo(
    () => getTeamGoalsForCompany(teamGoals, company.id),
    [teamGoals, company.id]
  );
  const memberRows = useMemo(
    () => teamMemberGoals.filter((r) => r.companyId === company.id),
    [teamMemberGoals, company.id]
  );
  const assignees = useMemo(() => getAssignableEmployees(company.id), [company.id]);

  const myCards: SimpleGoalCard[] = myGoals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    target: g.target,
    current: g.currentAchievement,
    progress: g.progress,
    status: g.status,
    dueDate: g.dueDate,
    weight: g.weight
  }));

  const teamCards: SimpleGoalCard[] = memberRows.map((row) => ({
    id: row.id,
    title: row.goalTitle,
    meta: `${row.employeeName} · ${row.designation}`,
    target: row.target,
    progress: row.progress,
    status: row.status,
    weight: row.weight
  }));

  const companyCards: SimpleGoalCard[] = companyGoals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    meta: `${g.owner} · ${g.ownerRole}`,
    target: g.target,
    current: g.currentAchievement,
    progress: g.progress,
    status: g.status,
    dueDate: g.dueDate,
    weight: g.weight
  }));

  const counts: Record<GoalsTab, number> = {
    my: myCards.length,
    team: teamCards.length,
    overall: companyCards.length
  };

  const handleCreateSubmit = (values: CreateGoalFormValues) => {
    if (!createMode) return;

    if (createMode === 'my') {
      const goal: MyGoalItem = {
        id: `my-goal-${Date.now()}`,
        companyId: company.id,
        title: values.title,
        description: values.description || 'Personal performance goal.',
        target: values.target,
        currentAchievement: '0',
        progress: 0,
        weight: values.weight,
        startDate: '01 Apr 2026',
        dueDate: values.dueDate,
        status: calculateGoalStatus(0),
        manager: SELF_MANAGER,
        managerRole: 'Manager',
        history: []
      };
      onCreateMyGoal(goal);
      onShowToast?.(
        'success',
        'Goal added',
        `"${goal.title}" created successfully.`
      );
    }

    if (createMode === 'team') {
      const person = assignees.find((a) => a.id === values.assigneeId) || assignees[0];
      if (!person) {
        onShowToast?.('error', 'No assignee', 'Select a team member.');
        return;
      }
      const row: TeamMemberGoalRow = {
        id: `tm-goal-${Date.now()}`,
        companyId: company.id,
        employeeId: person.id,
        employeeName: person.name,
        employeeCode: person.employeeCode,
        designation: person.designation,
        department: person.department,
        initials: person.initials,
        avatarBg: person.avatarBg,
        goalTitle: values.title,
        target: values.target,
        progress: 0,
        weight: values.weight,
        status: calculateGoalStatus(0)
      };
      onCreateTeamMemberGoal(row);
      onShowToast?.(
        'success',
        'Team goal added',
        `"${row.goalTitle}" assigned to ${person.name}.`
      );
    }

    if (createMode === 'overall') {
      const goal: OverallGoal = {
        id: `og-${Date.now()}`,
        companyId: company.id,
        title: values.title,
        description: values.description || 'Strategic objective.',
        owner: values.owner,
        ownerRole: values.ownerRole || 'Leadership',
        target: values.target,
        currentAchievement: '0',
        progress: 0,
        weight: values.weight,
        startDate: '01 Apr 2026',
        dueDate: values.dueDate,
        status: calculateGoalStatus(0),
        linkedTeamGoalIds: [],
        history: []
      };
      onCreateOverallGoal(goal);
      onShowToast?.('success', 'Overall goal added', `"${goal.title}" saved for ${company.name}.`);
    }

    setCreateMode(null);
  };

  return (
    <div className="goals-module-page is-simple">
      <PageHeader
        title="Goals"
        subtitle={`${company.name} · ${company.cyclePeriod}`}
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Goals' }
        ]}
        actions={
          canManageCompany ? (
            <select
              className="goals-company-select compact"
              aria-label="Company"
              value={company.id}
              onChange={(e) => {
                onCompanyChange(e.target.value);
                onShowToast?.(
                  'info',
                  'Company switched',
                  `Showing goals for ${MOCK_COMPANIES.find((c) => c.id === e.target.value)?.name}.`
                );
              }}
            >
              {MOCK_COMPANIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : undefined
        }
      />

      {/* Structured 3-Tab Header (My Goals, Team Goals, Overall Goals) */}
      <div className="goals-pill-nav" role="tablist" aria-label="Goal views">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`goals-pill ${isActive ? 'is-active' : ''}`}
              onClick={() => onNavigate(tab.route)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span className="goals-pill-count">{counts[tab.id]}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'my' && (
        <SimpleGoalsPanel
          goals={myCards}
          searchPlaceholder="Search my goals…"
          emptyTitle="No goals yet"
          emptyHint="Add a goal for yourself, or wait for your manager to assign one."
          primaryActionLabel={canAddMine ? 'Add Goal' : undefined}
          onPrimaryAction={canAddMine ? () => setCreateMode('my') : undefined}
          showUpdate={perms.canEditMyGoals}
          onUpdateGoal={(id) => {
            const g = myGoals.find((x) => x.id === id) || null;
            setUpdateGoal(g);
          }}
          onOpenGoal={(id) => onNavigate(`/performance/goals/${id}`)}
        />
      )}

      {activeTab === 'team' && perms.canViewTeamGoals && (
        <>
          {teamOkrs.length > 0 && (
            <div className="goals-focus-strip" aria-label="Team priorities">
              <span className="goals-focus-label">Team focus</span>
              <div className="goals-focus-items">
                {teamOkrs.slice(0, 3).map((t) => (
                  <span key={t.id} className="goals-focus-chip" title={t.description}>
                    {t.teamName}: {t.progress}%
                  </span>
                ))}
              </div>
            </div>
          )}
          <SimpleGoalsPanel
            goals={teamCards}
            searchPlaceholder="Search team goals…"
            emptyTitle="No team goals"
            emptyHint="Assign a goal to someone on your team."
            metaColumnLabel="Assignee"
            primaryActionLabel={canAddTeam ? 'Add Goal' : undefined}
            onPrimaryAction={canAddTeam ? () => setCreateMode('team') : undefined}
            onOpenGoal={(id) => onNavigate(`/performance/goals/${id}`)}
          />
        </>
      )}

      {activeTab === 'overall' && perms.canViewOverallGoals && (
        <SimpleGoalsPanel
          goals={companyCards}
          searchPlaceholder="Search overall goals…"
          emptyTitle="No overall goals"
          emptyHint={`No strategic objectives published for ${company.name} yet.`}
          metaColumnLabel="Owner"
          primaryActionLabel={canAddCompany ? 'Add Goal' : undefined}
          onPrimaryAction={canAddCompany ? () => setCreateMode('overall') : undefined}
          onOpenGoal={(id) => onNavigate(`/performance/goals/${id}`)}
        />
      )}

      {myGoals[0] && (
        <UpdateProgressModal
          goal={updateGoal || myGoals[0]}
          isOpen={!!updateGoal}
          onClose={() => setUpdateGoal(null)}
          onSave={(goalId, fields) => {
            onUpdateIndividualGoal(goalId, fields);
            setUpdateGoal(null);
            onShowToast?.(
              'success',
              'Progress updated',
              `${fields.currentAchievement} · ${fields.progress}%`
            );
          }}
        />
      )}

      {createMode && (
        <CreateGoalModal
          mode={createMode}
          companyName={company.name}
          selfName={SELF_NAME}
          assignees={assignees}
          onClose={() => setCreateMode(null)}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
};
