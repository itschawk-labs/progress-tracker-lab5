
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// MongoDB project schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  manager: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  completion: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  }
}, { timestamps: true });

projectSchema.path('dueDate').validate(function (value) {
  return !this.startDate || value >= this.startDate;
}, 'Due date must be on or after start date');

const Project = mongoose.model('Project', projectSchema);

// CREATE
app.post('/api/projects', async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ ALL
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ ONE
app.get('/api/projects/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE
app.put('/api/projects/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const existing = await Project.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const fields = [
      'name', 'description', 'manager', 'startDate',
      'dueDate', 'status', 'priority', 'completion'
    ];

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        existing[field] = req.body[field];
      }
    }

    await existing.save();
    res.json(existing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE
app.delete('/api/projects/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Connect before starting the API
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Express server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
