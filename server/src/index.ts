import { ApolloServer } from 'apollo-server-express';
import { schema } from './schema';

 export const apollo = new ApolloServer({
    // These will be defined for both new or existing servers
    schema:schema,
/*     context: ({ req }) => {
      // get the user token from the headers
      const token = req.headers.authorization || '';
     
      // try to retrieve a user with the token
      const user = getUser(token);
     
      // add the user to the context
      return { user };
    }, */
   
    subscriptions: {
      
      onConnect: (connectionParams, webSocket) => {
      
        //if (connectionParams.authToken) {
          return true//validateToken(connectionParams.authToken)
          //  .then(findUser(connectionParams.authToken))
         //   .then(user => {
          //    return {
          //      currentUser: user,
          //    };
         //   });
       // }
  
        //throw new Error('Missing auth token!');
      },
    },
  });

 