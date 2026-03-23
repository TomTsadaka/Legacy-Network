# 🎯 Finish Blob Setup - 2 דקות!

## מה נעשה עד עכשיו:
✅ Blob Store נוצר: `legacy-media` (store_LIvpz61wZ238kh5n)  
✅ כל הקוד מוכן  
✅ Database עודכן  
⏳ **צריך רק להוסיף BLOB_READ_WRITE_TOKEN**

## פעולה אחרונה - בחר אחת:

### אופציה 1: דרך Vercel CLI (מהירה!)
```powershell
# צריך לרוץ בטרמינל
vercel env add BLOB_READ_WRITE_TOKEN

# הוא יבקש:
# 1. מה הערך? → לחץ על "הצג" ליד ה-blob store ב-dashboard והעתק
# 2. איזה environments? → בחר הכל (Production, Preview, Development)
```

### אופציה 2: דרך Vercel Dashboard (בטוחה!)
1. לך ל: https://vercel.com/tomtsadaka-1543/legacy-network/settings/environment-variables
2. לחץ **Add New**
3. מלא:
   - **Key:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** (טוקן מה-blob store - ראה למטה)
   - **Environments:** ✓ Production ✓ Preview ✓ Development
4. **Save**

## איך להשיג את הטוקן?
1. לך ל: https://vercel.com/tomtsadaka-1543/legacy-network/stores
2. לחץ על `legacy-media`
3. תראה `.env.local` snippet - העתק את הערך של `BLOB_READ_WRITE_TOKEN`

---

## ✅ סיימת? בדוק שזה עובד:

1. לך ל: https://legacy-network-mu.vercel.app
2. התחבר (tom/tom123)
3. פתח זיכרון → **ערוך**
4. לחץ **"העלה תמונות/סרטונים"**
5. בחר תמונה → **שמור**
6. אם התמונה מופיעה = 🎉 הצלחנו!

אם לא עובד - הודע לי ואתקן!
