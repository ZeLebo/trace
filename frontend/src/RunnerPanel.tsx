import { Panel } from '@xyflow/react';
import { PanelButton } from './ui/PanelButton';

export type RunnerState = 'idle' | 'playing' | 'paused' | 'finished';

type RunnerPanelProps = {
  state: RunnerState;
  hasTimeline: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
};

export function RunnerPanel({
  state,
  hasTimeline,
  onStart,
  onPause,
  onResume,
  onRestart,
}: RunnerPanelProps) {
  if (!hasTimeline) return null;

  let label = 'Запустить';
  let action = onStart;
  let disabled = false;

  if (state === 'playing') {
    label = 'Пауза';
    action = onPause;
  } else if (state === 'paused') {
    label = 'Продолжить';
    action = onResume;
  } else if (state === 'finished') {
    label = 'Перезапуск';
    action = onRestart;
  }

  return (
    <Panel position="center-right">
      <PanelButton
        onClick={action}
        disabled={disabled}
        style={{ marginBottom: 8 }}
      >
        {label}
      </PanelButton>
    </Panel>
  );
}
