// CodeNode.tsx
import { useRef, useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl as theme } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeNodeProps {
  id: string;
  data: {
    label: string;
  };
}

export default function CodeNode({ id, data }: CodeNodeProps) {
  const idRef = useRef<HTMLDivElement>(null);
  const [idWidth, setIdWidth] = useState(0);

  useEffect(() => {
    if (idRef.current) {
      setIdWidth(idRef.current.offsetWidth);
    }
  }, [id]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Node ID (absolute to the left, dynamic spacing) */}
      <div
        ref={idRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: -(idWidth + 8),
          transform: 'translateY(-50%)',
          color: '#FFA500', // pleasant orange
          fontSize: 12,
          fontFamily: 'monospace',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {id}
      </div>

      {/* Node content */}
      <div
        style={{
          background: '#1e1e1e',
          borderRadius: 6,
          padding: 8,
          width: 'fit-content',
        }}
      >
        <SyntaxHighlighter
          language="python"
          style={theme}
          wrapLines={true}
          showLineNumbers={false}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontSize: 12,
            lineHeight: '18px',
          }}
        >
          {data.label}
        </SyntaxHighlighter>

        {/* IO Ports */}
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
}
