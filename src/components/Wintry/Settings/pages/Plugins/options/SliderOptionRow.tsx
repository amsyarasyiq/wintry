import type { BaseOptionRowProps } from "./BaseOptionRowProps";
import { Pressable, View } from "react-native";
import { usePluginSettings } from "../common/usePluginSettings";
import { CircleMinusIcon, CirclePlusIcon } from "@metro/common/icons";
import Slider from "@components/Discord/Slider/Slider";
import { Card, Stack, Text } from "@components/Discord";

function SliderRow({ opt, plugin, settingKey, start, end }: BaseOptionRowProps<"slider">) {
    const [current, setCurrent] = usePluginSettings<typeof opt>(plugin.$id, settingKey);
    const currentIndex = opt.points.indexOf(current);

    const updateValue = (newIndex: number) => {
        const clampedIndex = Math.max(0, Math.min(newIndex, opt.points.length - 1));
        setCurrent(opt.points[clampedIndex]);
    };

    return (
        <Card style={{ gap: 12 }} start={start} end={end}>
            <Stack direction="horizontal" justify="space-between">
                <Text variant="text-md/semibold">{opt.label}</Text>
                {current !== undefined && (
                    <Text variant="text-sm/medium" color="text-muted">
                        {current}
                    </Text>
                )}
            </Stack>
            <View style={{ paddingVertical: 12 }}>
                <Slider
                    step={1}
                    value={currentIndex}
                    minimumValue={0}
                    maximumValue={opt.points.length - 1}
                    // onSlidingComplete={updateValue}
                    onValueChange={updateValue}
                    startIcon={
                        <Pressable onPress={() => updateValue(currentIndex - 1)}>
                            <CircleMinusIcon />
                        </Pressable>
                    }
                    endIcon={
                        <Pressable onPress={() => updateValue(currentIndex + 1)}>
                            <CirclePlusIcon />
                        </Pressable>
                    }
                />
            </View>
        </Card>
    );
}

export function SliderOptionRow({ opt, plugin, settingKey, start, end }: BaseOptionRowProps<"slider">) {
    return <SliderRow start={start} end={end} opt={opt} plugin={plugin} settingKey={settingKey} />;
}
