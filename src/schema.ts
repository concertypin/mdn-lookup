import z from "zod";

export const MdnDocumentSchema = z.object({
    mdn_url: z.string(),
    score: z.number(),
    title: z.string(),
    locale: z.string(),
    slug: z.string(),
    popularity: z.number(),
    summary: z.string(),
    highlight: z.object({
        body: z.array(z.string()),
        title: z.array(z.string()),
    }),
});
export const MdnSearchResponseSchema = z.object({
    documents: z.array(MdnDocumentSchema),
});
