import React from 'react';
import { PerformanceCyclesView as CyclesListView } from './cycles/PerformanceCyclesView';

import { PerformanceCycle } from '../types/performance';

export interface PerformanceCyclesViewProps {
  cycles?: PerformanceCycle[];
  onNavigate?: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const PerformanceCyclesView: React.FC<PerformanceCyclesViewProps> = ({
  cycles,
  onNavigate = () => {},
  onShowToast
}) => {
  return <CyclesListView cycles={cycles} onNavigate={onNavigate} onShowToast={onShowToast} />;
};
