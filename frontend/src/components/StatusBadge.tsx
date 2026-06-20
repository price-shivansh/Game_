import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status.toLowerCase()) {
      case 'live':
        return 'bg-accent/20 text-accent border border-accent/40 animate-pulse';
      case 'completed':
      case 'approved':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      case 'pending':
      case 'upcoming':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
      case 'active':
        return 'bg-primary/20 text-primary border border-primary/40 text-glow-primary';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border border-red-500/40';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/40';
    }
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${getStyles()}`}>
      {status}
    </span>
  );
};
