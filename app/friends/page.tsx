"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserPlus, Users, Clock, X, Check, Search } from "lucide-react";

interface Friend {
  friendshipId: string;
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
}

interface PendingRequest extends Friend {
  requestedAt: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"friends" | "pending" | "sent">(
    "friends"
  );

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends");
      const data = await res.json();

      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
      setSentRequests(data.sentRequests || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}/accept`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchFriends();
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleReject = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}/reject`, {
        method: "POST",
      });

      if (res.ok) {
        setPendingRequests((prev) =>
          prev.filter((r) => r.friendshipId !== friendshipId)
        );
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const handleRemove = async (friendshipId: string) => {
    if (!confirm("האם אתה בטוח שברצונך להסיר חבר זה?")) return;

    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFriends((prev) =>
          prev.filter((f) => f.friendshipId !== friendshipId)
        );
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">טוען...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">👥 חברים</h1>
          <p className="text-gray-600">נהל את החברים והבקשות שלך</p>
        </div>

        {/* Search Button */}
        <button
          onClick={() => router.push("/friends/search")}
          className="w-full mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          חפש חברים חדשים
        </button>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-md">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "friends"
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="w-5 h-5 inline-block ml-2" />
            חברים ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all relative ${
              activeTab === "pending"
                ? "bg-purple-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Clock className="w-5 h-5 inline-block ml-2" />
            בקשות ({pendingRequests.length})
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "sent"
                ? "bg-pink-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <UserPlus className="w-5 h-5 inline-block ml-2" />
            נשלחו ({sentRequests.length})
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === "friends" && (
            <>
              {friends.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center shadow-md">
                  <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">עדיין אין לך חברים</p>
                  <button
                    onClick={() => router.push("/friends/search")}
                    className="mt-4 text-blue-500 hover:underline"
                  >
                    חפש חברים חדשים
                  </button>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                          {friend.image ? (
                            <Image
                              src={friend.image}
                              alt={friend.name || "User"}
                              fill
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">
                              {(friend.name || friend.username || "?")[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {friend.name || friend.username}
                          </h3>
                          {friend.bio && (
                            <p className="text-sm text-gray-500">{friend.bio}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(friend.friendshipId)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "pending" && (
            <>
              {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center shadow-md">
                  <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">אין בקשות חברות ממתינות</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {request.image ? (
                            <Image
                              src={request.image}
                              alt={request.name || "User"}
                              fill
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">
                              {(request.name || request.username || "?")[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {request.name || request.username}
                          </h3>
                          {request.bio && (
                            <p className="text-sm text-gray-500">{request.bio}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(request.friendshipId)}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-all"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(request.friendshipId)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "sent" && (
            <>
              {sentRequests.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center shadow-md">
                  <UserPlus className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">לא שלחת בקשות חברות</p>
                </div>
              ) : (
                sentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-xl p-4 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white font-bold">
                          {request.image ? (
                            <Image
                              src={request.image}
                              alt={request.name || "User"}
                              fill
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">
                              {(request.name || request.username || "?")[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {request.name || request.username}
                          </h3>
                          <p className="text-sm text-gray-500">בקשה ממתינה...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
