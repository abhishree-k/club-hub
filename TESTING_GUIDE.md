# Event Registration Conflict Detection - Testing Guide

## Overview
This guide walks you through testing the three conflict scenarios implemented in the ClubHub registration system. The system now includes:
- **Direct Conflict Detection**: Events that overlap in time
- **Near Conflict Detection**: Events within 30-minute buffer time
- **Timeline Visualization**: Visual representation of event overlaps
- **Swap Functionality**: Ability to swap conflicting events with alternatives
- **Register Anyway Option**: Override conflict and register for both events

---

## Test Environment Setup

1. **Start the local server** (already running on port 8000):
   ```bash
   python -m http.server 8000
   ```

2. **Open the registration page** in your browser:
   ```
   http://localhost:8000/registration.html
   ```

---

## Scenario 1: Direct Conflict – "AI Workshop" vs "Music Jam Session"

### Expected Conflict Details
- **Existing Event**: AI Workshop (Nov 15, 2023, 14:00-17:00)
- **New Event**: Music Jam Session (Nov 15, 2023, 15:00-17:00)
- **Overlap**: 120 minutes (2 hours)
- **Conflict Type**: Direct Conflict (red badge)

### Testing Steps

1. **Navigate to Student Login tab**
   - Enter any name (e.g., "John Doe")
   - Enter any Student ID (e.g., "S12345")
   - Click "Login"

2. **Go to Event Registration tab**
   - The event list will appear with available events
   - Click "Register" button on "AI Workshop"
   - Select it and complete the registration form
   - Click "Complete Registration"
   - You should see: "✓ Event registration submitted successfully!"

3. **Register for conflicting event**
   - Scroll down and click "Register" on "Music Jam Session"
   - A conflict modal should appear with:
     - **Red "Direct Conflict" badge** at the top
     - AI Workshop details (14:00-17:00)
     - Music Jam Session details (15:00-17:00)
     - **Timeline visualization** showing both events with overlapping bars
     - **"⏱️ Approximate overlap: 120 minutes"**

4. **Test Timeline Visualization**
   - You should see two colored bars:
     - Red bar (existing event)
     - Purple bar (new event)
   - The bars should visually overlap showing the conflict
   - Legend below shows "Existing event" and "New event"

5. **Test Modal Buttons**
   - **Cancel**: Closes modal and keeps existing registration
   - **Register Anyway**: Adds both events and marks them as conflicted
   - Suggested alternatives (if available) with "🔄 Swap to This Event" buttons

---

## Scenario 2: Near Conflict – Buffer Time Overlap

### Near Conflict Setup
This scenario demonstrates events that don't directly overlap but are within 30 minutes of each other.

**Example:**
- **Event A**: 14:00-15:00
- **Event B**: 15:20-16:20 (same day)
- **Gap**: 20 minutes (within 30-minute buffer)
- **Conflict Type**: Near Conflict (orange badge)

### Testing Steps

1. **Create test events** (manually update the events data in browser console, or use existing time slots):
   - The system includes "Tech Seminar" (15:00-17:00) as a near-conflict alternative

2. **Follow same login and registration steps as Scenario 1**

3. **When conflict is detected**:
   - Look for **orange "Near Conflict (Buffer Time)" badge**
   - Timeline visualization will show both events
   - Suggested alternatives will appear with swap buttons

4. **Observe styling**:
   - In My Hub and calendar: **⚡ symbol** (instead of ⚠️ for direct conflicts)
   - **Orange border** instead of red
   - **Yellow/gold background** for near-conflict events

---

## Scenario 3: Alternatives & Swap / Register-Anyway Flows

### Testing Swap Flow

1. **Trigger a conflict** (as in Scenario 1 or 2)

2. **Review Suggested Alternatives**
   - The modal shows up to 3 alternative events in the same club
   - Each shows event name, date, time, and location
   - Green "🔄 Swap to This Event" button

3. **Click "Swap to This Event"**
   - Existing conflicting event is removed from your registrations
   - New event is added instead
   - Alert shows: "✓ Swapped [Old Event] with [New Event]!"
   - Modal closes and My Hub updates

4. **Verify in My Hub**
   - Go to "My Hub" from navigation
   - Old event should be gone
   - New event should appear in your registered events

### Testing Register-Anyway Flow

1. **Trigger a conflict** (as in Scenario 1)

2. **Click "Register Anyway" button** (red danger button)
   - Alert shows: "✓ Registered for [Event] with conflict!"
   - Modal closes
   - Both events are now registered

