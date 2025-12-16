export const formatTime = (date = new Date(), options = {}) => {
  const defaultOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleTimeString('en-US', { ...defaultOptions, ...options });
};

export const getTimeUntilTarget = (targetTime) => {
  const now = new Date();
  const [time, period] = targetTime.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  const target = new Date();
  target.setHours(period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours, minutes, 0, 0);
  if (target < now) {
    target.setDate(target.getDate() + 1);
  }
  return Math.max(0, Math.floor((target - now) / 1000));
};

