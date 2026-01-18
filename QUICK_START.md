# 🚀 Quick Start Guide - Event Conflict Detection

## What's New?

Your ClubHub registration system now has **intelligent event conflict detection** with:
- 🔴 **Direct Conflict Detection** - Events that overlap
- 🟠 **Near Conflict Detection** - Events within 30 minutes of each other
- 📊 **Timeline Visualization** - See graphical event overlaps
- 🔄 **Swap Functionality** - Switch to alternative events
- ⚠️ **Register Anyway** - Override conflicts if needed

---

## Quick Test (2 minutes)

### Step 1: Login
1. Go to **Student Login** tab
2. Enter any name: `Test User`
3. Enter any ID: `STU001`
4. Click **Login**

### Step 2: Register for First Event
1. Go to **Event Registration** tab
2. Click **Register** on "AI Workshop"
3. Fill in the form with any details
4. Click **Complete Registration**

### Step 3: Trigger Conflict
1. Click **Register** on "Music Jam Session"
2. 🎯 **Conflict Modal appears!**
3. You'll see:
   - **Red "Direct Conflict" badge**
   - Timeline showing both events overlapping (120 minutes)
   - Suggested alternatives

### Step 4: Take Action
Choose one:
- **Cancel**: Keep existing registration only
- **Register Anyway**: Have both events (both marked as conflicted)
- **Swap to This Event**: Remove AI Workshop, add alternative instead

---

## Understanding the Conflict Types

### 🔴 Direct Conflict
```
Event A: 14:00 ────────────── 17:00
Event B:           15:00 ──────────── 17:00
                   └─ OVERLAP 120 min ─┘
```
- **Visual**: Red badge with ⚠️ marker
- **Timeline**: Red and purple bars overlapping

### 🟠 Near Conflict  
```
Event A: 14:00 ── 15:00
Event B:               15:20 ── 16:20
              └─ 20 min gap ─┘
              (within 30-min buffer)
```
- **Visual**: Orange badge with ⚡ marker
- **Timeline**: Bars close but not overlapping

---

## Key Features

### Timeline Visualization
```
Existing Event ████████████████ (red)
New Event      ███████████ (purple)
```
Shows proportional timing and overlap duration

### Suggested Alternatives
- Up to 3 non-conflicting alternatives shown
- Same club as requested event
- One-click swap to switch events

### Smart Data Management
- All registrations saved automatically
- Works across browser sessions
- Your login persists
- Easy to clear data if needed

---

## Testing the 3 Scenarios

### Scenario 1: Direct Conflict ✅
- **Existing**: AI Workshop (14:00-17:00)
- **New**: Music Jam Session (15:00-17:00)
- **Result**: Red badge, 120-min overlap

### Scenario 2: Near Conflict ✅
- **Existing**: AI Workshop (14:00-17:00)  
- **New**: Tech Seminar (15:00-17:00)
- **Result**: Orange badge, buffer time warning

### Scenario 3: Swap/Register ✅
- **Action**: Click "Swap to Alternative"
- **Result**: Old event removed, new event added
- **Or**: Click "Register Anyway" for both events

---

## Color Guide

| Color | Meaning | Style |
|-------|---------|-------|
| 🔴 Red | Direct conflict | Urgent |
| 🟠 Orange | Near conflict | Warning |
| 🟣 Purple | Timeline (new) | Action |
| 🔵 Blue | Timeline (existing) | Reference |
| 🟢 Green | Success | Confirmation |

---

## Checking Your Registrations

### View My Hub
1. Login first (required)
2. Click **My Hub** in navigation
3. See all your:
   - Joined clubs
   - Registered events
   - Conflict status

### Clear Everything
Run in browser console (F12):
```javascript
Object.keys(localStorage).forEach(key => {
    if (key.includes('student') || key.includes('clubs') || key.includes('events')) {
        localStorage.removeItem(key);
    }
});
localStorage.removeItem('studentUser');
```

---

## Calendar Integration

When viewing events:
- **Red border + ⚠️**: Direct conflict with existing event
- **Orange border + ⚡**: Near conflict within buffer time
- Hover to see full event details

---

## FAQ

**Q: What happens if I register anyway?**
A: Both events are registered. Calendar shows both with conflict warnings.

**Q: Can I swap events?**
A: Yes! Click "Swap to This Event" in alternatives. Old event is removed.

**Q: Will my data be saved?**
A: Yes! Everything saved in localStorage. Persists across browser closes.

**Q: What's the 30-minute buffer?**
A: Time needed between events for travel/transition. Adjustable in code.

**Q: Can I have multiple conflicts?**
A: Yes! You can register for many conflicting events if you want.

---

## Support

### If Something's Wrong

1. **Clear your data** (see console command above)
2. **Reload the page** (Ctrl+F5 or Cmd+Shift+R)
3. **Check browser console** for error messages (F12)
4. **Try again** from login

### Debugging Commands

**Check registered events:**
```javascript
const s = JSON.parse(localStorage.getItem('studentUser'));
console.log(JSON.parse(localStorage.getItem(`events_${s.id}`)));
```

**Check conflict detection:**
```javascript
const event = window.events[0]; // AI Workshop
console.log('Conflict type:', getConflictType(event, window.events[5]));
```

**Clear single student:**
```javascript
const s = JSON.parse(localStorage.getItem('studentUser'));
localStorage.removeItem(`events_${s.id}`);
localStorage.removeItem(`clubs_${s.id}`);
```

---

## What's Behind the Scenes?

### Conflict Detection Algorithm
```javascript
// Checks if time windows overlap
function eventsOverlap(e1, e2) {
    return start1 < end2 && start2 < end1;
}

// Identifies conflict type
function getConflictType(e1, e2) {
    // direct, near, or none
}

// Calculates exact overlap in minutes
function calculateOverlapMinutes(e1, e2) {
    // returns number of minutes
}
```

### Timeline Calculation
```javascript
// Position events on timeline proportionally
const position = ((eventTime - minTime) / totalDuration) * 100;
// Result: percentage position (0-100%)
```

---

## Next Steps

1. ✅ **Test the three scenarios** (see above)
2. ✅ **Try swapping events**
3. ✅ **Register anyway** to see conflict markers
4. ✅ **Check My Hub** for registrations
5. ✅ **Close browser** and reopen to verify persistence

---

## Colors Used (Website Aligned)

```css
Primary:   #6c5ce7  (Purple)   - Buttons, new events
Accent:    #fd79a8  (Pink)     - Primary actions
Success:   #00b894  (Green)    - Confirmations
Warning:   #fdcb6e  (Orange)   - Near conflicts
Danger:    #d63031  (Red)      - Direct conflicts
Dark:      #2d3436  (Dark)     - Background
Light:     #f5f6fa  (Light)    - Text backgrounds
```

---

## Ready to Test? 🎯

1. Open [http://localhost:8000/registration.html](http://localhost:8000/registration.html)
2. Go to **Student Login** tab
3. Enter any name and ID
4. Navigate to **Event Registration**
5. Register for "AI Workshop" first
6. Then try "Music Jam Session"
7. 💥 **See the conflict modal appear!**

---

**Happy Testing! 🎉**

For detailed testing procedures, see `TESTING_GUIDE.md`
For complete implementation details, see `IMPLEMENTATION_SUMMARY.md`
