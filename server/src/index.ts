import { ApolloServer } from 'apollo-server-express';
import { schema } from './schema';
import { mkdir } from 'fs';
mkdir('/data/mxBox/DB',{recursive:true,mode:0x777},()=>{})
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
    playground:false,
    subscriptions: {
      
      onConnect: (connectionParams, webSocket, context) => {
        console.log('onConnect:',connectionParams)
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

 