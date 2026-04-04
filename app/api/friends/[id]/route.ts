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

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    if (action === "accept") {
      // Accept friend request
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
    } else if (action === "reject") {
      // Reject friend request
      const friendship = await prisma.friendship.findUnique({
        where: { id: params.id },
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

      // Update status to REJECTED
      await prisma.friendship.update({
        where: { id: params.id },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error handling friend request:", error);
    return NextResponse.json(
      { error: "Failed to handle friend request" },
      { status: 500 }
    );
  }
}

// DELETE /api/friends/[id] - Remove friend
export async function DELETE(
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
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friendship not found" },
        { status: 404 }
      );
    }

    // Check if user is part of this friendship
    if (
      friendship.requesterId !== session.user.id &&
      friendship.addresseeId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete friendship
    await prisma.friendship.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing friend:", error);
    return NextResponse.json(
      { error: "Failed to remove friend" },
      { status: 500 }
    );
  }
}
