import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs' // nextra-theme-blog or your custom theme

// Merge components
export function useMDXComponents(components: any) {
    // Get the default MDX components inside the function to avoid early initialization
    const themeComponents = getThemeComponents()
    return {
        ...themeComponents,
        ...components
    }
}
