import React from 'react';
import { CompetenciesTab, CompetenciesTabProps } from './CompetenciesTab';

export const CompetencyMappingView: React.FC<CompetenciesTabProps> = (props) => {
  return (
    <CompetenciesTab
      {...props}
      initialSubTab="mapping"
    />
  );
};
