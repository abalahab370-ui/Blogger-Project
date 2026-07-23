const mongoose = require ("mongoose") ;
const Schema = mongoose.Schema ;

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Article title is required'],
            trim: true,
            maxlength: [150, 'Title cannot exceed 150 characters']
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
            lowercase: true, // Standardizes search (e.g., "Tech" -> "tech")
            default: 'general'
        },
        content: {
            type: String,
            required: [true, 'Content body cannot be empty']
        },
        author: {
            type: String, // Pinned username of creator (e.g., "alex")
            required: true,
            trim: true
        },
        // --- FUTURE-PROOFING FIELDS ---
        status: {
            type: String,
            enum: ['published', 'draft'],
            default: 'published' // Ready if you add a "Save as Draft" feature later
        },
        views: {
            type: Number,
            default: 0 // Gives you simple engagement analytics down the road
        }
    },
    {
        // Automatically adds `createdAt` and `updatedAt` timestamps
        timestamps: true 
    }
);

// High-speed search index for title and content
postSchema.index({ title: 'text', category: 'text' , author : 'text' });

module.exports = mongoose.model('Post', postSchema);
