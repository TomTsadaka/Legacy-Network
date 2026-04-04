import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/search?q=name - Search users
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Search users by name or username
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: { not: session.user.id }, // Exclude current user
          },
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { username: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        isPublic: true,
      },
      take: 20,
    });

    // Get friendship status for each user
    const userIds = users.map((u) => u.id);
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: session.user.id, addresseeId: { in: userIds } },
          { addresseeId: session.user.id, requesterId: { in: userIds } },
        ],
      },
    });

    // Map friendship status
    const usersWithStatus = users.map((user) => {
      const friendship = friendships.find(
        (f) =>
          (f.requesterId === session.user.id && f.addresseeId === user.id) ||
          (f.addresseeId === session.user.id && f.requesterId === user.id)
      );

      let friendshipStatus = "NONE";
      let friendshipId = null;
      let isPending = false;
      let isSentByMe = false;

      if (friendship) {
        friendshipId = friendship.id;
        if (friendship.status === "ACCEPTED") {
          friendshipStatus = "FRIENDS";
        } else if (friendship.status === "PENDING") {
          friendshipStatus = "PENDING";
          isPending = true;
          isSentByMe = friendship.requesterId === session.user.id;
        } else if (friendship.status === "BLOCKED") {
          friendshipStatus = "BLOCKED";
        }
      }

      return {
        ...user,
        friendshipStatus,
        friendshipId,
        isPending,
        isSentByMe,
      };
    });

    return NextResponse.json({ users: usersWithStatus });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
