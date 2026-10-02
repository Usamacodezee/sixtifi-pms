import React from 'react';
import { MyPerformanceMainView } from './my-performance/MyPerformanceMainView';
import { FinalReviewDecision } from '../data/mockFinalReview';
import { MyGoalItem } from '../data/mockMyGoals';
import { EmployeeVisibilitySettings, ReviewFlowOption } from '../data/mockSettings';
import { PerformanceCycle } from '../types/performance';

export interface MyPerformanceViewProps {
  onNavigate?: (route: string) => void;
  goals: MyGoalItem[];
  selfReviewStatus: 'Pending' | 'Completed';
  managerReviewIsDone?: boolean;
  finalReviewDecision?: FinalReviewDecision;
  employeeVisibility?: EmployeeVisibilitySettings;
  reviewFlow?: ReviewFlowOption;
  activeCycle?: PerformanceCycle;
  allCycles?: PerformanceCycle[];
  onSelectCycleId?: (cycleId: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const MyPerformanceView: React.FC<MyPerformanceViewProps> = ({
  onNavigate = () => {},
  goals,
  selfReviewStatus,
  managerReviewIsDone,
  finalReviewDecision,
  employeeVisibility,
  reviewFlow,
  activeCycle,
  allCycles,
  onSelectCycleId,
  onShowToast
}) => {
  return (
    <MyPerformanceMainView
      onNavigate={onNavigate}
      goals={goals}
      selfReviewStatus={selfReviewStatus}
      managerReviewIsDone={managerReviewIsDone}
      finalReviewDecision={finalReviewDecision}
      employeeVisibility={employeeVisibility}
      reviewFlow={reviewFlow}
      activeCycle={activeCycle}
      allCycles={allCycles}
      onSelectCycleId={onSelectCycleId}
      onShowToast={onShowToast}
    />
  );
};

