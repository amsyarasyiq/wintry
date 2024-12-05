import { createFilterDefinition } from "./factories";
import { moduleRegistry } from "./internal/modules";

export const byProps = createFilterDefinition<string[]>(
    (props, m) => (props.length === 0 ? m[props[0]] : props.every(p => m[p])),
    props => `wintry.metro.byProps(${props.join(",")})`,
);

export const byName = createFilterDefinition<[string]>(
    ([name], m) => m.name === name,
    name => `wintry.metro.byName(${name})`,
);

export const byDisplayName = createFilterDefinition<[string]>(
    ([displayName], m) => m.displayName === displayName,
    name => `wintry.metro.byDisplayName(${name})`,
);

export const byTypeName = createFilterDefinition<[string]>(
    ([typeName], m) => m.type?.name === typeName,
    name => `wintry.metro.byTypeName(${name})`,
);

export const byStoreName = createFilterDefinition<[string]>(
    ([name], m) => m.getName?.length === 0 && m.getName() === name,
    name => `wintry.metro.byStoreName(${name})`,
);

export const byFilePath = createFilterDefinition<[string, boolean]>(
    // module return depends on defaultCheck. if true, it'll return module.default, otherwise the whole module
    // unlike filters like byName, defaultCheck doesn't affect the return since we don't rely on exports, but only its ID
    // one could say that this is technically a hack, since defaultCheck is meant for filtering exports
    ([path, exportDefault], _, id, isDefaultCheck) =>
        exportDefault === isDefaultCheck && moduleRegistry.get(id)?.meta.filePath === path,
    ([path, exportDefault]) => `wintry.metro.byFilePath(${path},${exportDefault})`,
);

export const byMutableProp = createFilterDefinition<[string]>(
    ([prop], m) => m?.[prop] && !Object.getOwnPropertyDescriptor(m, prop)?.get,
    prop => `wintry.metro.byMutableProp(${prop})`,
);
