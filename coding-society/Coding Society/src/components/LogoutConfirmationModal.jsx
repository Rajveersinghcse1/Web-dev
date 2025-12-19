import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { LogOut, X, AlertTriangle, Shield } from 'lucide-react';

/**
 * LogoutConfirmationModal - Enhanced logout confirmation with better UX
 * Features:
 * - Clear confirmation dialog
 * - Keyboard navigation support
 * - Focus management
 * - Smooth animations
 * - Security warning
 */
const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm, userName = 'User' }) => {
  const [isClosing, setIsClosing] = useState(false);
  const confirmButtonRef = useRef(null);
  const modalRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      // Focus the confirm button when modal opens
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'Enter') {
        handleConfirm();
      } else if (e.key === 'Tab') {
        // Handle tab navigation within modal
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onConfirm();
    }, 200);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        ${isOpen && !isClosing ? 'animate-fade-in' : 'animate-fade-out'}
      `}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      aria-describedby="logout-modal-description"
    >
      {/* Backdrop - Click to close */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleClose}
        aria-label="Close modal"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-2xl shadow-2xl border border-gray-200
          w-full max-w-md mx-auto transform transition-all duration-200
          ${isOpen && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 id="logout-modal-title" className="text-lg font-semibold text-gray-900">
                  Confirm Logout
                </h3>
                <p className="text-sm text-gray-600">
                  {userName}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white/60 focus:bg-white/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Close logout confirmation"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p id="logout-modal-description" className="text-gray-700 leading-relaxed">
                Are you sure you want to sign out? You'll need to log in again to access your account and dashboard.
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Your session will be securely ended and all temporary data will be cleared.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </Button>
            <Button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        
        .animate-fade-out {
          animation: fade-out 0.2s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default LogoutConfirmationModal;