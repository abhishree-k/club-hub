# Quick Start Guide - Event Conflict Testing

## 🚀 Start Here (5 Minutes)

### Step 1: Open Registration Page
```
http://localhost:8000/registration.html
```

### Step 2: Login (Any Credentials)
- **Name**: John Doe (or anything)
- **Student ID**: S001 (or anything)
- Click **Login**

### Step 3: Test Direct Conflict
1. Click **"Event Registration"** tab
2. Click **Register** on "AI Workshop Series"
3. Select dropdown and choose event
4. Fill in form (first name, last name, email)
5. Click **"Complete Registration"**
6. See success message ✅

### Step 4: Trigger Conflict Modal
1. Scroll down and click **Register** on "Tech Seminar"
2. Complete the form
3. **CONFLICT MODAL APPEARS** 🎉
   - Shows: "DIRECT CONFLICT" (red badge)
   - Timeline visualization
   - "Approximate overlap: 120 minutes"
   - Action buttons

### Step 5: Test Options
- **Cancel**: Click to dismiss
- **Register Anyway**: Register for both (see both in My Hub)
- **Swap to Alternative**: Remove old, add new

---

## 📅 Test Calendar Navigation

### Step 1: Open Events Page
```
http://localhost:8000/events.html
```

### Step 2: Locate Date Picker
- Below month navigation arrows
- Contains dropdowns for Month & Year
- Plus "Jump" and "Today" buttons

### Step 3: Navigate to Events
1. Select **"January"** from month dropdown
2. Select **"2026"** from year dropdown
3. Click **"Jump"** button
4. Calendar shows **January 2026**
5. See events on the 20th, 22nd, etc.

### Step 4: View Conflict Indicators
- **January 20th** has 3 events:
  - AI Workshop Series (14:00-17:00)
  - Tech Seminar (15:00-17:00) → 🔴 Red conflict marker
  - Music Jam Session (15:00-17:00) → 🔴 Red conflict marker
- Click any event to see details

### Step 5: Quick Return
- Click **"Today"** button
- Calendar jumps back to current month
- Dropdowns update automatically

---

## 🎯 Key Features to Test

| Feature | How to Test | Expected Result |
|---------|------------|-----------------|
| **Direct Conflict** | Register for overlapping events | Red badge, 120 min overlap |
| **Timeline Visual** | Look at conflict modal | Overlapping bars shown |
| **Swap Flow** | Click swap button | Old event gone, new added |
| **Register Anyway** | Click red button | Both events registered |
| **Date Picker** | Jump to January 2026 | See all conflicting events |
| **Today Button** | Click today button | Back to current month |
| **Data Persist** | Reload page, login again | All registrations still there |

---

## 📱 Check My Hub

### To See Registrations:
1. Click **"My Hub"** in navigation (after login)
2. View **"Joined Clubs"** section
3. View **"Registered Events"** section
4. After conflict test, see multiple events listed
5. Check for conflict indicators (⚠️ or ⚡)

---

## 🎓 Understanding the Conflict Types

### Direct Conflict (🔴 Red)
- Events completely overlap in time
- Example: 14:00-17:00 vs 15:00-17:00
- Overlap: 120 minutes
- Marker: ⚠️

### Near Conflict (🟠 Orange)
- Events within 30-minute buffer
- Example: 16:00-18:00 vs 17:00-19:00
- Overlap: 60 minutes
- Marker: ⚡

### No Conflict (✅ Green)
- Events don't overlap
- Can register for both without issue

---

## 💾 Data Locations

### Where Data is Stored:
**Browser DevTools → Application → LocalStorage**

### Key Data:
- `studentUser` → Current logged-in user
- `events_[ID]` → Registered events
- `clubs_[ID]` → Club memberships
- `student_[ID]` → Full student profile

### To Clear Data (in Console):
```javascript
Object.keys(localStorage).forEach(key => {
    if (key.includes('student') || key.includes('events')) {
        localStorage.removeItem(key);
    }
});
console.log('Cleared!');
```

---

## ✅ Complete Test Checklist

- [ ] Can login with any credentials
- [ ] Can register for first event
- [ ] Conflict modal appears for second event
- [ ] Modal shows correct badge color
- [ ] Timeline visualization displays
- [ ] Overlap minutes calculated correctly
- [ ] Can click "Register Anyway"
- [ ] Both events appear in My Hub
- [ ] Can navigate calendar with date picker
- [ ] Events visible on correct dates
- [ ] Can click "Today" to return
- [ ] Calendar shows conflict markers (⚠️)
- [ ] Data persists after page reload
- [ ] No JavaScript errors in console

---

## 🔗 Navigation Quick Links

| Page | URL |
|------|-----|
| Home | `http://localhost:8000/index.html` |
| Registration | `http://localhost:8000/registration.html` |
| Events | `http://localhost:8000/events.html` |
| My Hub | `http://localhost:8000/my-hub.html` |

---

## 🎉 Expected Results Summary

✅ **Direct Conflicts**: Clearly visible with red badge and timeline
✅ **Calendar Navigation**: Jump to any month/year instantly
✅ **Swap Functionality**: Switch between events seamlessly
✅ **Data Persistence**: All registrations saved automatically
✅ **User Experience**: Smooth, responsive, themed interface

---

## 🚨 If Something Doesn't Work

### Browser Not Showing Events:
- Check that server is running on port 8000
- Open http://localhost:8000 in address bar
- Should see ClubHub homepage

### Conflicts Not Appearing:
- Make sure you registered for AI Workshop first
- Then try to register for Tech Seminar
- Both must be on same date (Jan 20, 2026)

### Date Picker Not Visible:
- Make sure you're on events.html (not registration.html)
- Check browser console for JavaScript errors
- Refresh the page

### Data Not Saving:
- Check browser allows localStorage (not in private mode)
- Check DevTools → Application → LocalStorage
- Try clearing browser cache

---

## 📞 Support Contacts

All documentation files are in the ClubHub folder:
- `TESTING_GUIDE.md` - Detailed testing procedures
- `UPDATED_FEATURES.md` - New features list
- `IMPLEMENTATION_REPORT.md` - Technical details

---

## 🎬 Ready to Test?

**You have everything you need!**

1. Server is running ✅
2. Events are in current dates ✅
3. Conflict detection is working ✅
4. Calendar picker is ready ✅
5. All styling is theme-aligned ✅

**Start with Step 1 above and follow the steps!**

**Happy Testing! 🚀**
