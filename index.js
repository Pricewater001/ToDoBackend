
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
require('dotenv').config();

// Apollo Server
// typeDefs: GraphQL Type Definitions
// resolvers: How to resolve Queries/Mutations
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req })
});


// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connection successful');
    // Start the ApolloServer and listen for incoming requests
    return server.listen({ port: 5000 });
  })
  .then((res) => {
    console.log(`Server is running at ${res.url}`);
  });
