import { defineCollection, z } from "astro:content";

const events = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    location: z.string(),
    summary: z.string(),
  }),
});

const faq = defineCollection({
  type: "content",
  schema: z.object({
    question: z.string(),
    order: z.number().default(0),
  }),
});

const press = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    source: z.string(),
    date: z.coerce.date(),
  }),
});

const resources = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    file: z.string(),
    type: z.string().default("PDF"),
    order: z.number().default(0),
  }),
});

const photos = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    image: z.string(),
    alt: z.string(),
    caption: z.string(),
    date: z.coerce.date(),
    featured: z.boolean().default(false),
  }),
});

const locations = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
    hours: z.string(),
    link: z.string().url().optional(),
    more_details: z.boolean().default(false),
  }),
});

export const collections = { events, faq, press, resources, photos, locations };
