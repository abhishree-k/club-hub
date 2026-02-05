const { BlogPost, Comment, User } = require('../models');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await BlogPost.findAll({
            include: [
                { model: User, attributes: ['firstName', 'lastName'] },
                { model: Comment, attributes: ['id'] } // Just to get count if needed, or fetch all
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ['firstName', 'lastName'] },
                {
                    model: Comment,
                    include: [{ model: User, attributes: ['firstName', 'lastName'] }],
                    order: [['createdAt', 'ASC']]
                }
            ]
        });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { title, content, tags, imageUrl, category } = req.body;
        const user = await User.findByPk(req.userId);

        const post = await BlogPost.create({
            title,
            content,
            tags,
            imageUrl,
            category,
            UserId: req.userId,
            authorName: user ? `${user.firstName} ${user.lastName}` : 'Unknown'
        });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const user = await User.findByPk(req.userId);

        const comment = await Comment.create({
            content,
            BlogPostId: req.params.id,
            UserId: req.userId,
            authorName: user ? `${user.firstName} ${user.lastName}` : 'Unknown'
        });
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Simple increment for now
        post.likesCount += 1;
        await post.save();

        res.json({ likesCount: post.likesCount });
    } catch (error) {
        res.status(500).json({ message: 'Error liking post', error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (req.userRole !== 'admin' && post.UserId !== req.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await post.destroy();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};
