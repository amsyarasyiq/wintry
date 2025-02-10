import { lookupByFilePath } from "@metro/common/wrappers";
import type { User } from "discord-types/general";
import type { LiteralUnion } from "type-fest";

interface AvatarProps {
    user: User;
    size?: LiteralUnion<"xxsmall" | "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge", string>;
}

export const Avatar = lookupByFilePath("uikit-native/Avatar.tsx", {
    returnEsmDefault: true,
}).asLazy() as React.FC<AvatarProps>;

export default Avatar;
