import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getFriends } from "../lib/api";
import NoFriendsFound from "../components/NoFriendsFound";
import FriendCard from "../components/FriendCard";

const FriendsPage = () => {
  const { data: friendsData, isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });
  const friends = Array.isArray(friendsData?.friends)
    ? friendsData.friends
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
      {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
