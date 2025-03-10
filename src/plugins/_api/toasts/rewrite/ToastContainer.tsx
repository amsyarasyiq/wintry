import { View } from "react-native";
import { useSafeAreaInsets } from "@components/Libraries/react-native-safe-area-context";
import { useToastStore } from "@stores/useToastStore";
import Toast from "./Toast";
import { ToastStore } from "@metro/common/stores";
import { FluxUtils } from "@metro/common/libraries";

const isDiscordToastActive = () => FluxUtils.useStateFromStores([ToastStore], () => ToastStore.getContent()) != null;

export default function ToastContainer() {
    const toasts = useToastStore(state => state.toasts);
    let marginTop = useSafeAreaInsets().top + 8;

    // Check if Discord's toast is active.
    // TODO: 50 is hardcoded, fix this to properly measure the actual toast height if you don't like it.
    if (isDiscordToastActive()) marginTop += 50;

    return (
        <View style={{ marginTop, gap: 4 }}>
            {[...toasts].reverse().map(toast => (
                <Toast key={toast.id} toast={toast} />
            ))}
        </View>
    );
}
