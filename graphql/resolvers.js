const Task = require('../models/Task');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');


const secretKey = process.env.SECRET_KEY;

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username },
    secretKey,
    { expiresIn: '1h' }
  );
};

module.exports = {
  Query: {
    async task(_, { ID }) {
      return await Task.findById(ID);
    },
    async getTasks(_, { amount }) {
      return await Task.find().sort({ createdAt: -1 }).limit(amount);
    },
    // should retrieve all the tasks related to user
    async getUserTasks(_, __, context) {
      auth(context);
      return await Task.find({ createdBy: context.userId }).sort({ createdAt: -1 });
    },
    
  },
  Mutation: {
    // should add user id to the response  
    async createTask(_, { taskInput: { name, description } }, context) {
     auth(context);
    
    
      const userId = context.userId; 
    
      const createdTask = new Task({
        name: name,
        description: description,
        createdAt: new Date().toISOString(),
        isDone: 0,
        
        userId: userId, 
      });
    
      const res = await createdTask.save();
    
      return {
        id: res.id,
        ...res._doc,
        userId: res.userId, 
      };
    },
    
    
    
    
    
    
    async deleteTask(_, { ID }, context) {
      
      auth(context);
      const wasDeleted = (await Task.deleteOne({ _id: ID })).deletedCount;
     
      return wasDeleted;
    },
    async editTask(_, { ID, taskInput: { name, description } }, context) {
     
       auth(context);
      const wasEdited = (await Task.updateOne(
        { _id: ID },
        { name: name, description: description }
      )).modifiedCount;
      // 1 if something is modified, 0 if nothing is modified
      return wasEdited;
    },
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
    async login(_, { loginInput: { username, password } }) {
     
      const user = await User.findOne({ username });
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
