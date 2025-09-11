'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PenLine, Trash2, Plus, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';

interface SavedSignature {
  id: string;
  name: string;
  signature_data: string; // base64 encoded signature image
  created_at: string;
}

interface SavedSignaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSignature: (signatureData: string) => void;
}

export default function SavedSignaturesModal({ isOpen, onClose, onSelectSignature }: SavedSignaturesModalProps) {
  const t = useTranslations('documents.savedSignatures');
  const tButtons = useTranslations('documents.buttons');
  
  const [signatures, setSignatures] = useState<SavedSignature[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSignatureName, setNewSignatureName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSignatures();
    }
  }, [isOpen]);

  // Initialize canvas
  useEffect(() => {
    if (isCreating && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 400;
      canvas.height = 150;

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isCreating]);

  const fetchSignatures = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_signatures')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSignatures(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    if (!canvasRef.current || !newSignatureName.trim()) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const signatureData = canvasRef.current.toDataURL();

      const { error } = await supabase
        .from('user_signatures')
        .insert([{
          user_id: user.id,
          name: newSignatureName.trim(),
          signature_data: signatureData
        }]);

      if (error) throw error;

      setNewSignatureName('');
      setIsCreating(false);
      clearCanvas();
      fetchSignatures();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSignature = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('user_signatures')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSignatures();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-error text-sm">
            {error}
          </div>
        )}

        {!isCreating ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-platinum">{t('yourSignatures')}</h3>
              <button
                onClick={() => setIsCreating(true)}
                className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                {t('createNew')}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-sunset">
                {tButtons('loading')}
              </div>
            ) : signatures.length === 0 ? (
              <div className="text-center py-8 text-sunset">
                <PenLine className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('noSignatures')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {signatures.map((signature) => (
                  <div
                    key={signature.id}
                    className="border border-card-border rounded-lg p-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-platinum text-sm truncate">
                        {signature.name}
                      </h4>
                      <button
                        onClick={() => deleteSignature(signature.id)}
                        className="text-error hover:text-error/80 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div 
                      className="bg-white rounded border p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        onSelectSignature(signature.signature_data);
                        onClose();
                      }}
                    >
                      <img
                        src={signature.signature_data}
                        alt={signature.name}
                        className="w-full h-16 object-contain"
                      />
                    </div>
                    <p className="text-xs text-sunset mt-2">
                      {new Date(signature.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-platinum">{t('createSignature')}</h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewSignatureName('');
                  clearCanvas();
                }}
                className="btn-secondary px-4 py-2 rounded-lg"
              >
                {tButtons('cancel')}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-sunset mb-2">
                {t('signatureName')}
              </label>
              <input
                type="text"
                value={newSignatureName}
                onChange={(e) => setNewSignatureName(e.target.value)}
                className="input-base w-full"
                placeholder={t('enterSignatureName')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sunset mb-2">
                {t('drawSignature')}
              </label>
              <div className="bg-white rounded-lg border border-card-border p-4">
                <canvas
                  ref={canvasRef}
                  className="w-full border border-dashed border-gray-300 rounded cursor-crosshair"
                  style={{ height: '150px' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={clearCanvas}
                className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                {t('clear')}
              </button>

              <button
                onClick={saveSignature}
                disabled={!newSignatureName.trim() || loading}
                className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? tButtons('saving') : t('saveSignature')}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
