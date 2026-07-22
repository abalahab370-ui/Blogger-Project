const mongoose = require("mongoose");
const Schema = mongoose.Schema ;

const usersSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        roles: {
            user: {
                type: Number,
                default: 2001
            },

            admin: {
                type: Number
            }
        },

        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", usersSchema);