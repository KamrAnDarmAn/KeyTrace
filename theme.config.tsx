import React from "react";

const config = {
    logo: <strong>Syntax Convertor</strong>,
    project: {
        link: "https://github.com/your-username/syntax_convertor"
    },
    // Sidebar groups and links for the docs
    sidebar: {
        // root sidebar
        "/": [
            {
                title: "Number Systems",
                items: [
                    { title: "Binary", link: "/docs/binary" },
                    { title: "Octal", link: "/docs/octal" },
                    { title: "Decimal", link: "/docs/decimal" },
                    { title: "Hexadecimal", link: "/docs/hex" }
                ]
            },
            {
                title: "Data Formats",
                items: [
                    { title: "JSON", link: "/docs/json" },
                    { title: "XML", link: "/docs/xml" },
                    { title: "YAML", link: "/docs/yaml" },
                    { title: "TOML", link: "/docs/toml" },
                    { title: "CSV", link: "/docs/csv" }
                ]
            }
        ]
    }
};

export default config;
