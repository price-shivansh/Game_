import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-300 ${
        glow ? 'glass-panel-glow' : 'glass-panel'
      } ${onClick ? 'cursor-pointer hover:border-primary/40 hover:-translate-y-1' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
