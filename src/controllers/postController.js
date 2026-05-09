// src/controllers/postController.js
const supabase = require('../services/supabaseClient');

exports.createPost = async (req, res) => {
    const { categoryId, title, content } = req.body;

    if (!categoryId || !title) {
        return res.status(400).json({ error: 'Missing categoryId or title' });
    }

    const { data, error } = await supabase
        .from('posts')
        .insert([{ 
            category_id: categoryId, 
            title: title, 
            content: content, 
            author_id: 'Anon' // Hardcoded for now
        }])
        .select();

    if (error) {
        console.error("Supabase Error:", error);
        return res.status(500).json({ error: 'Database error while excavating.' });
    }

    res.status(201).json({ message: 'Discovery logged successfully', post: data[0] });
};

exports.getPosts = async (req, res) => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase Error:", error);
        return res.status(500).json({ error: 'Failed to retrieve records.' });
    }

    // Convert from DB snake_case to frontend camelCase
    const formattedPosts = data.map(post => ({
        id: post.id,
        categoryId: post.category_id,
        title: post.title,
        content: post.content,
        authorId: post.author_id,
        createdAt: post.created_at,
        likes: post.likes,
        comments: post.comments
    }));

    res.status(200).json({ posts: formattedPosts });
};