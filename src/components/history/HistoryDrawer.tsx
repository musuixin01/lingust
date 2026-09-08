import React from 'react';
import { HistoryWindow, HistoryWindowProps } from './HistoryWindow';

export type HistoryDrawerProps = HistoryWindowProps;

export const HistoryDrawer: React.FC<HistoryDrawerProps> = (props) => {
  return <HistoryWindow {...props} />;
};

export { HistoryWindow };
