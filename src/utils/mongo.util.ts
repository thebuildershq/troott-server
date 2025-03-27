import { Types } from 'mongoose';
declare class Mongo {
    constructor();
    stringToMongoId(id: string): Types.ObjectId;
    mongoIdToString(id: any): string;
}
declare const _default: Mongo;
export default _default;