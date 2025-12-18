type OutputPanelProps = {
  lines: string[];
  loading: boolean;
  error: string | null;
};

export function OutputPanel({ lines, loading, error }: OutputPanelProps) {
  return (
    <div className="w-full max-h-40 overflow-auto bg-[#1b1d22] text-[#d6d8de] text-xs px-4 py-2 border-t border-[#333]">
      <div className="flex items-center gap-3 mb-2">
        <span className="uppercase tracking-wide text-[10px] text-[#9aa0aa]">
          Вывод Python
        </span>
        {loading && <span className="text-[#ffd166]">Загрузка/выполнение...</span>}
        {error && <span className="text-[#ff6b6b]">{error}</span>}
      </div>
      {lines.length === 0 && !error && (
        <div className="text-[#555]">Пусто. Нажми Запустить, чтобы получить вывод.</div>
      )}
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
        {lines.join('')}
      </pre>
    </div>
  );
}
