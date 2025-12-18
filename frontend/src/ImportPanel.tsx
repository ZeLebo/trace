import { Panel } from '@xyflow/react';
import { useState, useRef } from 'react';
import { PanelButton } from './ui/PanelButton';
import { buildTraceFromSource, TraceData } from './traceBuilder';

type ImportPanelProps = {
  onImport: (data: TraceData) => void;
};

export function ImportPanel({ onImport }: ImportPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileImport = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const contents = await file.text();
      const parsed = buildTraceFromSource(contents, file.name);
      onImport(parsed);
    } catch (err) {
      console.error(err);
      setError('Не удалось прочитать файл.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onImportClick = () => inputRef.current?.click();

  return (
    <Panel position="top-center">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <PanelButton onClick={onImportClick} disabled={loading}>
          {loading ? 'Импорт...' : 'Импортировать .py'}
        </PanelButton>
        {error && (
          <span style={{ color: '#ffb4a2', fontSize: 12 }}>
            {error}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".py"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileImport(file);
        }}
      />
    </Panel>
  );
}
