import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/friends/[id]/reject - Reject friend request
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
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    return NextResponse.json(
      { error: "Failed to reject friend request" },
      { status: 500 }
    );
  }
}
