import React from 'react';
import { MyTeamView } from './my-team/MyTeamView';
import { ManagerReviewResponses } from '../data/mockManagerReview';

export interface TeamPerformanceViewProps {
  managerReviewResponses?: Record<string, ManagerReviewResponses>;
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const TeamPerformanceView: React.FC<TeamPerformanceViewProps> = ({
  managerReviewResponses,
  onNavigate,
  onShowToast
}) => {
  return (
    <MyTeamView
      managerReviewResponses={managerReviewResponses}
      onNavigate={onNavigate}
      onShowToast={onShowToast}
    />
  );
};
