'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Document } from '@/types/document'
import { X, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  isOpen: boolean
  onClose: () => void
  document: Document
  onSuccess: () => void
}

export default function DocumentVersionModal({ isOpen, onClose, document, onSuccess }: Props) {
  const t = useTranslations('documents.uploadVersionModal')
  const tButtons = useTranslations('documents.buttons')

  const [file, setFile] = useState<File | null>(null)
  const [changes, setChanges] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      // Upload new version to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${document.id}_v${document.version + 1}.${fileExt}`
      const filePath = `documents/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicUrlData } = await supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      if ( !publicUrlData?.publicUrl) throw new Error(t('uploadError'))

      // Create version record
      const { error: versionError } = await supabase
        .from('document_versions')
        .insert([{
          document_id: document.id,
          version_number: document.version + 1,
          file_url: publicUrlData.publicUrl,
          file_size: file.size,
          changes_description: changes
        }])

      if (versionError) throw versionError

      // Update document record
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          version: document.version + 1,
          file_url: publicUrlData.publicUrl,
          file_size: file.size,
          updated_at: new Date().toISOString()
        })
        .eq('id', document.id)

      if (updateError) throw updateError

      // Reset form
      setFile(null)
      setChanges('')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error uploading new version:', error)
      setError(error.message || t('uploadError'))
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md border border-card-border shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-platinum">{t('title')}</h2>
          <button onClick={onClose} className="text-sunset hover:text-flame">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-sm text-error bg-error/10 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-sunset">
              {t('file')}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-card-border hover:border-flame">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-sunset" />
                <div className="flex text-sm text-sunset">
                  <label htmlFor="version-upload" className="relative cursor-pointer rounded-md font-medium text-flame hover:text-vanilla">
                    <span>{t('uploadAFile')}</span>
                    <input
                      id="version-upload"
                      name="version-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                  </label>
                  <p className="pl-1">{t('orDragAndDrop')}</p>
                </div>
                <p className="text-xs text-sunset/70">
                  {t('fileTypes')}
                </p>
                {file && (
                  <p className="text-sm text-sunset">
                    {t('selected', { fileName: file.name })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Changes Description */}
          <div>
            <label className="block text-sm font-medium text-sunset">
              {t('changesDescription')}
            </label>
            <textarea
              rows={3}
              className="input-base mt-1"
              placeholder={t('enterChangesDescription')}
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 rounded-md"
            >
              {tButtons('cancel')}
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn-primary px-4 py-2 rounded-md disabled:opacity-50"
            >
              {uploading ? tButtons('uploading') : tButtons('uploadVersion')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
