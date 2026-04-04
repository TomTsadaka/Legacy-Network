"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, UserPlus, Check, Clock, ArrowRight } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  friendshipStatus: string;
  friendshipId: string | null;
  isPending: boolean;
  isSentByMe: boolean;
}

export default function SearchFriendsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim().length < 2) {
      alert("חפש לפחות 2 תווים");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      setUsers(data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        // Update UI
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  friendshipStatus: "PENDING",
                  isPending: true,
                  isSentByMe: true,
                }
              : u
          )
        );
      } else {
        const data = await res.json();
        alert(data.error || "שגיאה בשליחת בקשה");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("שגיאה בשליחת בקשה");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🔍 חפש חברים</h1>
            <p className="text-gray-600">מצא והתחבר למשתמשים חדשים</p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חפש לפי שם או שם משתמש..."
                className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? "מחפש..." : "חפש"}
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">מחפש...</p>
            </div>
          )}

          {!loading && searched && users.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center shadow-md">
              <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">לא נמצאו משתמשים</p>
            </div>
          )}

          {!loading &&
            users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">
                          {(user.name || user.username || "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {user.name || user.username}
                      </h3>
                      {user.username && user.name && (
                        <p className="text-sm text-gray-400">@{user.username}</p>
                      )}
                      {user.bio && (
                        <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {user.friendshipStatus === "FRIENDS" && (
                      <button
                        disabled
                        className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        חברים
                      </button>
                    )}

                    {user.friendshipStatus === "PENDING" && user.isSentByMe && (
                      <button
                        disabled
                        className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                      >
                        <Clock className="w-5 h-5" />
                        ממתין
                      </button>
                    )}

                    {user.friendshipStatus === "PENDING" && !user.isSentByMe && (
                      <button
                        onClick={() => router.push("/friends")}
                        className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-200 transition-all"
                      >
                        ענה לבקשה
                      </button>
                    )}

                    {user.friendshipStatus === "NONE" && (
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <UserPlus className="w-5 h-5" />
                        הוסף חבר
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
