import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/feed - Combined feed (family + friends)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const feedType = searchParams.get("type") || "all"; // all | friends | family | public
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get user's family IDs
    const userFamilies = await prisma.familyMember.findMany({
      where: { userId: session.user.id },
      select: { familyId: true },
    });

    const familyIds = userFamilies.map((f) => f.familyId);

    // Get user's friend IDs (accepted friendships)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: session.user.id, status: "ACCEPTED" },
          { addresseeId: session.user.id, status: "ACCEPTED" },
        ],
      },
    });

    const friendIds = friendships.map((f) =>
      f.requesterId === session.user.id ? f.addresseeId : f.requesterId
    );

    // Get friends' family IDs
    const friendFamilies = await prisma.familyMember.findMany({
      where: { userId: { in: friendIds } },
      select: { familyId: true },
    });

    const friendFamilyIds = friendFamilies.map((f) => f.familyId);

    // Build query based on feed type
    let whereClause: any = {
      deletedAt: null,
    };

    if (feedType === "family") {
      // Only my family entries
      whereClause.familyId = { in: familyIds };
    } else if (feedType === "friends") {
      // Friends' entries with FRIENDS or PUBLIC visibility
      whereClause.AND = [
        { familyId: { in: friendFamilyIds } },
        { visibility: { in: ["FRIENDS", "PUBLIC"] } },
      ];
    } else if (feedType === "public") {
      // All public entries
      whereClause.visibility = "PUBLIC";
    } else {
      // "all" - Combined feed
      whereClause.OR = [
        // My family entries (any visibility)
        { familyId: { in: familyIds } },
        // Friends' entries with FRIENDS or PUBLIC
        {
          AND: [
            { familyId: { in: friendFamilyIds } },
            { visibility: { in: ["FRIENDS", "PUBLIC"] } },
          ],
        },
        // All public entries
        { visibility: "PUBLIC" },
      ];
    }

    const entries = await prisma.entry.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        taggedChildren: {
          include: {
            child: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        eventDate: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Add isLikedByMe flag
    const entriesWithFlags = entries.map((entry) => ({
      ...entry,
      isLikedByMe: entry.likes.some((like) => like.userId === session.user.id),
      isMyFamily: familyIds.includes(entry.familyId),
    }));

    return NextResponse.json({ entries: entriesWithFlags });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
