import { supabase } from "./supabaseClient.js";

/** @typedef {{ id: string, title: string, body: string, createdAt: string }} Announcement */

function mapRow(row) {
    return {
        id: row.id,
        title: row.title,
        body: row.body,
        createdAt: row.created_at
    };
    }

    export async function listAnnouncements() {
    const { data, error } = await supabase
        .from("announcements")
        .select("id, title, body, created_at")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapRow);
    }

    export async function createAnnouncement({ title, body, authorId = null }) {
    const { data, error } = await supabase
        .from("announcements")
        .insert([{ title, body, author_id: authorId }])
        .select("id, title, body, created_at")
        .single();

    if (error) throw new Error(error.message);
    return mapRow(data);
    }

    export async function getAnnouncement(id) {
    const { data, error } = await supabase
        .from("announcements")
        .select("id, title, body, created_at")
        .eq("id", id)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapRow(data) : null;
    }

    export async function updateAnnouncement(id, patch) {
    const { data, error } = await supabase
        .from("announcements")
        .update({
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.body !== undefined ? { body: patch.body } : {})
        })
        .eq("id", id)
        .select("id, title, body, created_at")
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapRow(data) : null;
    }

    export async function deleteAnnouncement(id) {
    const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);
    return true;
}