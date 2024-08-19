import { View, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import React, { ComponentProps, useState } from "react";
import icons from "@/constants/icons";
import { router, usePathname } from "expo-router";

interface SearchInputProps {
  initialQuery?: string;
}

const SearchInput = ({
  initialQuery,
  ...props
}: SearchInputProps & ComponentProps<typeof TextInput>) => {
  const pathName = usePathname();
  const [query, setQuery] = useState(initialQuery || "");

  return (
    <View className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary items-center flex-row space-x-4">
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={query}
        placeholder={props.placeholder || "Search for a video topic"}
        placeholderTextColor="#cdcde0"
        onChangeText={(e) => setQuery(e)}
      />
      <TouchableOpacity
        onPress={() => {
          if (!query) {
            return Alert.alert("Missing Query", "Please enter a search query");
          }
          if (pathName.startsWith("/search")) router.setParams({ query });
          else router.push(`/search/${query}`);
        }}
      >
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
