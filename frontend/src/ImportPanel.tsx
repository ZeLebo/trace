// ImportPanel.tsx
import { useReactFlow, Panel } from '@xyflow/react'
import { useState, useRef } from 'react'
import { PanelButton } from './ui/PanelButton'

export function ImportPanel() {
  const { setNodes, setEdges } = useReactFlow()
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFileImport = async (file: File) => {
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/api/import', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to import file')

      const data = await response.json()
      setNodes(data.nodes)
      setEdges(data.edges)
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onImportClick = () => {
    inputRef.current?.click()
  }

  return (
    <Panel position="top-center">
      <PanelButton onClick={onImportClick} disabled={loading}>
        {loading ? 'Importing…' : 'Replace with a Python Script'}
      </PanelButton>

      <input
        ref={inputRef}
        type="file"
        accept=".py"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileImport(file)
        }}
      />
    </Panel>
  )
}
