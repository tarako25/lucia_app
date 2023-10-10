import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function DB() {
  try {
    await prisma.$connect();
  } catch (error) {
    return Error("DB接続に失敗しました");
  }
}

export async function POST(req: Request, res: NextResponse) {
  try {
    await DB();
    const data = await req.json();
    const userId = data.userId;
    const start = data.start;
    const Pageitem = data.Pageitem;
    const followUsers = await prisma.follow.findMany({
      where: {
        userId: userId,
      },
    });
    let followsId = followUsers.map((user) => user.followId);
    //自分の投稿を含める
    followsId.push(userId);
    const mylist = await prisma.message.findMany({
      include: {
        good: true,
      },
      orderBy: {
        id: "desc",
      },
      skip: start,
      take: Pageitem,
      where: {
        userId: {
          in: followsId,
        },
      },
    });

    const count = await prisma.message.count({
      where: {
        userId: {
          in: followsId,
        },
      },
    });
    return NextResponse.json(
      { count, message: "Success", mylist },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ err, message: "Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}