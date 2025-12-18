export type TimelineEntry = {
  lineno: number;
  event: 'line';
  text: string;
  indent: number;
};

export type TraceData = {
  nodes: any[];
  timeline: TimelineEntry[];
  fileName?: string;
  source: string;
};

/**
 * Build flow nodes and a linear timeline out of a Python source string.
 * We only care about non-empty, non-comment lines and keep indentation
 * to position nodes horizontally.
 */
export function buildTraceFromSource(source: string, fileName = 'script.py'): TraceData {
  const nodes: any[] = [];
  const timeline: TimelineEntry[] = [];

  source.split(/\r?\n/).forEach((rawLine, idx) => {
    const lineno = idx + 1;
    const text = rawLine.trim();
    if (!text || text.startsWith('#')) return;

    const indent = rawLine.match(/^\s*/)?.[0].length ?? 0;
    const nodeId = lineno.toString();

    nodes.push({
      id: nodeId,
      type: 'code',
      position: {
        x: Math.floor(indent / 4) * 32,
        y: nodes.length * 48,
      },
      data: {
        label: text,
        highlighted: false,
        framePointer: null,
      },
    });

    timeline.push({
      lineno,
      event: 'line',
      text,
      indent,
    });
  });

  return { nodes, timeline, fileName, source };
}
