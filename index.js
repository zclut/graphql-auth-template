import { ApolloServer } from 'apollo-server'
import { typeDefs, resolvers } from './schema.js'
import jwt from 'jsonwebtoken'
import './config/db.js'
import User from './models/user.js'

// Server
const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const token = auth.substring(7)
            const { username } = jwt.verify(token, process.env.JWT_SECRET)
            const currentUser = await User.findOne({ username })
            return { currentUser }
        }
    }
})

// Run server
server.listen().then(({ url }) => {
    console.log(`Server is running on ${url}`)
})