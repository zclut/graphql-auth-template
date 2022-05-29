import { AuthenticationError, gql, UserInputError } from 'apollo-server'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from './models/user.js'

export const typeDefs = gql`
    type User {
        id: ID!
        username: String!
        password: String!
    }

    type UserInfo {
        id: ID!
        username: String!
    }

    type Token {
        value: String!
    }

    type Query {
        me: UserInfo
    }

    type Mutation {
        register(username: String!, password: String!): Token
        login(username: String!, password: String!): Token
    }
`

export const resolvers = {
    Query: {
        me: (_, args, { currentUser }) => {
            if (!currentUser) throw new AuthenticationError('Not authenticated')

            return currentUser
        }
    },
    Mutation: {
        register: async (_, args) => {
            const { username, password } = args            

            try {
                let user = await User.findOne({ username })

                if (user) throw new UserInputError('Username already exists')

                // Create the new user
                user = new User({ username, password })
                const salt = await bcryptjs.genSalt(10);
                user.password = await bcryptjs.hash(password, salt)
                await user.save();

                const payload = {
                    username: user.username,
                    password: user.password
                }

                return {
                    value: jwt.sign(payload, process.env.JWT_SECRET)
                }

            } catch (error) {
                throw new Error(error)
            }
        },
        login: async (_, args) => {
            const { username, password } = args;

            try {
                let user = await User.findOne({ username })

                const isMatch = await bcryptjs.compare(password, user.password);
                if (!user || !isMatch) throw new UserInputError('Wrong credentials')

                const payload = {
                    username: user.username,
                    password: user.password
                }

                return {
                    value: jwt.sign(payload, process.env.JWT_SECRET)
                }

            } catch (error) {
                throw new Error(error)
            }
        }
    }
}