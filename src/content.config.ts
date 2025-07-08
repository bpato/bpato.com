// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';
import { parse as parseToml } from "toml";

// 2. Import loader(s)
import { glob, file } from 'astro/loaders';

// 3. Define your collection(s)
const projects = defineCollection({ 
    loader: glob({ pattern: "**/*.md", base: "./src/data/projects" }),
    schema: z.object({
        title: z.string(),
        image: z.string(),
        description: z.string(),
        website: z.string().url().nullable(),
        source: z.string().url().nullable(),
        tech: z.array(z.string())
    })
});

const badges = defineCollection({
    loader: file("./src/data/badges.toml", { parser: (text) => parseToml(text).badges }),
    schema: z.object({
        imageUrl: z.string().url()
    })
})

// 4. Export a single `collections` object to register your collection(s)
export const collections = { projects, badges };