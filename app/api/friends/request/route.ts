import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/friends/request - Send friend request
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot send friend request to yourself" },
        { status: 400 }
      );
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: session.user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return NextResponse.json(
          { error: "Already friends" },
          { status: 400 }
        );
      } else if (existing.status === "PENDING") {
        return NextResponse.json(
          { error: "Friend request already sent" },
          { status: 400 }
        );
      } else if (existing.status === "BLOCKED") {
        return NextResponse.json(
          { error: "Cannot send friend request" },
          { status: 400 }
        );
      }
    }

    // Create friendship request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: session.user.id,
        addresseeId: targetUserId,
        status: "PENDING",
      },
    });

    // Create notification for target user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: "FRIEND_REQUEST",
        title: "בקשת חברות חדשה",
        message: `${session.user.name || session.user.username} שלח/ה לך בקשת חברות`,
        link: `/friends`,
        relatedId: friendship.id,
      },
    });

    return NextResponse.json({ success: true, friendshipId: friendship.id });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json(
      { error: "Failed to send friend request" },
      { status: 500 }
    );
  }
}
