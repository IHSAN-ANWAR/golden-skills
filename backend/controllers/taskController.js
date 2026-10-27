import Task from '../models/Task.js';
import User from '../models/User.js';

// Get all tasks (Admin)
export const getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalTasks = await Task.countDocuments();
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('specificUsers', 'fullName username email');
    
    const totalPages = Math.ceil(totalTasks / limit);
    
    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      count: tasks.length,
      total: totalTasks,
      page: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      tasks: tasks
    });
    
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching tasks",
      error: error.message
    });
  }
};

// Get tasks for mobile app (for specific user or all users)
export const getTasksForUser = async (req, res) => {
  try {
    const userId = req.user?.id; // From auth middleware
    
    // Get tasks assigned to all users or specifically to this user
    const tasks = await Task.find({
      status: 'active',
      $or: [
        { assignedTo: 'all' },
        { assignedTo: 'specific', specificUsers: userId }
      ]
    }).sort({ createdAt: -1 }).lean();
    
    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      count: tasks.length,
      tasks: tasks
    });
    
  } catch (error) {
    console.error("Fetch user tasks error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching tasks",
      error: error.message
    });
  }
};

// Create new task (Admin)
export const createTask = async (req, res) => {
  try {
    const { title, description, category, points, deadline, tutorialVideoUrl, assignedTo, specificUsers } = req.body;

    // Validation
    if (!title || !description || !category || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category, and deadline are required"
      });
    }

    // Validate specific users if assignedTo is 'specific'
    if (assignedTo === 'specific' && (!specificUsers || specificUsers.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one user for specific assignment"
      });
    }

    // Create new task
    const newTask = new Task({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      points: points || 10,
      deadline: new Date(deadline),
      tutorialVideoUrl: tutorialVideoUrl?.trim() || '', // ← Optional YouTube link
      assignedTo: assignedTo || 'all',
      specificUsers: assignedTo === 'specific' ? specificUsers : [],
      createdBy: 'admin'
    });

    await newTask.save();

    // Populate user details if specific assignment
    if (assignedTo === 'specific') {
      await newTask.populate('specificUsers', 'fullName username email');
    }

    return res.status(201).json({
      success: true,
      message: "Task created successfully!",
      task: newTask
    });

  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during task creation",
      error: error.message
    });
  }
};

// Update task (Admin)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, points, deadline, tutorialVideoUrl, status, assignedTo, specificUsers } = req.body;

    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Update fields
    if (title) task.title = title.trim();
    if (description) task.description = description.trim();
    if (category) task.category = category.trim();
    if (points) task.points = points;
    if (deadline) task.deadline = new Date(deadline);
    if (tutorialVideoUrl !== undefined) task.tutorialVideoUrl = tutorialVideoUrl.trim(); // ← Optional update
    if (status) task.status = status;
    if (assignedTo) task.assignedTo = assignedTo;
    if (assignedTo === 'specific' && specificUsers) {
      task.specificUsers = specificUsers;
    } else if (assignedTo === 'all') {
      task.specificUsers = [];
    }
    
    task.updatedAt = Date.now();

    await task.save();
    await task.populate('specificUsers', 'fullName username email');

    return res.status(200).json({
      success: true,
      message: "Task updated successfully!",
      task: task
    });

  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during task update",
      error: error.message
    });
  }
};

// Delete task (Admin)
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully!"
    });

  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during task deletion",
      error: error.message
    });
  }
};

// Get task statistics (Admin)
export const getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const activeTasks = await Task.countDocuments({ status: 'active' });
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const expiredTasks = await Task.countDocuments({ status: 'expired' });

    return res.status(200).json({
      success: true,
      stats: {
        total: totalTasks,
        active: activeTasks,
        completed: completedTasks,
        expired: expiredTasks
      }
    });

  } catch (error) {
    console.error("Get task stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching task statistics",
      error: error.message
    });
  }
};
