# 🌐 Legacy Network → Social Network Transformation

## החזון החדש
**מיומן משפחתי פרטי → רשת חברתית להורים**

- הורים יכולים לשתף זכרונות עם חברים
- חברים יכולים לעשות Like, Comment, Tag
- Feed משולב: המשפחה שלי + חברים
- פרטיות חזקה - default PRIVATE, opt-in לשיתוף

---

## ✅ מה כבר עשינו (היום)

### Schema Updates
- [x] הוספת `Friendship` model (בקשות חברות, סטטוס)
- [x] הוספת `Notification` model (התראות)
- [x] הוספת `EntryTag` model (תגיות של משפחות אחרות)
- [x] הוספת `FRIENDS` ל-Visibility enum
- [x] הוספת `bio`, `location`, `isPublic` ל-User
- [x] Migration סונכרן לדאטאבייס ✅
- [x] Seed רץ בהצלחה ✅

---

## ✅ Phase 1: Friendship System (הושלם!)

### Backend ✅
- [x] **API Routes:**
  - [x] `POST /api/friends/request` - שלח בקשת חברות
  - [x] `POST /api/friends/[id]/accept` - אשר בקשה
  - [x] `POST /api/friends/[id]/reject` - דחה בקשה
  - [x] `DELETE /api/friends/[id]` - הסר חבר
  - [x] `GET /api/friends` - רשימת חברים + בקשות ממתינות
  - [x] `GET /api/users/search?q=name` - חיפוש משתמשים

### Frontend ✅
- [x] **דף חיפוש משתמשים** (`/friends/search`)
  - [x] Input חיפוש
  - [x] תוצאות עם כפתור "הוסף חבר"
  - [x] סטטוס חברות (חבר / ממתין / לא חבר)

- [x] **דף חברים** (`/friends`)
  - [x] רשימת חברים פעילים
  - [x] בקשות ממתינות (badge עם מספר)
  - [x] כפתורי אישור/דחייה
  - [x] בקשות שנשלחו (sent requests)
  - [x] Tabs: חברים / בקשות / נשלחו

- [x] **כפתור "חברים" בטיימליין**

### Notifications ✅
- [x] יצירת התראה כש:
  - [x] מישהו שולח בקשת חברות
  - [x] מישהו מאשר את הבקשה שלך

---

## ✅ Phase 2: Enhanced Feed (הושלם!)

### Backend ✅
- [x] **API Routes:**
  - [x] `GET /api/feed` - Feed משולב (משפחה + חברים)
  - [x] Smart filtering by type: all/friends/family/public

### Feed Logic ✅
- [x] Visibility filtering:
  - [x] `PRIVATE` → רק המשפחה שלי
  - [x] `FAMILY_ONLY` → רק המשפחה שלי
  - [x] `FRIENDS` → משפחה + חברים
  - [x] `PUBLIC` → כולם

### Frontend ✅
- [x] **דף Feed חדש** (`/feed`)
  - [x] Tabs: "הכל" / "חברים" / "המשפחה שלי" / "ציבורי"
  - [x] אינדיקטור visibility על כל כרטיס (🔒/👥/🌍)

- [x] **בחירת Visibility ביצירת זיכרון**
  - [x] State מוכן (UI dropdown יתווסף בהמשך)

---

## 📋 Phase 3: Tagging & Mentions

### Backend
- [ ] **API Routes:**
  - [ ] `POST /api/entries/[id]/tag` - תייג משפחה
  - [ ] `DELETE /api/entries/[id]/tag/[familyId]` - הסר תג
  - [ ] `GET /api/families/search?q=name` - חיפוש משפחות

### Frontend
- [ ] **Mention autocomplete** בעריכת זיכרון
  - [ ] הקלד `@` → תפריט משפחות
  - [ ] בחר משפחה → נוסף tag

- [ ] **תצוגת Tags על כרטיס**
  - [ ] "תויגו: @משפחת_כהן, @משפחת_לוי"

### Notifications
- [ ] התראה כשמתייגים אותך

**משך משוער:** 1 יום עבודה

---

## ✅ Phase 4: Likes & Comments (כמעט מוכן!)

### Backend ✅
- [x] Like model
- [x] Comment model
- [x] **API Routes:**
  - [x] `POST /api/entries/[id]/like` - Toggle like
  - [x] `GET /api/entries/[id]/comments` - Get comments
  - [x] `POST /api/entries/[id]/comments` - Add comment
  - [x] `DELETE /api/comments/[id]` - Delete comment

### Frontend (נשאר לבנות)
- [ ] **כפתור Like** על כרטיס זיכרון
  - [ ] מונה לייקים
  - [ ] אנימציה ♥️

- [ ] **תיבת תגובות**
  - [ ] רשימת תגובות
  - [ ] Input להוספת תגובה
  - [ ] מחיקת תגובה (רק שלי)

### Notifications ✅
- [x] התראה על like
- [x] התראה על comment

---

## 📋 Phase 5: User & Family Profiles

### Backend
- [ ] **API Routes:**
  - [ ] `GET /api/users/[username]` - פרופיל משתמש
  - [ ] `PUT /api/users/me` - עדכון פרופיל
  - [ ] `GET /api/families/[id]/public` - פרופיל משפחה ציבורי

### Frontend
- [ ] **דף פרופיל משתמש** (`/profile/[username]`)
  - [ ] תמונה, שם, bio, מיקום
  - [ ] מספר חברים
  - [ ] Grid של זכרונות ציבוריים

- [ ] **דף הגדרות פרטיות** (`/settings/privacy`)
  - [ ] פרופיל ציבורי/פרטי
  - [ ] מי יכול לתייג אותי
  - [ ] מי יכול לראות את החברים שלי

- [ ] **דף פרופיל משפחה** (`/family/[id]`)
  - [ ] תמונת משפחה
  - [ ] ילדים (אם ציבורי)
  - [ ] זכרונות ציבוריים

**משך משוער:** 2-3 ימי עבודה

---

## 📋 Phase 6: Discovery & Search

### Backend
- [ ] **Suggested friends algorithm:**
  - [ ] חברים משותפים
  - [ ] משפחות דומות (מיקום, גיל ילדים)

- [ ] **Popular entries:**
  - [ ] מיון לפי לייקים + תגובות
  - [ ] Trending this week

### Frontend
- [ ] **דף Discover** (`/discover`)
  - [ ] זכרונות פופולריים
  - [ ] משתמשים מומלצים

- [ ] **חיפוש כללי**
  - [ ] משתמשים
  - [ ] משפחות
  - [ ] זכרונות (ציבוריים)

**משך משוער:** 2 ימי עבודה

---

## 📋 Phase 7: Safety & Moderation

### Backend
- [ ] **Block users**
  - [ ] טבלת `BlockedUsers`
  - [ ] API routes

- [ ] **Report system**
  - [ ] טבלת `Reports`
  - [ ] Admin panel

### Frontend
- [ ] **כפתור Block**
- [ ] **כפתור Report**
- [ ] **Child safety settings:**
  - [ ] רק הורים יכולים לתייג את הילדים שלהם
  - [ ] Opt-in לפרופיל ילד ציבורי
  - [ ] אופציה לטשטש פנים

**משך משוער:** 2-3 ימי עבודה

---

## 🎯 Total Estimated Time
**~10-15 ימי עבודה** (2-3 שבועות)

---

## 🚀 Next Steps (עכשיו!)

1. ✅ Schema updates - **DONE!**
2. 📝 בניית API routes ל-Friendship
3. 🎨 UI לחיפוש משתמשים
4. 👥 דף חברים + בקשות

**רוצה להתחיל עם Phase 1?** 🚀
