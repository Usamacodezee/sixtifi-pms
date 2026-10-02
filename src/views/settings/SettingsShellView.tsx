import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { CompetenciesTab } from './CompetenciesTab';
import { QuestionTemplatesTab } from './QuestionTemplatesTab';
import { CompetencyMappingView } from './CompetencyMappingView';
import { QuestionMappingView } from './QuestionMappingView';
import { KrasPage } from '../modules/KrasPage';
import { KpisPage } from '../modules/KpisPage';
import {
  SettingsCompetency,
  QuestionTemplate,
  CompetencyMapping,
  QuestionMapping
} from '../../data/mockSettings';
import { KraItem, KpiItem } from '../../data/mockPerformanceModules';
import { ToastType } from '../../components/ui/Toast';
import {
  Award,
  FileText,
  Target,
  Layers,
  Star,
  Database,
  ChevronDown,
  ChevronRight,
  Gauge,
  ListTree
} from 'lucide-react';
import '../cycles/CreateCycleWizard.css';
import '../cycles/CycleEmployeesTab.css';
import '../cycles/PerformanceCycleDetailView.css';
import './SettingsStyles.css';

export type SettingsTab =
  | 'result-areas'
  | 'metrics'
  | 'competencies'
  | 'competency-mapping'
  | 'question-templates'
  | 'question-mapping';

export const SETTINGS_TAB_ROUTES: Record<SettingsTab, string> = {
  'result-areas': '/performance/settings/result-areas',
  metrics: '/performance/settings/metrics',
  competencies: '/performance/settings/competencies',
  'competency-mapping': '/performance/settings/competency-mapping',
  'question-templates': '/performance/settings/question-templates',
  'question-mapping': '/performance/settings/question-mapping'
};

export const parseSettingsTab = (raw: string): SettingsTab => {
  const known: SettingsTab[] = [
    'result-areas',
    'metrics',
    'competencies',
    'competency-mapping',
    'question-templates',
    'question-mapping'
  ];
  if (!raw || raw === 'goals' || raw === 'general' || raw === 'review-rating') return 'result-areas';
  return known.includes(raw as SettingsTab) ? (raw as SettingsTab) : 'result-areas';
};

type NavChild = { id: SettingsTab; label: string; icon: typeof Target; route: string };
type NavGroup = {
  id: string;
  label: string;
  icon: typeof Target;
  children: NavChild[];
  defaultChild: SettingsTab;
};

const TOP_ITEMS: NavChild[] = [];

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'reference-data',
    label: 'Reference Data',
    icon: Database,
    defaultChild: 'result-areas',
    children: [
      {
        id: 'result-areas',
        label: 'Result Areas',
        icon: Layers,
        route: SETTINGS_TAB_ROUTES['result-areas']
      },
      { id: 'metrics', label: 'Metrics', icon: Gauge, route: SETTINGS_TAB_ROUTES.metrics }
    ]
  },
  {
    id: 'competency',
    label: 'Competency',
    icon: Award,
    defaultChild: 'competencies',
    children: [
      {
        id: 'competencies',
        label: 'Competency Templates',
        icon: ListTree,
        route: SETTINGS_TAB_ROUTES.competencies
      },
      {
        id: 'competency-mapping',
        label: 'Competency Mapping',
        icon: Layers,
        route: SETTINGS_TAB_ROUTES['competency-mapping']
      }
    ]
  },
  {
    id: 'questions',
    label: 'Questions',
    icon: FileText,
    defaultChild: 'question-templates',
    children: [
      {
        id: 'question-templates',
        label: 'Question Templates',
        icon: FileText,
        route: SETTINGS_TAB_ROUTES['question-templates']
      },
      {
        id: 'question-mapping',
        label: 'Question Mapping',
        icon: Layers,
        route: SETTINGS_TAB_ROUTES['question-mapping']
      }
    ]
  }
];

