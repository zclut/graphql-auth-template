import mongoose from 'mongoose'
import { config } from 'dotenv'

config()

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('Error connection to MongoDB', err.message))
