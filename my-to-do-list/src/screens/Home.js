import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { CalendarDaysIcon, MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../../api/weather";
import { weatherImages } from "../../constants";
import * as Progress from "react-native-progress";
import { getData, storeData } from "../../utils/asyncStorage";

export default function Home() {
  const [search, setSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = async (loc) => {
    // console.log("location,", loc);
    setLocations([]);
    setSearch(false);
    setLoading(true);

    try {
      const data = await fetchWeatherForecast({
        cityName: loc.name,
        days: "7",
      });
      setWeather(data);
      setLoading(false);
      storeData("city", loc.name);
      // console.log("forecast", data);
    } catch (error) {
      console.error("Error fetching weather forecast:", error);
    }
  };

  // const handleSearch = (value) => {
  //   console.log("value", value);
  //   if (value.length > 2) {
  //     fetchLocations({ cityName: value }).then((data) => {
  //       console.log("loc di search", data);
  //       setLocations(data);
  //     });
  //   }
  // };

  const handleSearch = useCallback(
    debounce((value) => {
      console.log("search value:", value);
      if (value.length > 2) {
        fetchLocations({ cityName: value }).then((data) => {
          console.log("locations:", data);
          setLocations(data);
        });
      }
    }, 1200),
    []
  );

  // const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = "Dubai";
    if (myCity) cityName = myCity;

    fetchWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const { current, location } = weather;

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../../assets/bg.png")}
        style={{ position: "absolute", height: "100%", width: "100%" }}
      />
      {loading ? (
        <View className="flex-1 flex-row justify-center items-center">
          {/* <Text className="text-white text-4xl">Loading....</Text> */}
          <Progress.CircleSnail thickness={10} size={40} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          {/* search */}
          <View style={{ height: "7%", marginHorizontal: 20 }}>
            <View style={search ? styles.colSearch : "transparent"}>
              {search ? (
                <TextInput
                  // onChangeText={handleTextDebounce}
                  onChangeText={handleSearch}
                  placeholder="Search for a city"
                  placeholderTextColor="lightgray"
                  className="pl-6 h-10 pb-1 flex-1 text-base"
                />
              ) : null}

              <TouchableOpacity
                onPress={() => setSearch(!search)}
                style={styles.iconSearch}
                className="rounded-full p-3 m-1"
              >
                <MagnifyingGlassIcon size={25} color="white" />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && search ? (
              <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                {locations.map((loc, index) => (
                  <TouchableOpacity
                    onPress={() => {
                      console.log("klik location:", loc);
                      handleLocation(loc);
                    }}
                    key={index}
                    className={`flex-row items-center border-0 p-3 px-4 mb-1 ${
                      index + 1 !== locations.length
                        ? "border-b-2 border-b-gray-400"
                        : ""
                    }`}
                  >
                    <MapPinIcon size={20} color="gray" />
                    <Text style={styles.resultOfSearch}>
                      {loc?.name}, {loc?.country}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
          {/* forecast */}
          <View className="mx-4 justify-around flex-1 mb-2">
            {/* location */}
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name},
              <Text className="text-lg font-semibold text-gray-300">
                {" " + location?.country}
              </Text>
            </Text>
            {/* weather Image */}
            <View className="flex-row justify-center">
              <Image
                // source={require("../../assets/partly-cloudy.png")}
                source={weatherImages[current?.condition?.text]}
                className="w-64 h-64"
              />
            </View>
            {/* degree */}
            <View className="space-y-2">
              <Text className="text-center font-bold text-white text-6xl ml-5">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-center text-white text-xl tracking-widest">
                {current?.condition?.text}
              </Text>
            </View>
            {/* other stats */}
            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../../assets/wind.png")}
                  className="h-10 w-10"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.wind_kph}
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../../assets/drop.png")}
                  className="h-10 w-10"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../../assets/sun.png")}
                  className="h-10 w-10"
                />
                <Text className="text-white font-semibold text-base">
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>

          {/* forecast next day */}
          <View className="mb-2 space-y-3">
            <View className="flex-row items-center mx-5 space-x-2">
              <CalendarDaysIcon size={22} color="white" />
              <Text className="text-white text-base"> Daily Forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                const date = new Date(item.date);
                const options = { weekday: "long" };
                const dayName = date.toLocaleDateString("en-US", options);

                return (
                  <View
                    key={index}
                    style={styles.forecastNextDay}
                    className="flex justify-center items-center w-24 rounded-3xl py-3 scroll-py-1 mr-4"
                  >
                    <Image
                      source={weatherImages[item?.day?.condition?.text]}
                      style={{ width: 50, height: 50 }}
                    />
                    <Text style={{ color: "white" }}>{dayName}</Text>
                    <Text className="text-white text-lg font-semibold">
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  colSearch: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 40,
    // paddingHorizontal: 1,
  },
  iconSearch: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  resultOfSearch: {
    color: "black",
    fontSize: 16,
    marginLeft: 10,
  },
  forecastNextDay: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
});
