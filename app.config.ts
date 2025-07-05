import type { ExpoConfig } from "expo/config"
import "ts-node/register"

const isProduction = process.env.EXPO_PUBLIC_APP_VARIANT === "production"

const name = isProduction ? "Agendar" : "Agendar Dev"
const bundleIdentifier = isProduction ? "br.tec.agendar" : "br.tec.agendar.dev"
const scheme = isProduction ? "agendar" : "agendar-dev"

const googleServicesFileIos = isProduction
  ? "./GoogleService-Info.plist"
  : "./GoogleService-Info-dev.plist"

const googleServicesFileAndroid = isProduction
  ? "./google-services.json"
  : "./google-services-dev.json"

const config: ExpoConfig = {
  name,
  slug: "agendar",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier,
    googleServicesFile: googleServicesFileIos,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: bundleIdentifier,
    googleServicesFile: googleServicesFileAndroid,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: ["expo-router", "expo-secure-store"],
  experiments: {
    typedRoutes: true,
  },
}

export default config