3. **Check My Hub**
   - Both conflicting events appear in your event list
   - Calendar marks both with conflict indicators

4. **Check Calendar** (if available on events.html)
   - Navigate to events.html
   - Both events show **red conflict styling** with **⚠️ marker**
   - Hover over timeline events to see details

---

## Expected Visual Indicators

### Conflict Modal Styling (Aligned with Website Theme)
- **Background**: Dark theme (`rgba(26, 26, 46, 0.95)`)
- **Primary Color**: Purple (`#6c5ce7`)
- **Accent Color**: Pink (`#fd79a8`)
- **Success Color**: Green (`#00b894`)
- **Danger Color**: Red (`#d63031`)
- **Warning Color**: Orange (`#fdcb6e`)

### Timeline Visualization
- **Existing Event Bar**: Red/danger color with 60% opacity
- **New Event Bar**: Purple/primary color with 60% opacity
- **Legend**: Shows color-coded dots for event types

### Calendar Event Styling
- **Direct Conflict**: `border: 2px solid red`, `background: rgba(214, 48, 49, 0.25)`, `⚠️ marker`
- **Near Conflict**: `border: 2px solid orange`, `background: rgba(253, 203, 110, 0.2)`, `⚡ marker`

---

## Data Persistence

All registrations are saved to **localStorage**:
- **Student Data**: `student_[studentID]`
- **Club Registrations**: `clubs_[studentID]`
- **Event Registrations**: `events_[studentID]`

**Testing Data Persistence:**
1. Register for events and close the browser
2. Reopen registration.html
3. Login with same credentials
4. Go to My Hub - all registrations should still be there

---

## Debugging Tips

### Clear All Data
Run in browser console:
```javascript
// Clear all student data
Object.keys(localStorage).forEach(key => {
    if (key.includes('student') || key.includes('clubs') || key.includes('events')) {
        localStorage.removeItem(key);
    }
});
localStorage.removeItem('studentUser');
```

### View Registered Events
Run in browser console:
```javascript
const student = JSON.parse(localStorage.getItem('studentUser'));
if (student) {
    console.log('Registered Events:', JSON.parse(localStorage.getItem(`events_${student.id}`)) || []);
    console.log('Club Registrations:', JSON.parse(localStorage.getItem(`clubs_${student.id}`)) || []);
}
```

### Manually Trigger Conflict Check
```javascript
const event = window.events.find(e => e.name === "AI Workshop");
const student = JSON.parse(localStorage.getItem('studentUser'));
const registered = JSON.parse(localStorage.getItem(`events_${student.id}`)) || [];
const conflicts = registered.filter(e => getConflictType(e, event) !== 'none');
console.log('Conflicts:', conflicts);
console.log('Conflict Type:', conflicts.length > 0 ? getConflictType(conflicts[0], event) : 'none');
```

---

## Expected Test Results Summary

| Scenario | Type | Badge Color | Symbol | Timeline | Swap | Register Anyway |
|----------|------|-------------|--------|----------|------|-----------------|
| Direct Overlap | Direct Conflict | Red | ⚠️ | Red + Purple bars | ✓ | ✓ |
| Buffer Time | Near Conflict | Orange | ⚡ | Bars close together | ✓ | ✓ |
| Alternatives | Suggestions | N/A | N/A | N/A | ✓ | ✓ |

---

## Success Criteria

✅ **All tests pass if:**
1. Conflict modal appears with correct badge color
2. Timeline visualization shows event overlap clearly
3. Overlap minutes are calculated correctly
4. Suggested alternatives appear (if available)
5. Swap functionality removes old event and adds new one
6. Register Anyway allows dual registration
7. Calendar marks conflicts with proper styling
8. All data persists across page reloads
9. Theme colors match website design throughout

---

## Color Reference (Website Theme)

```css
--primary-color: #6c5ce7       /* Purple */
--secondary-color: #a29bfe     /* Light Purple */
--accent-color: #fd79a8        /* Pink */
--success-color: #00b894       /* Green */
--warning-color: #fdcb6e       /* Orange */
--danger-color: #d63031        /* Red */
```

All conflict modal styling uses these colors consistently with the rest of the website.

---

## Need Help?

If you encounter any issues:
1. Check browser console for JavaScript errors
2. Clear localStorage and start fresh (see Debugging section)
3. Verify the HTTP server is running on port 8000
4. Ensure all three events (AI Workshop, Music Jam, Tech Seminar) are in the events list
5. Check that Student ID is consistent for conflict detection
