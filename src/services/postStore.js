import { supabase } from "./supabaseClient.js";

function mapRow(row) {
    return {
        id: row.id,
        categoryId: row.category_id,
        title: row.title,
        content: row.content,
        authorId: row.author_id,
        createdAt: row.created_at,
        likes: row.likes,
        comments: row.comments
    };
}

export async function listPosts() {
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapRow);
}

export async function createPost({ categoryId, title, content, authorId = "Kurt" }) {
    const { data, error } = await supabase
        .from("posts")
        .insert([{ 
            category_id: categoryId, 
            title: title, 
            content: content, 
            author_id: authorId 
        }])
        .select("*")
        .single();

    if (error) throw new Error(error.message);
    return mapRow(data);
}

export async function getPost(id) {
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapRow(data) : null;
}

export async function updatePost(id, patch) {
    const { data, error } = await supabase
        .from("posts")
        .update({
            ...(patch.categoryId !== undefined ? { category_id: patch.categoryId } : {}),
            ...(patch.title !== undefined ? { title: patch.title } : {}),
            ...(patch.content !== undefined ? { content: patch.content } : {})
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapRow(data) : null;
}

export async function deletePost(id) {
    const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);
    return true;
}