import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative glass rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col z-10 border border-slate-800/40">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/50 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 no-scrollbar text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
