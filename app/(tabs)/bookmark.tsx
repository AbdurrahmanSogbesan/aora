import { View, Text, FlatList, RefreshControl } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoCard from "@/components/VideoCard";
import SearchInput from "@/components/SearchInput";
import useAppwrite from "@/lib/useAppwrite";
import { getPosts } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";
import EmptyState from "@/components/EmptyState";

const Bookmarks = () => {
  const { user } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(getPosts);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // recall posts
    await refetch();
    setRefreshing(false);
  };

  const likedPosts =
    posts?.filter((post) =>
      post.likes.some((like) => like.$id === user?.$id)
    ) || [];

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={likedPosts}
        keyExtractor={(item) => item?.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className="w-full my-6 px-4">
            <Text className="text-2xl text-white font-psemibold">
              Saved Videos
            </Text>

            <View className="mt-6 mb-8">
              <SearchInput placeholder="Search your saved videos" />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subTitle="Go back home and save some videos!"
            hideCreateButton
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={"#fff"}
          />
        }
        initialNumToRender={4}
      />
    </SafeAreaView>
  );
};

export default Bookmarks;
