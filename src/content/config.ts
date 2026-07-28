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
    url: z.string().url().optional(),
    source: z.string(),
    date: z.coerce.date(),
  }),
});

const news = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    author: z.string(),
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
  }),
});

const permanences = defineCollection({
  type: "content",
  schema: z
    .object({
      date: z.coerce.date(),
      repairCafe: z.string().optional(),
      title: z.string().optional(),
      location: z.string().optional(),
      summary: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.repairCafe) return;

      if (!data.title) {
        ctx.addIssue({
          code: "custom",
          message: "Le titre est obligatoire sans lien vers un Repair Café.",
          path: ["title"],
        });
      }

      if (!data.location) {
        ctx.addIssue({
          code: "custom",
          message: "Le lieu est obligatoire sans lien vers un Repair Café.",
          path: ["location"],
        });
      }
    }),
});

export const collections = { events, faq, press, news, resources, photos, locations, permanences };
