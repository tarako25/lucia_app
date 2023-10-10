import { NextRequest, NextResponse } from "next/server";

import prisma from "../../../lib/prisma";

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
    const followId = data.followId;
    const followname = data.followName;
    const user_id = data.userId;

    //日付作成
    const now = new Date();
    //ISO形式に変換
    const nowISO8601 = now.toISOString();

    //follow
    const follow = await prisma.follow.create({
      data: {
        createdAt: nowISO8601,
        followId: followId,
        followname: String(followname),
        user: {
          connect: {
            id: user_id, // ここで関連するユーザーのIDを指定
          },
        },
      },
    });

    //follower
    const no = follow.no;
    const follower = await prisma.follower.create({
      data: {
        createdAt: nowISO8601,
        follow: {
          connect: {
            no: no,
          },
        },
        followerId: user_id,
        followername: String(followname),
        user: {
          connect: {
            id: followId, // ここで関連するユーザーのIDを指定
          },
        },
      },
    });
    return NextResponse.json(
      { follow, follower, message: "Success" },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err, message: "Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request, res: NextResponse) {
  try {
    await DB();
    const no = await req.json();

    //follower
    const unfollower = await prisma.follower.delete({
      where: {
        follow_no: no,
      },
    });

    //follow
    const unfollow = await prisma.follow.delete({
      where: {
        no: no,
      },
    });

    return NextResponse.json(
      { message: "Success", unfollow, unfollower },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err, message: "Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
