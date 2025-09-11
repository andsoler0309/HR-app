'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, HelpCircle, GraduationCap } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'info' | 'help' | 'tour';
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  cancelButton?: {
    label: string;
    onClick: () => void;
  };
}

export default function NotificationModal({
  isOpen,
  onClose,
  title,
  message,
  type,
  actionButton,
  cancelButton
}: NotificationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'tour':
        return <GraduationCap className="h-6 w-6 text-blue-500" />;
      case 'help':
        return <HelpCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'tour':
        return 'border-blue-200 bg-blue-50';
      case 'help':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md mx-4 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getAccentColor()}`}>
                {getIcon()}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            {cancelButton && (
              <button
                onClick={cancelButton.onClick}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {cancelButton.label}
              </button>
            )}
            {actionButton && (
              <button
                onClick={actionButton.onClick}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {actionButton.label}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
