import React, { useEffect } from 'react';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'loading' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose,
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible && type !== 'loading') {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <Check size={20} />,
    error: <X size={20} />,
    loading: <Loader2 size={20} className="animate-spin" />,
    info: <AlertCircle size={20} />
  };

  const colors = {
    success: 'from-green-500 to-emerald-500',
    error: 'from-red-500 to-rose-500',
    loading: 'from-cyan-500 to-fuchsia-500',
    info: 'from-blue-500 to-cyan-500'
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`px-5 py-3 bg-gradient-to-r ${colors[type]} rounded-2xl shadow-2xl flex items-center gap-3`}>
        <div className="text-white">
          {icons[type]}
        </div>
        <span className="text-white font-bold text-sm">{message}</span>
        {type !== 'loading' && (
          <button onClick={onClose} className="text-white/60 hover:text-white ml-2">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Hook for managing toasts
import { useState, useCallback } from 'react';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showLoading = useCallback((message: string) => showToast(message, 'loading'), [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showLoading
  };
};
