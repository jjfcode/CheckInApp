// @ts-nocheck
const config = {
  expo: {
    name: "CheckInApp",
    slug: "CheckInApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon-512x512.png",
    userInterfaceStyle: "light",
    jsEngine: "hermes",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },      package: "com.juanjo73.CheckInApp",
      versionCode: 11,
      permissions: [],
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      buildToolsVersion: "34.0.0",
      config: {
        googleMaps: {
          apiKey: "",
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "ddea9a8c-6d1d-47db-a3ab-b6dbea2ca5a7",
      },
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0",
          },
        },
      ],
    ],
  },
};

export default config;
