/**
 * Represents the structure of a theme object.
 */
export interface WintryTheme {
    /**
     * Unique identifier for the theme, typically in the format of a reverse domain name.
     * Example: "pylixonly.caffeine"
     */
    id: string;

    /**
     * Contains information about the theme's display name, description, and authors.
     */
    display: ThemeDisplay;

    /**
     * The type of the object, which should always be "theme" for theme objects.
     */
    type: "theme";
    /**
     * Contains the main styling properties of the theme, such as colors, background, icons, and fonts.
     */
    main: ThemeMain;
}

interface ThemeDisplay {
    name: string;
    description: string;
    authors: {
        name: string;
        id: string;
    }[];
}

/**
 * Defines the main styling properties of the theme.
 */
interface ThemeMain {
    /**
     * Defines the base color scheme of the theme.
     */
    base: "light" | "dark";
    /**
     * Defines the color palette of the theme.
     */
    colors: ThemeColors;
    /**
     * Defines the background properties of the theme.
     */
    background?: ThemeBackground;
    /**
     * Defines the source for icons used in the theme.
     */
    icons?: ThemeIcons;
    /**
     * Defines the source for fonts used in the theme.
     */
    fonts?: ThemeFonts;
}

/**
 * Defines the color palette of the theme.
 */
interface ThemeColors {
    /**
     * Contains the raw color values. Keys are color names (e.g., "RED_400"), and values are either hex color codes or references to other raw colors.
     */
    raw: ThemeRawColors;
    /**
     * Defines semantic color mappings. These colors are used to represent UI elements based on their meaning.
     */
    semantic: ThemeSemanticColors;
    /**
     * Allows targeting specific UI elements with custom color overrides without directly modifying the raw or semantic color definitions.
     * This is useful for applying specific styles to certain components without affecting the global color palette.
     */
    targeted?: ThemeTargetedColors;
}

/**
 * Represents an object containing raw color values.
 */
type ThemeRawColors = {
    [key: string]: string;
};

/**
 * Represents the structure of a semantic color definition.
 */
interface ThemeSemanticColor {
    /**
     * The actual color value. It can be a direct hex color (in #RRGGBBAA format) or a reference to a color in the `raw` object (starting with "$").
     */
    value: string;
    /**
     * Optional opacity value for the color, ranging from 0 to 1. This property is ignored if the `value` is a direct hex color.
     */
    opacity?: number;
}

/**
 * Represents an object containing semantic color mappings.
 */
type ThemeSemanticColors = {
    [key: string]: ThemeSemanticColor;
};

/**
 * Represents the structure for targeted color overrides.
 */
type ThemeTargetedColors = {
    [key: string]: unknown;
};

/**
 * Defines the background properties of the theme.
 */
interface ThemeBackground {
    /**
     * URL of the background image.
     */
    image?: string;
    /**
     * Blur intensity of the background image, typically a value between 0 and 1.
     */
    blur?: number;
    /**
     * Opacity of the background, ranging from 0 to 1.
     */
    opacity?: number;
}

/**
 * Defines the source for icons used in the theme.
 */
interface ThemeIcons {
    /**
     * URL or path to the icon pack.
     */
    source?: string;
}

/**
 * Defines the source for fonts used in the theme.
 */
interface ThemeFonts {
    /**
     * URL or path to the font pack.
     */
    source?: string;
}
