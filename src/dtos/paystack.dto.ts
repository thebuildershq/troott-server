import { IDebitCard } from "../utils/interface.util";

export interface VerifyCardDTO{
    card: IDebitCard,
    reference: string
}
