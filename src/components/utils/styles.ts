import type { ImageStyle, TextStyle, ViewStyle } from "react-native";
import { findByProps } from "@metro";
import { lazyDestructure, lazyValue } from "@utils/lazy";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

const Styles = findByProps("createStyles");

export const { ThemeContext } = lazyDestructure(() => findByProps("ThemeContext"), { hint: "object" });
export const { TextStyleSheet } = lazyDestructure(() => findByProps("TextStyleSheet")) as unknown as {
    TextStyleSheet: Record<string, TextStyle>;
};

/**
 * Get themed styles based on the current theme
 * @returns A hook that returns the themed stylesheet
 * @example
 * const useStyles = createStyles({
 *      container: {
 *          flex: 1,
 *          backgroundColor: tokens.colors.BACKGROUND_PRIMARY,
 *      },
 * });
 *
 * function MyComponent() {
 *      const styles = useStyles();
 *      return <View style={styles.container} />;
 * }
 */
export function createStyles<T extends NamedStyles<T>>(sheet: T | ((props: any) => T)): () => T {
    return lazyValue(() => Styles.createStyles(sheet));
}

/**
 * Get themed styles based on the current theme for class components
 * @example
 * const getStyles = createStyles({
 *      container: {
 *          flex: 1,
 *          backgroundColor: tokens.colors.BACKGROUND_PRIMARY,
 *      },
 * });
 *
 * class MyComponent extends React.Component {
 *      static contextType = ThemeContext;
 *      render() {
 *          const styles = getStyles(this.context);
 *          return <View style={styles.container} />;
 *      }
 * }
 */
export function createLegacyClassComponentStyles<T extends NamedStyles<T>>(
    sheet: T | ((props: any) => T),
): (ctxt: typeof ThemeContext) => T {
    return lazyValue(() => Styles.createLegacyClassComponentStyles(sheet));
}
