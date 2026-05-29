// Utility function to determine if a provider is currently open based on working hours

export function isCurrentlyOpen(provider: any): boolean {
  if (provider.status === 'open') return true;
  
  try {
    const today = new Date();
    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const todayArabic = dayNames[today.getDay()];
    
    if (provider.type === 'centers') {
      const hours = provider.center_hours;
      if (!hours) return true; // Default to open if no hours set
      if (hours.is24h) return true;
      
      if (hours.openTime && hours.closeTime) {
        const nowMin = today.getHours() * 60 + today.getMinutes();
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
        if (day === "طوال الأسبوع") return true;
        if (day.includes(todayArabic)) return true;
        
        if (day.includes(" - ")) {
          const [startDay, endDay] = day.split(" - ");
          const startIndex = dayNames.indexOf(startDay);
          const endIndex = dayNames.indexOf(endDay);
          const todayIndex = dayNames.indexOf(todayArabic);
          
          if (startIndex !== -1 && endIndex !== -1 && todayIndex !== -1) {
            if (startIndex <= endIndex) {
              return todayIndex >= startIndex && todayIndex <= endIndex;
            } else {
              return todayIndex >= startIndex || todayIndex <= endIndex;
            }
          }
        }
        return false;
      });
    }
  } catch (e) {
    console.error("Error checking hours:", e);
  }
  
  return false;
}
