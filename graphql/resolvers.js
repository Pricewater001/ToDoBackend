const Task = require('../models/Task');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const secretKey = process.env.SECRET_KEY;

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username },
    secretKey,
    { expiresIn: '24h' }
  );
};


module.exports = {
  Query: {
// Getting a task by ID 
async task(_, { ID }, context) {
  
  auth(context);

  
  const task = await Task.findOne({ _id: ID, createdBy: context.userId }).populate('createdBy');

 
  if (!task) {
    throw new Error('Task not found or unauthorized to access.');
  }

  
  const user = await User.findById(context.userId);

  
  if (!user) {
    throw new Error('User not found.');
  }

 
  user.token = context.token;

  
  task.createdBy = user;

  return task;
},
  
// Getting tasks for a user 
async getUserTasks(_, __, context) {
  auth(context);

  const tasks = await Task.find({ createdBy: context.userId }).populate('createdBy');

  
  if (!tasks) {
    throw new Error('Tasks not found.');
  }


  const user = await User.findById(context.userId).select('-password');

  
  if (!user) {
    throw new Error('User not found.');
  }

 
  const tasksWithCreatedBy = tasks.map((task) => {
    return {
      ...task.toObject(),
      createdBy: {
        ...user.toObject(),
        id: user._id.toString(),
        token: context.token,
      },
    };
  });

  const filteredTasks = tasksWithCreatedBy.map(({ _id, name, description, createdAt, isDone, createdBy }) => ({
    taskId: _id.toString(),
    name,
    description,
    createdAt,
    isDone,
    createdBy,
  }));
 

  return filteredTasks;
}

    
  },
  Mutation: {
    // Create task 
    async createTask(_, { taskInput: { name, description } }, context) {
      auth(context);
    
      const userId = context.userId;
      console.log('User ID:', userId);
      console.log('User Token:', context.token);
    
      const createdTask = new Task({
        name: name,
        description: description,
        createdAt: new Date().toISOString(),
        isDone: false,
        createdBy: userId,
      });
    
      const res = await createdTask.save();
    
    
      const user = await User.findById(userId);
    
      
      createdTask.createdBy = user;
    
      console.log('Created Task:', createdTask);
    
      return createdTask;
    },
    


    // Delete task
    async deleteTask(_, { ID }, context) {
      auth(context);
      
      const task = await Task.findOne({ _id: ID, createdBy: context.userId });
      if (!task) {
        throw new Error('Task not found or unauthorized to delete.');
      }
      
      const wasDeleted = (await Task.deleteOne({ _id: ID })).deletedCount;
     
      return wasDeleted;
    },
    
    // Edit task
    async editTask(_, { ID, taskInput: { name, description, isDone } }, context) {
      auth(context);
      
      const task = await Task.findOne({ _id: ID, createdBy: context.userId });
      if (!task) {
        throw new Error('Task not found or unauthorized to edit.');
      }
      
      const wasEdited = (await Task.updateOne(
        { _id: ID },
        { name, description, isDone }
      )).modifiedCount;
      
      return wasEdited;
    },

// Rigester with email 
    async register(_, { registerInput: { username, email, password, confirmPassword } }) {
   

    
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        throw new Error('Username or email is already taken.');
      }

    
      const newUser = new User({
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    
      const res = await newUser.save();

      
      const token = generateToken(res);

     
      return {
        id: res.id,
        ...res._doc,
        password: null,
        token,
      };
    },

    //Login and generate the token 
    async login(_, { loginInput: { email, password } }) {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found.');
      }
    
      if (user.password !== password) {
        throw new Error('Invalid password.');
      }
    
      const token = generateToken(user);
    
      return {
        id: user.id,
        ...user._doc,
        password: null,
        token,
      };
    },
  },
};
