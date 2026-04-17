export const getWorkingDaysInMonth = (year: number, month: number): number => {
  let count = 0;
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) count++;
    date.setDate(date.getDate() + 1);
  }
  return count;
};

export const getWorkingDaysPassed = (year: number, month: number): number => {
  let count = 0;
  const today = new Date();
  const date = new Date(year, month, 1);
  
  // Count full working days before today
  while (date.getMonth() === month && date.getDate() < today.getDate()) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) count++;
    date.setDate(date.getDate() + 1);
  }
  
  // Add fraction of today if it's a working day
  const todayDay = today.getDay();
  if (todayDay !== 0 && todayDay !== 6) {
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Business hours: 08:00 to 18:00 (10 hours)
    const startMinutes = 8 * 60;
    const endMinutes = 18 * 60;
    const workDayMinutes = endMinutes - startMinutes;
    
    const elapsed = Math.max(0, Math.min(workDayMinutes, totalMinutes - startMinutes));
    const fraction = elapsed / workDayMinutes;
    
    // We add at least a small fraction to avoid huge spikes at exactly 08:00
    // and to ensure the first day has a denominator that grows.
    count += Math.max(fraction, 0.05); 
  }
  
  // Ensure we never return 0 to avoid division by zero
  return Math.max(count, 0.1);
};
