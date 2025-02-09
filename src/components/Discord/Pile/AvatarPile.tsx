import type { LiteralUnion } from "type-fest";
import { getComponentFromProps } from "../util";

/**
 * size="xxsmall"
                                names={plugin.authors?.map(a => a.name)}
                                totalCount={plugin.authors?.length}
 */
interface AvatarPileProps {
    size: LiteralUnion<"xxsmall", string>;
    names: string[];
    totalCount: number;
    children: React.ReactNode;
}

export default getComponentFromProps<AvatarPileProps>("AvatarPile", { singular: true });