export interface SettingsShellViewProps {
  activeTab: SettingsTab;
  competencies: SettingsCompetency[];
  onUpdateCompetencies: (list: SettingsCompetency[]) => void;
  questionTemplates: QuestionTemplate[];
  onUpdateQuestionTemplates: (list: QuestionTemplate[]) => void;
  competencyMappings: CompetencyMapping[];
  onUpdateCompetencyMappings: (list: CompetencyMapping[]) => void;
  questionMappings: QuestionMapping[];
  onUpdateQuestionMappings: (list: QuestionMapping[]) => void;
  resultAreas: KraItem[];
  onUpdateResultAreas: (list: KraItem[]) => void;
  metrics: KpiItem[];
  onUpdateMetrics: (list: KpiItem[]) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

const groupContainsTab = (group: NavGroup, tab: SettingsTab) =>
  group.children.some((c) => c.id === tab);

export const SettingsShellView: React.FC<SettingsShellViewProps> = ({
  activeTab,
  competencies,
  onUpdateCompetencies,
  questionTemplates,
  onUpdateQuestionTemplates,
  competencyMappings,
  onUpdateCompetencyMappings,
  questionMappings,
  onUpdateQuestionMappings,
  resultAreas,
  onUpdateResultAreas,
  metrics,
  onUpdateMetrics,
  onNavigate,
  onShowToast
}) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => {
      initial[g.id] = groupContainsTab(g, activeTab);
    });
    // Keep all parents expanded by default for discoverability
    NAV_GROUPS.forEach((g) => {
      if (initial[g.id] === undefined) initial[g.id] = true;
    });
    return { 'reference-data': true, competency: true, questions: true };
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="settings-page animate-fade-in">
      <PageHeader
        title="Performance Settings"
        subtitle="Configure reference data, competencies, and questions. Goal rules, weights, review flow, rating scale, and employee policies are managed directly within Appraisal Cycles."
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Settings' }
        ]}
      />

      <div className="targeting-chain">
        {['Company', 'Department', 'Designation', 'Grade', 'Review Type', 'Questions / Competencies'].map(
          (step, idx, arr) => (
            <React.Fragment key={step}>
              <span className="targeting-chain-item">{step}</span>
              {idx < arr.length - 1 && <span className="targeting-chain-arrow">&rarr;</span>}
            </React.Fragment>
          )
        )}
      </div>

      <div className="settings-shell">
        <nav className="settings-nav">
          {TOP_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`settings-nav-item ${isActive ? 'is-active' : ''}`}
                onClick={() => onNavigate(item.route)}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {NAV_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = openGroups[group.id] !== false;
            const groupActive = groupContainsTab(group, activeTab);

            return (
              <div key={group.id} className="settings-nav-group">
                <button
                  type="button"
                  className={`settings-nav-parent ${groupActive ? 'is-group-active' : ''}`}
                  onClick={() => {
                    if (!isOpen) {
                      setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
                    } else if (!groupActive) {
                      toggleGroup(group.id);
                    }
                    onNavigate(SETTINGS_TAB_ROUTES[group.defaultChild]);
                  }}
                >
                  <GroupIcon size={15} />
                  <span>{group.label}</span>
                  <span
                    className="settings-nav-chevron"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(group.id);
                    }}
                  >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="settings-nav-children">
                    {group.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isActive = activeTab === child.id;
                      return (
                        <button
                          key={child.id}
                          type="button"
                          className={`settings-nav-item is-child ${isActive ? 'is-active' : ''}`}
                          onClick={() => onNavigate(child.route)}
                        >
                          <ChildIcon size={14} />
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="settings-content">
          {activeTab === 'result-areas' && (
            <KrasPage
              resultAreas={resultAreas}
              metrics={metrics}
              onUpdateResultAreas={onUpdateResultAreas}
              onUpdateMetrics={onUpdateMetrics}
              onNavigate={onNavigate}
              onShowToast={onShowToast}
              embedded
            />
          )}

          {activeTab === 'metrics' && (
            <KpisPage
              metrics={metrics}
              resultAreas={resultAreas}
              onUpdateMetrics={onUpdateMetrics}
              onUpdateResultAreas={onUpdateResultAreas}
              onNavigate={onNavigate}
              onShowToast={onShowToast}
              embedded
            />
          )}

          {activeTab === 'competencies' && (
            <CompetenciesTab
              competencies={competencies}
              onUpdateCompetencies={onUpdateCompetencies}
              onNavigate={onNavigate}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'competency-mapping' && (
            <CompetencyMappingView
              mappings={competencyMappings}
              onUpdateMappings={onUpdateCompetencyMappings}
              competencies={competencies}
              onNavigate={onNavigate}
              onShowToast={onShowToast}
              embedded
            />
          )}

          {activeTab === 'question-templates' && (
            <QuestionTemplatesTab
              templates={questionTemplates}
              onUpdateTemplates={onUpdateQuestionTemplates}
              onNavigate={onNavigate}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'question-mapping' && (
            <QuestionMappingView
              mappings={questionMappings}
              onUpdateMappings={onUpdateQuestionMappings}
              templates={questionTemplates}
              onNavigate={onNavigate}
              onShowToast={onShowToast}
              embedded
            />
          )}
        </div>
      </div>
    </div>
  );
};
