const { gql } = require('apollo-server');

module.exports = gql`
type Task {
  name: String
  description: String
  createdAt: String
  isDone: Int
  
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
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  type Query {
    task(ID: ID!): Task!
    getTasks(amount: Int): [Task]
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
