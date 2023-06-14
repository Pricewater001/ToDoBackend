const Task = require('../models/Task');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { populate } = require('../models/Task');



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

    // Getting task by ID
    async task(_, { ID }, context) {
      auth(context);
      const task = await Task.findOne({ _id: ID, createdBy: context.userId }).populate('createdBy');
      if (!task) {
        throw new Error('Task not found or unauthorized to access.');
      }
      return task;
    },
    
  },
  Mutation: {
    // Getting user tasks 
    async createTask(_, { taskInput: { name, description } }, context) {
      auth(context);
    
      const userId = context.userId;
      console.log('User ID:', userId);
    
      const createdTask = new Task({
        name: name,
        description: description,
        createdAt: new Date().toISOString(),
        isDone: false,
        createdBy: userId,
      });
    
      const res = await createdTask.save();
    
      return res;
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
