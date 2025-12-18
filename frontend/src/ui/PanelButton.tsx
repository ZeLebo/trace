import type { ButtonHTMLAttributes } from 'react';

export function PanelButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: '4px 8px',
        fontSize: 12,
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 4,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        ...props.style,
      }}
    />
  );
}
