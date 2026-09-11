import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import type { ElementId } from "@/lib/philosophy";

export type TagRow = { id: number; name: string };
export type MoodRow = {
  id: number;
  tagId: number;
  tagName: string;
  day: string;
  score: number;
  element: ElementId | null;
  note: string;
  loggedAt: string;
};

const nameSchema = z
  .string()
  .trim()
  .min(1)
  .max(24)
  .regex(/^[\p{L}\p{N} .'_-]+$/u, "Use letters, numbers, spaces, or . _ - '");

const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const elementSchema = z.enum(["water", "wood", "fire", "earth", "metal"]).nullish();

function mapMood(row: {
  id: number;
  tag_id: number;
  tag_name: string;
  day: string;
  score: number;
  element: string | null;
  note: string;
  logged_at: string | Date;
}): MoodRow {
  return {
    id: Number(row.id),
    tagId: Number(row.tag_id),
    tagName: row.tag_name,
    day: String(row.day).slice(0, 10),
    score: Number(row.score),
    element: (row.element as ElementId | null) ?? null,
    note: row.note ?? "",
    loggedAt: typeof row.logged_at === "string" ? row.logged_at : new Date(row.logged_at).toISOString(),
  };
}

export const listTags = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ id: number; name: string }>`
    select id, name from tags order by lower(name) asc
  `;
  return rows.map((r) => ({ id: Number(r.id), name: r.name }));
});

export const createTag = createServerFn({ method: "POST" })
  .validator(z.object({ name: nameSchema }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const existing = await sql<{ id: number; name: string }>`
      select id, name from tags where lower(name) = lower(${data.name}) limit 1
    `;
    if (existing[0]) return { id: Number(existing[0].id), name: existing[0].name };
    const inserted = await sql<{ id: number; name: string }>`
      insert into tags (name) values (${data.name}) returning id, name
    `;
    const row = inserted[0];
    if (!row) throw new Error("Could not create tag");
    return { id: Number(row.id), name: row.name };
  });

export const logMood = createServerFn({ method: "POST" })
  .validator(
    z.object({
      tagId: z.number().int().positive(),
      day: daySchema,
      score: z.number().int().min(1).max(10),
      element: elementSchema,
      note: z.string().trim().max(200),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const tag = await sql<{ id: number; name: string }>`
      select id, name from tags where id = ${data.tagId} limit 1
    `;
    if (!tag[0]) throw new Error("Unknown tag");
    const rows = await sql.query<{
      id: number;
      tag_id: number;
      day: string;
      score: number;
      element: string | null;
      note: string;
      logged_at: string;
    }>(
      `insert into moods (tag_id, day, score, element, note)
       values ($1, $2::date, $3, $4, $5)
       returning id, tag_id, day, score, element, note, logged_at`,
      [data.tagId, data.day, data.score, data.element ?? null, data.note],
    );
    const row = rows[0];
    if (!row) throw new Error("Could not save reading");
    return mapMood({ ...row, tag_name: tag[0].name });
  });

export const listMoodsForDay = createServerFn({ method: "GET" })
  .validator(z.object({ day: daySchema }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      tag_id: number;
      tag_name: string;
      day: string;
      score: number;
      element: string | null;
      note: string;
      logged_at: string;
    }>`
      select m.id, m.tag_id, t.name as tag_name, m.day, m.score, m.element, m.note, m.logged_at
      from moods m
      join tags t on t.id = m.tag_id
      where m.day = ${data.day}::date
      order by m.logged_at asc
    `;
    return rows.map(mapMood);
  });

export const listArchive = createServerFn({ method: "GET" })
  .validator(z.object({ tagId: z.number().int().positive().optional() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = data.tagId
      ? await sql<{
          id: number;
          tag_id: number;
          tag_name: string;
          day: string;
          score: number;
          element: string | null;
          note: string;
          logged_at: string;
        }>`
          select m.id, m.tag_id, t.name as tag_name, m.day, m.score, m.element, m.note, m.logged_at
          from moods m
          join tags t on t.id = m.tag_id
          where m.tag_id = ${data.tagId}
          order by m.logged_at desc
          limit 80
        `
      : await sql<{
          id: number;
          tag_id: number;
          tag_name: string;
          day: string;
          score: number;
          element: string | null;
          note: string;
          logged_at: string;
        }>`
          select m.id, m.tag_id, t.name as tag_name, m.day, m.score, m.element, m.note, m.logged_at
          from moods m
          join tags t on t.id = m.tag_id
          order by m.logged_at desc
          limit 80
        `;
    return rows.map(mapMood);
  });
