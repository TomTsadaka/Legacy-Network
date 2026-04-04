"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import EntryCard from "@/components/EntryCard";
import { Globe, Users, Home, Loader2 } from "lucide-react";

type FeedType = "all" | "friends" | "family" | "public";

export default function FeedPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [feedType, setFeedType] = useState<FeedType>("all");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      loadFeed();
    }
  }, [status, feedType]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/feed?type=${feedType}&limit=50`);
      const data = await res.json();

      setEntries(data.entries || []);
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "all", label: "הכל", icon: Globe, color: "from-blue-500 to-purple-500" },
    { id: "friends", label: "חברים", icon: Users, color: "from-purple-500 to-pink-500" },
    { id: "family", label: "המשפחה שלי", icon: Home, color: "from-pink-500 to-orange-500" },
    { id: "public", label: "ציבורי", icon: Globe, color: "from-green-500 to-blue-500" },
  ];

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PRIVATE":
        return "🔒";
      case "FAMILY_ONLY":
        return "👨‍👩‍👧‍👦";
      case "FRIENDS":
        return "👥";
      case "PUBLIC":
        return "🌍";
      default:
        return "";
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case "PRIVATE":
        return "פרטי";
      case "FAMILY_ONLY":
        return "משפחה בלבד";
      case "FRIENDS":
        return "חברים";
      case "PUBLIC":
        return "ציבורי";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            📱 פיד הזיכרונות
          </h1>
          <p className="text-gray-600">גלה את הזיכרונות המשותפים</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setFeedType(tab.id as FeedType)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  feedType === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                    : "bg-white text-gray-600 hover:shadow-md"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm md:text-base">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-md">
              <Globe className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">אין זיכרונות להצגה</p>
              {feedType === "friends" && (
                <button
                  onClick={() => router.push("/friends/search")}
                  className="mt-4 text-blue-500 hover:underline"
                >
                  הוסף חברים כדי לראות את הזיכרונות שלהם
                </button>
              )}
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Entry Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                      {entry.author.image ? (
                        <img
                          src={entry.author.image}
                          alt={entry.author.name || "User"}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>
                          {(entry.author.name || entry.author.username || "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {entry.author.name || entry.author.username}
                      </h3>
                      <p className="text-sm text-gray-500">{entry.family.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 flex items-center gap-1"
                      title={getVisibilityLabel(entry.visibility)}
                    >
                      {getVisibilityIcon(entry.visibility)}
                      <span className="hidden md:inline">
                        {getVisibilityLabel(entry.visibility)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Entry Content */}
                <div onClick={() => router.push(`/entries/${entry.id}`)} className="cursor-pointer">
                  <EntryCard entry={entry} />
                </div>

                {/* Entry Footer - Engagement */}
                <div className="p-4 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-600">
                  <span>❤️ {entry._count.likes} לייקים</span>
                  <span>💬 {entry._count.comments} תגובות</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
