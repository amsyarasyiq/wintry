import { Linking } from "react-native";

export function openURL(url: string) {
    Linking.openURL(url);
}
