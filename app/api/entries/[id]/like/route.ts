import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/entries/[id]/like - Toggle like
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entryId = params.id;

    // Check if entry exists
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      include: { author: true },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_entryId: {
          userId: session.user.id,
          entryId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          entryId,
        },
      });

      // Create notification for entry author (if not liking own entry)
      if (entry.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: entry.authorId,
            type: "ENTRY_LIKE",
            title: "לייק חדש!",
            message: `${session.user.name || session.user.username} אהב/ה את הזיכרון שלך`,
            link: `/entries/${entryId}`,
            relatedId: entryId,
          },
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
