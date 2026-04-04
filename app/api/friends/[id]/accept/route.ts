import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/friends/[id]/accept - Accept friend request
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: params.id },
      include: { requester: true },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }

    if (friendship.addresseeId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (friendship.status !== "PENDING") {
      return NextResponse.json(
        { error: "Friend request is not pending" },
        { status: 400 }
      );
    }

    // Update status to ACCEPTED
    await prisma.friendship.update({
      where: { id: params.id },
      data: { status: "ACCEPTED" },
    });

    // Create notification for requester
    await prisma.notification.create({
      data: {
        userId: friendship.requesterId,
        type: "FRIEND_ACCEPTED",
        title: "בקשת החברות אושרה!",
        message: `${session.user.name || session.user.username} אישר/ה את בקשת החברות שלך`,
        link: `/friends`,
        relatedId: friendship.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return NextResponse.json(
      { error: "Failed to accept friend request" },
      { status: 500 }
    );
  }
}
