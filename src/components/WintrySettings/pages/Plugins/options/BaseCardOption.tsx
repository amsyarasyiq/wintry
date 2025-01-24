import { Card, Text } from "../../../../../metro/common";
import type { OptionDefinition } from "../../../../../plugins/types";
import type React from "react";

export function BaseCardOption<O extends OptionDefinition>({ opt, children }: { opt: O; children: React.ReactNode }) {
    return (
        <Card start={false} end={false}>
            {children}
            <Text style={{ marginTop: 8 }} color="text-secondary" variant="text-sm/normal">
                {opt.description}
            </Text>
        </Card>
    );
}
