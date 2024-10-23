import {Document, ObjectId} from 'mongoose'


export interface IRoleDoc extends Document {

    name: string,
    description: string,
    slug: string,
    user: Array<ObjectId | any>

    createdAt: string,
    updatedAt: string,
    _id: ObjectId,
    id: ObjectId

    getAll(): Array<IRoleDoc>
    findByName(name: string): IRoleDoc | null
}