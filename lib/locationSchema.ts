import { z } from 'zod';

export const LocationSchema = z.object({
  id: z.string().uuid(),
  name_en: z.string(),
  name_ja: z.string(),
  name_zh: z.string(),
  coords: z.object({ lat: z.number(), lng: z.number() }),
  category: z.enum(['food', 'culture', 'nature', 'nightlife']),
  subcategory: z.string(),
  description: z.object({ en: z.string(), ja: z.string(), zh: z.string() }),
  photos: z.array(z.string().url()),
  averageCost: z.number(),
  seasonalRating: z.object({
    spring: z.number(),
    summer: z.number(),
    fall: z.number(),
    winter: z.number(),
  }),
  cherryBlossomRating: z.number().min(0).max(5).nullable(),
});

export type Location = z.infer<typeof LocationSchema>;

export const LocationsArraySchema = z.array(LocationSchema);
