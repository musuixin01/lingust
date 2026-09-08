import React from 'react';
import { SettingsWindow, SettingsWindowProps } from './SettingsWindow';

export type SettingsModalProps = SettingsWindowProps;

export const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  return <SettingsWindow {...props} />;
};

export { SettingsWindow };
