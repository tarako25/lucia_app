import { NextRequest, NextResponse } from "next/server";

import { getPageSession } from "@/auth/lucia";
import prisma_C from "@/lib/prisma";

export async function GET(req: Request, res: NextResponse) {
  try {
    const session = await getPageSession();
    const userId = session?.user.userId;

    const user = await prisma_C.directMessage.findMany({
      distinct: ["targetId", "userId"],
      where: {
        OR: [
          {
            userId: userId,
          },
          {
            targetId: userId,
          },
        ],
      },
    });

    // フィルタリングを実行して重複を削除
    const uniqueUser = user.filter((item, index, self) => {
      const isDuplicate =
        self.findIndex(
          (other) =>
            (other.username === item.targetname &&
              other.targetname === item.username) ||
            (other.username === item.username &&
              other.targetname === item.targetname),
        ) !== index;
      return !isDuplicate;
    });
    //ユーザーリスト取得
    const users = uniqueUser.map((user) => {
      return user.targetId == userId ? user.userId : user.targetId;
    });

    const list = await prisma_C.user.findMany({
      where: {
        id: {
          in: users,
        },
      },
    });
    return NextResponse.json({ list, message: "Success" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ err, message: "Error" }, { status: 500 });
  } finally {
    await prisma_C.$disconnect();
  }
}
