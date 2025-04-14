import { IDebitCard, IUserDoc } from "../utils/interface.util";

export interface VerifyCardDTO{
    user: IUserDoc
    card: IDebitCard,
    reference: string
}
