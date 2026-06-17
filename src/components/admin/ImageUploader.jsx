import { useState, useRef } from 'react'
import { uploadFile } from '../../lib/api'

export default function ImageUploader({ images, onChange, entryId }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  const uploadFiles = async (files) => {
    setUploading(true)
    try {
      const urls = []
      for (const file of files) {
        const path = `entries/${entryId || Date.now()}/${Date.now()}-${file.name}`
        const url = await uploadFile('images', file, path)
        urls.push(url)
      }
      onChange([...images, ...urls])
    } catch (err) {
      alert('上传失败: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) uploadFiles(files)
  }

  const handlePick = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) uploadFiles(files)
    e.target.value = ''
  }

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div>
      {/* Uploaded images preview */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {images.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
            <img
              src={url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1.5px solid #e0ddd8' }}
            />
            <button
              onClick={() => removeImage(i)}
              style={{
                position: 'absolute', top: -6, right: -6,
                width: 18, height: 18, borderRadius: '50%',
                background: '#FF6B7A', color: '#fff',
                border: 'none', cursor: 'pointer',
                fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? '#6FA8FF' : '#d8d5d0'}`,
          borderRadius: 10,
          padding: '20px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#f0f5ff' : '#faf9f6',
          transition: 'all 0.2s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePick}
        />
        {uploading ? (
          <span style={{ fontSize: 12, color: '#a0998f', fontFamily: '"IBM Plex Mono", monospace' }}>
            上传中...
          </span>
        ) : (
          <>
            <div style={{ fontSize: 24, marginBottom: 4 }}>🖼️</div>
            <span style={{ fontSize: 12, color: '#a0998f', fontFamily: '"IBM Plex Mono", monospace' }}>
              拖入图片 或 点击选择
            </span>
          </>
        )}
      </div>
    </div>
  )
}
