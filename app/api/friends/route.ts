import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/friends - Get user's friends and pending requests
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get accepted friendships
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: "ACCEPTED" },
          { addresseeId: userId, status: "ACCEPTED" },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
        addressee: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
      },
    });

    // Get pending requests (received)
    const pendingRequests = await prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: "PENDING",
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
      },
    });

    // Get sent requests
    const sentRequests = await prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: "PENDING",
      },
      include: {
        addressee: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
      },
    });

    // Format friends list
    const formattedFriends = friends.map((f) => {
      const friend = f.requesterId === userId ? f.addressee : f.requester;
      return {
        friendshipId: f.id,
        ...friend,
      };
    });

    return NextResponse.json({
      friends: formattedFriends,
      pendingRequests: pendingRequests.map((r) => ({
        friendshipId: r.id,
        ...r.requester,
        requestedAt: r.createdAt,
      })),
      sentRequests: sentRequests.map((r) => ({
        friendshipId: r.id,
        ...r.addressee,
        requestedAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}
