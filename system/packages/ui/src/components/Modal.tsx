import React from 'react';
import { Button } from './Button.js';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="mech-modal-backdrop" onClick={handleBackdropClick}>
      <div className={`mech-modal-container ${size === 'lg' ? 'mech-modal-container-lg' : ''}`}>
        <div className="mech-modal-header">
          <h3>{title}</h3>
          <button className="mech-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="mech-modal-body">{children}</div>
        <div className="mech-modal-footer">
          {footer || (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
