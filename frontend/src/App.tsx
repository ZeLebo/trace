import {
  Controls,
  ReactFlow,
  applyNodeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ImportPanel } from './ImportPanel';
import CodeNode from './CodeNode';
import { FlowHighlighter } from './FlowHighlighter';
import { RunnerPanel, RunnerState } from './RunnerPanel';
import { TraceData, TimelineEntry, buildTraceFromSource } from './traceBuilder';
import { ensurePyodide } from './pyRunner';
import { OutputPanel } from './OutputPanel';

export default function App() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [runnerState, setRunnerState] = useState<RunnerState>('idle');
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(-1);
  const [fileName, setFileName] = useState<string>('');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [pyLoading, setPyLoading] = useState(false);
  const [pyError, setPyError] = useState<string | null>(null);

  const nodeTypes = useMemo(() => ({ code: CodeNode }), []);

  // Seed with a tiny example so the UI is not empty.
  useEffect(() => {
    const demo = buildTraceFromSource(
      [
        'def greet(name):',
        '    print(f\"hello, {name}\")',
        '',
        'greet(\"trace\")',
      ].join('\n'),
      'example.py'
    );
    setNodes(demo.nodes);
    setTimeline(demo.timeline);
    setFileName(demo.fileName ?? '');
    setSourceCode(demo.source);
  }, []);

  const resetHighlights = useCallback(() => {
    setNodes(nds =>
      nds.map(node => ({
        ...node,
        data: { ...node.data, highlighted: false },
      }))
    );
    setHighlightedId(null);
  }, []);

  const handleImport = useCallback((data: TraceData) => {
    setNodes(data.nodes);
    setTimeline(data.timeline);
    setFileName(data.fileName ?? '');
    setSourceCode(data.source);
    setRunnerState('idle');
    setCurrentMessageIndex(-1);
    setHighlightedId(null);
    setOutputLines([]);
    setPyError(null);
  }, []);

  const advanceStep = useCallback(() => {
    setCurrentMessageIndex(prev => {
      const next = prev + 1;
      if (next >= timeline.length) {
        setRunnerState('finished');
        return Math.min(prev, timeline.length - 1);
      }
      return next;
    });
  }, [timeline.length]);

  useEffect(() => {
    if (runnerState !== 'playing') return;
    if (!timeline.length) return;

    // Prime the first step when we start from idle.
    if (currentMessageIndex < 0) {
      setCurrentMessageIndex(0);
    }

    const interval = setInterval(advanceStep, 480);
    return () => clearInterval(interval);
  }, [runnerState, timeline.length, currentMessageIndex, advanceStep]);

  useEffect(() => {
    if (currentMessageIndex < 0 || currentMessageIndex >= timeline.length) {
      resetHighlights();
      return;
    }

    const lineno = timeline[currentMessageIndex].lineno.toString();
    setHighlightedId(lineno);

    setNodes(nds =>
      nds.map(node => ({
        ...node,
        data: { ...node.data, highlighted: node.id === lineno },
      }))
    );
  }, [currentMessageIndex, timeline, resetHighlights]);

  const onNodesChange = useCallback(
    changes => setNodes(snap => applyNodeChanges(changes, snap)),
    []
  );

  const runPython = useCallback(async () => {
    if (!sourceCode) return;
    setPyLoading(true);
    setPyError(null);
    setOutputLines([]);

    try {
      const py = await ensurePyodide();
      py.setStdout({
        batched: (text: string) =>
          setOutputLines(prev => [...prev, text]),
      });
      py.setStderr({
        batched: (text: string) =>
          setOutputLines(prev => [...prev, text]),
      });
      await py.runPythonAsync(sourceCode);
    } catch (err: any) {
      console.error(err);
      setPyError('Ошибка выполнения Python');
      setOutputLines(prev => [...prev, String(err)]);
    } finally {
      setPyLoading(false);
    }
  }, [sourceCode]);

  const handleStart = () => {
    if (!timeline.length) return;
    setRunnerState('playing');
    if (currentMessageIndex < 0) setCurrentMessageIndex(0);
    runPython();
  };

  const handlePause = () => setRunnerState('paused');

  const handleResume = () => {
    if (!timeline.length) return;
    setRunnerState('playing');
  };

  const handleRestart = () => {
    if (!timeline.length) return;
    setRunnerState('playing');
    setCurrentMessageIndex(0);
    runPython();
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden flex flex-col">
      <div
        className="stage fixed inset-0 pointer-events-none"
        style={{
          filter:
            'blur(var(--blur)) brightness(calc(1 + (var(--intensity,1) - 1) * 0.25))',
        }}
      >
        <div className="blob b1"></div>
        <div className="blob b2"></div>
        <div className="blob b3"></div>
      </div>

      <style>{`
        :root {
          --h: 140;
          --s: 24%;
          --l: 30%;
          --intensity: 1;
          --speed: 1;
          --scale: 1;
          --blur: 80px;
          --ease: cubic-bezier(.25,.8,.25,1);
        }

        html, body, #root {
          height: 100%;
          margin: 0;
          background:
            radial-gradient(1200px 800px at 20% 20%, hsl(calc(var(--h) - 4), calc(var(--s) - 6%), calc(var(--l) + 6%)), transparent 40%),
            radial-gradient(900px 600px at 75% 30%, hsl(calc(var(--h) + 6), calc(var(--s)), calc(var(--l) + 4%)), transparent 45%),
            hsl(var(--h), calc(var(--s) - 4%), calc(var(--l) - 4%));
          overflow: hidden;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          mix-blend-mode: screen;
          opacity: calc(0.6 * var(--intensity));
          will-change: transform;
          background: radial-gradient(circle at 30% 30%,
            hsl(var(--h), calc(var(--s) + 8%), calc(var(--l) + 14%)),
            hsl(var(--h), var(--s), calc(var(--l) + 4%)) 40%,
            transparent 75%);
          width: calc(60vmax * var(--scale));
          height: calc(60vmax * var(--scale));
        }
        .b1 { animation: move1 calc(32s / var(--speed)) var(--ease) infinite; }
        .b2 { animation: move2 calc(42s / var(--speed)) var(--ease) infinite; }
        .b3 { animation: move3 calc(52s / var(--speed)) var(--ease) infinite; }

        @keyframes move1 {
          0% { transform: translate(-20%, -12%) scale(1); }
          50% { transform: translate(-32%, 6%) scale(1.05); }
          100% { transform: translate(-20%, -12%) scale(1); }
        }
        @keyframes move2 {
          0% { transform: translate(14%, 20%) scale(1.1); }
          50% { transform: translate(4%, -6%) scale(0.98); }
          100% { transform: translate(14%, 20%) scale(1.1); }
        }
        @keyframes move3 {
          0% { transform: translate(-4%, 28%) scale(0.95); }
          50% { transform: translate(18%, 16%) scale(1.08); }
          100% { transform: translate(-4%, 28%) scale(0.95); }
        }
      `}</style>

      <div className="flex-1 w-full relative z-20">
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          fitView
          panOnScroll
          proOptions={{ hideAttribution: true }}
          minZoom={0.01}
          maxZoom={1000}
          panOnScrollSpeed={1}
          className="w-full h-full bg-transparent"
        >
          <FlowHighlighter highlightedId={highlightedId} />

          <ImportPanel onImport={handleImport} />

          <RunnerPanel
            state={runnerState}
            hasTimeline={timeline.length > 0}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onRestart={handleRestart}
          />

          <Controls />
        </ReactFlow>
      </div>

      <div className="w-full h-16 flex items-center px-4 overflow-x-auto z-20 bg-[#292C33]">
        <div className="text-white text-xs mr-4 opacity-70">
          {fileName || 'Нет файла'}
        </div>
        {timeline.map((msg, idx) => {
          const isSelected = currentMessageIndex === idx;

          return (
            <div
              key={idx}
              className={`flex flex-col items-center flex-none w-8 mx-1 transition-all duration-300
                ${
                  isSelected
                    ? 'bg-yellow-400 border-yellow-600'
                    : 'bg-gray-400/50 border-gray-600'
                }
                rounded-full border-2 h-8`}
              title={`Шаг ${idx + 1}, строка ${msg.lineno}`}
              style={{ pointerEvents: 'none' }}
            >
              <span className="text-xs text-white mt-1 font-bold">
                {msg.lineno}
              </span>
            </div>
          );
        })}
      </div>

      <OutputPanel lines={outputLines} loading={pyLoading} error={pyError} />
    </div>
  );
}
