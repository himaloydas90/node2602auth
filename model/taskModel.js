const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true 
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    creator: {
        type: String
    },
    deadline: {
        type: Date 
    },
    status: {
    type: String,
    enum: ["backlog", "todo", "in-progress", "in-review", "completed", "on-hold", "cancelled"],
    default: "todo"
},
    assignedTo: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);