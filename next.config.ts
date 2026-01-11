// next.config.ts
import nextra from "nextra";

export default nextra({
  // Nextra options
  // themeConfig: "./theme.config.tsx",
})({
  // Next.js options
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  images: {
    unoptimized: false,
  },
});
