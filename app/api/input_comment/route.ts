import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DB(){
    try {
        await prisma.$connect();
    } catch (error) {
        return Error("DB接続に失敗しました")
    }
}

export async function POST (req: Request, res:NextResponse){
    try {
        await DB();
        const data = await req.json();
        const msg = data.message
        const user_id = data.userId
        const post_no = data.post_no
        //日付作成
        const now = new Date();
        //ISO形式に変換
        const nowISO8601 = now.toISOString();
        const comment = await prisma.comment.create({
            data: {
                content: msg,
                //ISO形式のみ(保存時はISOで＋1hなってるいるがフロントで変換している)
                createdAt: nowISO8601,
                user:{
                    connect: {
                        id: user_id // ここで関連するユーザーのIDを指定
                    }
                }, 
                message:{
                    connect: {
                        id: Number(post_no) // ここで関連するユーザーのIDを指定
                    }
                }, 
            }
        });
        return NextResponse.json({ message: "Success", comment}, {status: 201});
    } catch (err) {
        console.log(err)
        return NextResponse.json({ message: "Error", err}, {status: 500});
    } finally {
        await prisma.$disconnect();
    }
}