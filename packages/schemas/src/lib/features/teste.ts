import z from "zod";

export const testeSchema = z.object({
    name: z.string()
});

export type Teste = z.infer<typeof testeSchema>;