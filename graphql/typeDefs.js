const { gql } = require('apollo-server');

module.exports = gql`
type Task {
  _id: ID!
  name: String
  description: String
  createdAt: String
  isDone: Boolean
  
  createdBy: User! 
}


  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String!
    updatedAt: String!
    token: String!
  }

  input TaskInput {
    name: String
    description: String
    isDone: Boolean
  }
  

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  input LoginInput {
  email: String!
  password: String!
}

  type Query {
    task(ID: ID!): Task!
    
    getUserTasks: [Task]!
  }

  type Mutation {
    createTask(taskInput: TaskInput): Task!
    deleteTask(ID: ID!): Boolean
    editTask(ID: ID!, taskInput: TaskInput): Boolean
    register(registerInput: RegisterInput): User!
    login(loginInput: LoginInput): User!
  }
`;
