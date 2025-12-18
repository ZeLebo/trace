import { useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';

export function FlowHighlighter({ highlightedId }: { highlightedId: string | null }) {
  const reactFlow = useReactFlow();

  useEffect(() => {
    if (!highlightedId) return;

    const node = reactFlow.getNode(highlightedId);
    if (!node) return;

    const { x, y } = node.position;
    const width = node.width ?? 0;
    const height = node.height ?? 0;

    reactFlow.setCenter(x + width / 2, y + height / 2, {
      duration: 400,
      zoom: reactFlow.getZoom(),
    });
  }, [highlightedId, reactFlow]);

  return null;
}
