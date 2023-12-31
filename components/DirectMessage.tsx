"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";

function DirectMessage(props: any) {
  const { userId, username } = props;
  const { mutate } = useSWRConfig();
  const [userdata, setUserdata] = useState<{
    id: string;
    avatar_img: string;
    delete_flg: number;
    production: string | null;
    username: string;
  }>({
    id: "",
    avatar_img: "",
    delete_flg: 0,
    production: null,
    username: "",
  });
  const [targetdata, setTargetdata] = useState<{
    id: string;
    avatar_img: string;
    delete_flg: number;
    production: string | null;
    username: string;
  }>({
    id: "",
    avatar_img: "",
    delete_flg: 0,
    production: null,
    username: "",
  });
  const searchParams = useSearchParams();
  const targetId = searchParams.get("Id");

  //ユーザー情報を取得
  const getUserData = async () => {
    const response = await fetch(`api/DirectMessageUser?id=${targetId}`);
    const element = await response.json();
    setUserdata(element.user);
    setTargetdata(element.target);
  };

  useEffect(() => {
    getUserData();
  }, []);

  //メッセージ取得
  const { data, error } = useSWR(
    `/api/DirectSendMessage?id=${targetId}`,
    async () => {
      const response = await fetch(`/api/DirectSendMessage?id=${targetId}`);
      const element = await response.json();
      return element;
    },
    { refreshInterval: 1000 }
  );

  useEffect(() => {
    const scroll = document.getElementById("scroll");
    if (scroll) {
      const scrollHeight = scroll?.scrollHeight;
      scroll.style.scrollBehavior = "smooth";
      scroll.scrollTop = scrollHeight;
    }
  }, [data]);

  if (error) {
    return <div>ユーザーの取得に失敗しました：{error.message}</div>;
  }

  if (!data) {
    return <div>ユーザーの読み込み中...</div>;
  }
  //メッセージを送信
  const SendMessage = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch(`/api/DirectSendMessage?id=${targetId}`, {
      body: formData,
      method: "POST",
    });
    e.target.reset();
    if (!response.ok) {
      console.log("ロード中にエラーが発生しました");
    }
    mutate(`/api/DirectSendMessage?id=${targetId}`);
  };
  console.log(targetdata, "test");
  return (
    <>
      <div className="my-5">
        <div className="text h-[60px] w-full rounded-t bg-gray-200">
          <div className="items-ceneter flex h-full justify-center">
            <div className="flex items-center font-bold">
              {targetdata.username}
            </div>
          </div>
        </div>
        <div
          className="mb-2 h-[700px] w-full overflow-y-auto bg-white pb-4"
          id="scroll"
        >
          <div className="flex justify-center ">
            <ul className="w-11/12 text-left">
              {/* メッセージ */}
              {data.data
                .slice()
                .reverse()
                .map((item: any) =>
                  item.userId == userId ? (
                    <li key={item.id} className="mt-6 flex items-center">
                      <div className="mr-4 h-14 w-14 overflow-hidden rounded-full border border-gray-300">
                        <Image
                          alt="アイコン"
                          src={userdata.avatar_img}
                          width={50}
                          height={50}
                          className="h-full w-full"
                        />
                      </div>
                      <div className="rounded-xl bg-green-300 px-3 py-1 text-xl">
                        {item.content}
                      </div>
                    </li>
                  ) : (
                    <li
                      key={item.id}
                      className="mt-6 flex items-center justify-end"
                    >
                      <div className="rounded-xl bg-gray-300 px-3 py-1 text-xl">
                        {item.content}
                      </div>
                      <div className="ml-4 h-14 w-14 overflow-hidden rounded-full border border-gray-300">
                        <Image
                          alt="アイコン"
                          src={targetdata.avatar_img}
                          width={50}
                          height={50}
                          className="h-full w-full"
                        />
                      </div>
                    </li>
                  )
                )}
            </ul>
          </div>
        </div>
        <form onSubmit={SendMessage} className="flex justify-between">
          <input
            name="message"
            type="text"
            className="h-10 w-4/5 rounded pl-3"
          />
          <button className="w-1/6 rounded border text-white">送信</button>
        </form>
      </div>
    </>
  );
}

export default DirectMessage;
