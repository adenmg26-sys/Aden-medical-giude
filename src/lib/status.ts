// Utility function to determine if a provider is currently open based on working hours

function parseTime(timeStr: string): number | null {
  const s = timeStr.trim();
  
  // 1. Try AM/PM format (Arabic or English): "4:00 PM", "04:30 م", "8 ص"
  const ampmMatch = s.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|ص|م|صباح|مساء)/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const period = ampmMatch[3].toLowerCase();
    
    const isPM = period === 'pm' || period === 'م' || period.includes('مساء');
    const isAM = period === 'am' || period === 'ص' || period.includes('صباح');
    
    if (isPM && h !== 12) h += 12;
    if (isAM && h === 12) h = 0;
    
    return h * 60 + m;
  }
  
  // 2. Try plain 24-hour HH:MM format (from HTML time inputs): "16:00", "08:30"
  const hhmmMatch = s.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmmMatch) {
    const h = parseInt(hhmmMatch[1], 10);
    const m = parseInt(hhmmMatch[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return h * 60 + m;
    }
  }
  
  return null;
}

export function isCurrentlyOpen(provider: any): boolean {
  if (provider.status === 'open') return true;
  
  try {
    const today = new Date();
    const nowMin = today.getHours() * 60 + today.getMinutes();
    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const todayArabic = dayNames[today.getDay()];
    
    if (provider.type === 'centers') {
      const hours = provider.center_hours;
      if (!hours) return true; // Default to open if no hours set
      if (hours.is24h) return true;
      
      if (hours.openTime && hours.closeTime) {
        const [openH, openM] = hours.openTime.split(':').map(Number);
        const [closeH, closeM] = hours.closeTime.split(':').map(Number);
        const openMin = openH * 60 + openM;
        const closeMin = closeH * 60 + closeM;
        
        if (closeMin > openMin) {
          return nowMin >= openMin && nowMin <= closeMin;
        } else {
          // Over midnight (e.g. 22:00 to 02:00)
          return nowMin >= openMin || nowMin <= closeMin;
        }
      }
      return true;
    } else if (provider.type === 'doctors') {
      const shifts = provider.shifts;
      if (!shifts || shifts.length === 0) return false;
      
      return shifts.some((shift: any) => {
        const day = shift.day;
        if (!day) return false;
        
        let isDayMatch = false;
        if (day === "طوال الأسبوع") isDayMatch = true;
        else if (day.includes(todayArabic)) isDayMatch = true;
        else if (day.includes(" - ")) {
          const [startDay, endDay] = day.split(" - ");
          const startIndex = dayNames.indexOf(startDay.trim());
          const endIndex = dayNames.indexOf(endDay.trim());
          const todayIndex = dayNames.indexOf(todayArabic);
          
          if (startIndex !== -1 && endIndex !== -1 && todayIndex !== -1) {
            if (startIndex <= endIndex) {
              isDayMatch = todayIndex >= startIndex && todayIndex <= endIndex;
            } else {
              isDayMatch = todayIndex >= startIndex || todayIndex <= endIndex;
            }
          }
        }
        
        if (!isDayMatch) return false;
        
        // If it matches the day, check the time if it's parseable
        if (shift.time && shift.time.includes('-')) {
          const [startStr, endStr] = shift.time.split('-');
          const openMin = parseTime(startStr);
          const closeMin = parseTime(endStr);
          
          if (openMin !== null && closeMin !== null) {
            if (closeMin > openMin) {
              return nowMin >= openMin && nowMin <= closeMin;
            } else {
              return nowMin >= openMin || nowMin <= closeMin;
            }
          }
        }
        
        // If time is not parseable or not provided, assume open for the matched day
        return true;
      });
    }
  } catch (e) {
    console.error("Error checking hours:", e);
  }
  
  return false;
}
