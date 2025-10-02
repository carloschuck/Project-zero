const StatusBadge = ({ status }) => {
  const statusClasses = {
    open: 'badge-open',
    in_progress: 'badge-in-progress',
    resolved: 'badge-resolved',
    closed: 'badge-closed',
  };

  const statusLabels = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  return (
    <span className={statusClasses[status] || 'badge'}>
      {statusLabels[status] || status}
    </span>
  );
};

export default StatusBadge;


