import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { readFile } from 'node:fs/promises';
import { GraphQLScalarType } from 'graphql';
import { connectToDb, getDb,} from './db.js'

let db;

const app = express();

app.use(express.json());

// app.get('/api/issues', (req, res) => {
//     console.log('New Request');
//     const metaData = {totalCount: issues.length};
//     res.json({
//         "metaData": metaData,
//         "records": issues
//     });
// });

// app.post('/api/issues', (req, res) => {
//   console.log('req.body',req.body);
//   const newIssue = req.body;
//   newIssue.id = issues.length + 1;
//   newIssue.status = 'New';
//   newIssue.created = new Date();
//   issues.push(newIssue);
//   console.log('res.json', newIssue);
//   res.json(newIssue);
// });

const GraphQlDateResolver = new GraphQLScalarType({
  name: 'GraphQlDate',
  description: 'A GraphQl Date Type',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const newDate = new Date(value);
    return isNaN(newDate) ? undefined : newDate;
  }
});

const typeDefs = await readFile('./schema.graphql', 'utf8');

const issueList = async () => {
  const issue = db.collection('issues').find({}).toArray();
  return issue
}

const resolvers = {
  Query: {
    name: () => 'Erick',
    issueList: issueList
  },
  Mutation: {
    sendName: (_root, {name}) => {
      return name + '!' 
    },
    issueAdd: (_root, {issue}) => {
      issue.id = issues.length + 1;
      issue.status = 'New';
      issue.created = new Date();
      issues.push(issue);
      return issue;
    }
  },
  GraphQlDate: GraphQlDateResolver
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
});

await apolloServer.start();

app.use('/graphql', expressMiddleware(apolloServer));

connectToDb((url, err) => {
  if (!err) {
    app.listen(5001, () => {
        console.log('Server started on port 5001');
        console.log('GraphQl Server started on http://localhost:5001/graphql');
        console.log('Connected to MongoDb at ', url);
    });
    db = getDb();
  }
});
