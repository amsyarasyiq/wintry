import { Card, Text } from "@components/Discord";
import type { OptionDefinition } from "@plugins/types";
import type React from "react";

export function BaseCardOption<O extends OptionDefinition>({
    opt,
    children,
    start,
    end,
}: { opt: O; children: React.ReactNode; start: boolean; end: boolean }) {
    return (
        <Card start={start} end={end}>
            {children}
            <Text style={{ marginTop: 8 }} color="text-secondary" variant="text-sm/normal">
                {opt.description}
            </Text>
        </Card>
    );
}
