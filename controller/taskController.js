const task = require("../model/taskModel");

const taskController = async (req, res) => {
    try {
        const { title, description, image, deadline, status, assignedTo } = req.body;
        
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        if (title.length < 3 || title.length > 100) {
            return res.status(400).json({ message: "Title should be between 3 and 100 characters" });
        }

        if (!description) {
            return res.status(400).json({ message: "Description is required" });
        }
        if (description.length < 10 || description.length > 500) {
            return res.status(400).json({ message: "Description should be between 10 and 500 characters" });
        }
        if (!assignedTo) {
            return res.status(400).json({ message: "Assigned to is required" });
        }
        if (deadline) {
            const inputDeadline = new Date(deadline);
            const currentTime = new Date();

            if (inputDeadline < currentTime) {
                return res.status(400).json({ 
                    message: "Deadline cannot be in the past! Please select a future date and time." 
                });
            }
        }
        const loggedInUser = req.user._id;

        const newTask = new task({
            title,
            description,
            image,
            creator: loggedInUser,
            assignedTo, 
            deadline,
            status: status || "todo"
        });

        const savedTask = await newTask.save();
        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: savedTask
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        const loggedInUserId = req.user._id;

        const existingTask = await task.findById(taskId);
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (existingTask.assignedTo.toString() !== loggedInUserId.toString()) {
            return res.status(403).json({ 
                message: "Access Denied!." 
            });
        }

        existingTask.status = status;
        await existingTask.save();

        return res.status(200).json({ 
            success: true,
            message: "Task status updated successfully", 
            data: existingTask 
        });
        
    } catch (error) {
        console.error("Status update error:", error);
        if (!res.headersSent) {
            return res.status(500).json({ message: error.message });
        }
    }
};

module.exports = {taskController,updateTaskStatus};