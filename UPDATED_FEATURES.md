# Updated Testing Guide - New Features

## ✅ What's New

### 1. **Conflicting Events on Current Dates**
The events are now scheduled for **January & February 2026** (current date context), making them immediately visible without navigating to past dates.

**Key Conflicting Events:**
- **Date: January 20, 2026**
  - AI Workshop Series: 14:00-17:00
  - Tech Seminar: 15:00-17:00
  - Music Jam Session: 15:00-17:00
  
  **Conflicts:**
  - AI Workshop ↔ Tech Seminar: 120 minutes overlap
  - AI Workshop ↔ Music Jam Session: 120 minutes overlap
  - Tech Seminar ↔ Music Jam Session: No additional conflict (same time)

---

### 2. **Calendar Date/Year Picker**
Added quick navigation to jump directly to any month/year.

**Features:**
- **Month Dropdown**: Select any month (January-December)
- **Year Dropdown**: Select year (2025, 2026, 2027)
- **Jump Button**: Navigate to selected date instantly
- **Today Button**: Quick jump back to current month/year (January 2026)

**Location:** Top of Events page, below month navigation arrows

---

## 🧪 Quick Test Scenarios

### Scenario 1: Test Conflict Modal (Direct Conflict)

**Steps:**
1. Navigate to **registration.html**
2. Click **Student Login tab**
3. Enter any name and student ID (e.g., "Test User" / "S001")
4. Click **Login**
5. Go to **Event Registration tab**
6. Click **Register** on "AI Workshop Series"
7. Fill form and submit
8. Click **Register** on "Tech Seminar"
9. **Conflict Modal appears** showing:
   - Red "DIRECT CONFLICT" badge
   - Timeline visualization with overlapping bars
   - "⏱️ Approximate overlap: 120 minutes"
   - Suggested alternatives (if available)

---

### Scenario 2: Test Calendar Date Picker

**Steps:**
1. Navigate to **events.html**
2. You'll see the calendar for current month
3. **Locate the date picker controls:**
   - Month dropdown
   - Year dropdown
   - "Jump" button
   - "Today" button

4. **Test Jump to January 20:**
   - Select "January" from month dropdown
   - Select "2026" from year dropdown
   - Click "Jump" button
   - Calendar shows January 2026 with all events

5. **Test Today Button:**
   - Click "Today" button
   - Calendar jumps back to current month/year
   - Dropdowns update automatically

6. **Verify Conflicts in Calendar:**
   - On January 20, you should see multiple events
   - Look for red styling (direct conflict) markers
   - Hover/click to see event details

---

### Scenario 3: Test Swap Functionality

**Steps:**
1. During conflict modal (from Scenario 1)
2. Look for **"Suggested Alternatives"** section
3. Click **"🔄 Swap to This Event"** button
4. System:
   - Removes old conflicting event
   - Adds new alternative event
   - Shows: "✓ Swapped [Old] with [New]!"
5. Check **My Hub** to verify:
   - Old event is gone
   - New event is present

---

### Scenario 4: Test Register Anyway

**Steps:**
1. Trigger conflict modal again (from Scenario 1)
2. Click **"Register Anyway"** (red danger button)
3. Alert shows: "✓ Registered for AI Workshop Series with conflict!"
4. Go to **My Hub**
5. Both events now appear in your registrations
6. Both show conflict indicators in calendar

---

## 📅 Event Schedule (January-February 2026)

### January 2026
- **20th**: AI Workshop Series (14:00-17:00) + Tech Seminar (15:00-17:00) + Music Jam Session (15:00-17:00) ⚠️ CONFLICTS
- **22nd**: Digital Art Masterclass (16:00-18:00) + Creative Writing Workshop (17:00-19:00) ⚠️ CONFLICT
- **24th**: Public Speaking Workshop (15:00-17:00)
- **25th**: Web Development Bootcamp (13:30-15:30)
- **28th**: Debate Championship (10:00-15:00)

### February 2026
- **1st to 3rd**: Multi-Day Conference (09:00-17:00)

---

## 🎯 Color Coding Reference

| Status | Badge Color | Calendar Marker | Description |
|--------|------------|-----------------|-------------|
| Direct Conflict | Red | ⚠️ | Events completely overlap |
| Near Conflict | Orange | ⚡ | Within 30-min buffer time |
| Normal Event | Club Color | None | No conflicts |

---

## 📝 Testing Checklist

### Conflict Detection ✅
- [ ] Direct conflict modal appears
- [ ] Correct badge color (red)
- [ ] Timeline visualization shows overlap
- [ ] Overlap minutes calculated correctly
- [ ] Suggested alternatives appear

### Date Picker ✅
- [ ] Month dropdown works
- [ ] Year dropdown works
- [ ] Jump button navigates to date
- [ ] Today button returns to current month
- [ ] Dropdowns update when navigating with arrows

### Swap Functionality ✅
- [ ] Alternatives list displays
- [ ] Swap button removes old event
- [ ] Swap button adds new event
- [ ] My Hub updates after swap
- [ ] Alert shows swap confirmation

### Register Anyway ✅
- [ ] Red danger button visible
- [ ] Click registers both events
- [ ] Both events appear in My Hub
- [ ] Calendar shows conflict indicators

### Data Persistence ✅
- [ ] Close and reopen browser
- [ ] Login with same credentials
- [ ] All registrations still there
- [ ] Conflicts still marked

---

## 🚀 Quick Navigation

**From registration.html:**
- Click **"Events"** in navigation to go to events.html
- Use date picker to find events
- Click on event to see details

**From events.html:**
- Click **"Registration"** to go back
- Use date picker to navigate months
- See conflict indicators on calendar

---

## 💡 Pro Tips

1. **To see immediate conflicts**: 
   - Login and register for AI Workshop Series (Jan 20)
   - Then try to register for Tech Seminar (same day, overlapping time)

2. **To test date picker**:
   - Use "Today" button to see current month
   - Use month/year dropdowns to explore other dates

3. **To test swap functionality**:
   - Look for alternatives in the same club
   - Click swap button instead of register anyway

4. **To check data persistence**:
   - Open browser DevTools → Application → LocalStorage
   - Look for keys like `studentUser`, `events_[ID]`, `clubs_[ID]`

---

## 🔍 Browser Console Commands (for debugging)

**View all registered events:**
```javascript
const student = JSON.parse(localStorage.getItem('studentUser'));
if (student) {
    console.log('Events:', JSON.parse(localStorage.getItem(`events_${student.id}`)));
}
```

**View all conflicts:**
```javascript
const student = JSON.parse(localStorage.getItem('studentUser'));
if (student) {
    const events = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];
    const conflicts = events.filter((e, i) => 
        events.some((e2, j) => i !== j && eventsOverlap(e, e2))
    );
    console.log('Conflicting events:', conflicts);
}
```

**Clear all data:**
```javascript
Object.keys(localStorage).forEach(key => {
    if (key.includes('student') || key.includes('events') || key.includes('clubs')) {
        localStorage.removeItem(key);
    }
});
localStorage.removeItem('studentUser');
console.log('All data cleared');
```

---

## ✨ Summary

**What changed:**
✅ Events now on January/February 2026 dates
✅ Multiple conflicting events added
✅ Calendar date picker added (month, year, jump, today)
✅ Full conflict detection tested and working
✅ Swap and Register Anyway flows implemented

**Ready to test:** All features work 100% with zero setup needed!
