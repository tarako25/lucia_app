"use client";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import no_profile from "@/imgs/no-avatar.png";

function Profile(props: any) {
  const { userId } = props;

  const router = useRouter();
  interface Item {
    id: string;
    production: string;
    username: string;
  }

  const [urlId, setUrlId] = useState("");

  //URLからプロフィールID取得
  useEffect(() => {
    const url = location.pathname;
    setUrlId(url.slice(1));
    if (urlId) {
      getUserData();
    }
    const box: any = document.getElementById("editBox");
    setBoxid(box);
  }, [urlId]);

  const [userData, setUserData] = useState<Item>();
  const [followed, setFollowed] = useState("");
  const [followed_count, setFollowed_count] = useState("");
  const [followeder_count, setFolloweder_count] = useState("");
  const [img, setImg] = useState("");

  // Create Supabase client
  const supabase = createClient(
    "https://qyecgulkarzfwziludjh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5ZWNndWxrYXJ6Znd6aWx1ZGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc1NDU5MTUsImV4cCI6MjAxMzEyMTkxNX0.wklN0pvj5FBfref2w-8aXVJbVrnvXJgggTQXGQOkcJc",
  );

  //プロフィール情報を取得
  const getUserData = async () => {
    const Id = urlId;
    const userData = {
      Id,
      userId,
    };
    const response = await fetch("api/UserData", {
      body: JSON.stringify(userData),
      headers: {
        "Content-type": "application/json",
      },
      method: "POST",
    });
    if (!response.ok) {
      toast.error("フォローに失敗しました", { id: "1" });
      console.error("HTTPエラー:", response.statusText);
    }
    const data = await response.json();
    console.log(data);
    setUserData(data.user);
    setFollowed(data.followed?.no);
    setFollowed_count(data.followed_count);
    setFolloweder_count(data.followeder_count);
    setName(data.user.username);
    setProduction(data.user.production);
    setImg(data.user.avatar_img);
  };

  //プロフィール編集モーダル
  const [boxid, setBoxid] = useState<any>("");
  const handleEditOpen = (e: any) => {
    e.preventDefault();
    if (boxid.classList.contains("hidden")) {
      boxid.classList.remove("hidden");
    } else {
      boxid.classList.add("hidden");
    }
  };

  const [name, setName] = useState("");
  const [production, setProduction] = useState("");

  //プロフィール編集
  const handleEdit = async (e: any) => {
    e.preventDefault();
    toast.loading("更新中..", { id: "1" });
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const pr = formData.get("pr");
    const Data = {
      name,
      pr,
      urlId,
    };
    const response = await fetch("api/EditProfile", {
      body: JSON.stringify(Data),
      method: "PUT",
      redirect: "manual",
    });
    if (response.ok) {
      boxid.classList.add("hidden");
      getUserData();
      router.refresh();
      toast.success("プロフィールを更新しました", { id: "1" });
    } else {
      toast.error("プロフィールの更新に失敗しました", { id: "1" });
      console.error("HTTPエラー:", response.statusText);
    }
  };
  //follow
  const followIdref = useRef<HTMLInputElement>(null);
  const followNameref = useRef<HTMLInputElement>(null);

  //フォロー
  const handleFollow = async () => {
    const elementId = followIdref.current?.innerHTML;
    const followId = elementId?.slice(1);
    const followName = followNameref.current?.innerHTML;
    const FollowData = {
      followId,
      followName,
      userId,
    };
    const response = await fetch("api/Follow", {
      body: JSON.stringify(FollowData),
      method: "POST",
    });
    if (response.ok) {
      getUserData();
      router.refresh();
      toast.success("フォローしました", { id: "1" });
    } else {
      toast.error("フォローに失敗しました", { id: "1" });
      console.error("HTTPエラー:", response.statusText);
    }
  };
  //フォロー解除
  const handleUnFollow = async () => {
    const response = await fetch("api/Follow", {
      body: JSON.stringify(followed),
      method: "PUT",
    });
    if (response.ok) {
      getUserData();
      router.refresh();
      toast.success("フォローを解除しました", { id: "1" });
    } else {
      toast.error("フォローに失敗しました", { id: "1" });
      console.error("HTTPエラー:", response.statusText);
    }
  };

  //プロフィール画像編集
  const handleImageChange = async (e: any) => {
    if (!e.target.files || e.target.files.length == 0) {
      // 画像が選択されていないのでreturn
      return;
    }
    const file_name = uuidv4();
    const file = e.target.files[0];
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(file_name, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (error) {
      // Handle error
      console.log(error);
    } else {
      const data = supabase.storage.from("avatars").getPublicUrl(file_name);
      setImg(data.data.publicUrl);
      fetchStorage(data.data.publicUrl);
    }
  };

  //プロフィール画像URLをStorageに保存
  const fetchStorage = async (url: string) => {
    const data = {
      url,
      userId,
    };
    const response = await fetch("api/SbStorage", {
      body: JSON.stringify(data),
      method: "POST",
    });
    if (!response.ok) {
      console.error("HTTPエラー:", response.statusText);
    }
  };

  return (
    <>
      <Toaster />
      {/* left-1/2 right-2/4 中央寄せ (position無でも可能)*/}
      <div
        className="fixed left-0 top-0 z-10 hidden h-[1000px] w-[1900px] bg-gray-400 bg-opacity-70"
        id="editBox"
      >
        <div className="fixed inset-x-1/2 inset-y-1/4 flex flex-col items-center">
          <div className="h-[500px] w-[400px] rounded bg-gray-500">
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-[430px] w-[375px] rounded bg-white">
                <div className="flex h-full w-full items-center justify-center">
                  <form
                    onSubmit={handleEdit}
                    className="flex w-[300px] flex-col items-center"
                  >
                    <div className="mb-5 font-bold">プロフィール情報編集</div>
                    <div className="relative mb-5 flex h-20 w-20 items-center  justify-center overflow-hidden rounded-full border-2 border-gray-300">
                      {img ? (
                        <Image
                          alt="プロフィール画像"
                          src={img}
                          width={100}
                          height={100}
                          className="h-full w-full"
                        />
                      ) : (
                        <Image
                          alt="プロフィール画像"
                          src={no_profile}
                          className="h-full w-full"
                        />
                      )}
                      <input
                        type="file"
                        id="fileInput"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <label
                        htmlFor="fileInput"
                        className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 bg-opacity-70"
                      >
                        <AddAPhotoIcon className="text-white" />
                      </label>
                    </div>
                    <input
                      type="text"
                      className="mb-3 h-11 w-full border border-gray-400 pl-2"
                      onChange={(e) => setName(e.target.value)}
                      name="name"
                      placeholder="新しいユーザー名を入力して下さい"
                      required
                      value={name || ""}
                    />
                    <input
                      type="text"
                      className="mb-3 h-11 w-full border border-gray-400 pl-2"
                      onChange={(e) => setProduction(e.target.value)}
                      name="pr"
                      placeholder="自己紹介文を書こう"
                      required
                      value={production || ""}
                    />
                    {/*{userData?.production}*/}
                    <div className="flex justify-center">
                      <button
                        className="mx-3 mt-3 border px-3 py-1"
                        onClick={handleEditOpen}
                      >
                        閉じる
                      </button>
                      <button className="mx-3 mt-3 border px-3 py-1">
                        更新
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <Link href="./" className="w-full">
          <div className="flex w-full">
            <p className="mb-4 mt-5 flex items-center text-white">
              <ArrowLeftIcon />
              プロフィール
            </p>
          </div>
        </Link>
        <div className="w-full rounded  bg-white px-4 py-5 ">
          <div className="mb-5 flex h-20 w-20 items-center  justify-center overflow-hidden rounded-full border-2 border-gray-300">
            {img ? (
              <Image
                alt="プロフィール画像"
                src={img}
                width={100}
                height={100}
                className="h-full w-full"
              />
            ) : (
              <Image
                alt="プロフィール画像"
                src={no_profile}
                className="h-full w-full"
              />
            )}
          </div>
          <div className="mb-5 flex justify-between">
            <div className="flex flex-col items-start">
              <div ref={followNameref}>{userData?.username}</div>
              <div ref={followIdref}>@{userData?.id}</div>
            </div>
            {userData && userData.id === userId && (
              <button className="border px-3 py-1" onClick={handleEditOpen}>
                アカウント情報を編集
              </button>
            )}
          </div>
          <div className="flex flex-col items-start">
            <div className="mb-5">{userData?.production}</div>
            <div className="mb-3 flex w-full justify-between">
              <div className="flex items-center justify-center">
                <div className="mr-2">{followed_count}フォロー</div>
                <div>{followeder_count}フォロワー</div>
              </div>
              {userData && userData.id !== userId && !followed ? (
                <button className="border px-3 py-1" onClick={handleFollow}>
                  フォロー
                </button>
              ) : (
                userData &&
                userData.id !== userId && (
                  <button className="border px-3 py-1" onClick={handleUnFollow}>
                    フォロー解除
                  </button>
                )
              )}
            </div>
            {userData && userData.id !== userId && (
              <Link
                href={`/DirectMessage?Id=${userData.id}`}
                className="border px-3 py-1"
              >
                ダイレクトメッセージを送る
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
