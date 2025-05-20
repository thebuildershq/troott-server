import { EEmailDriver, EEmailTemplate, EUserType, EVerifyOTP } from "../utils/enums.util"
import { IUserDoc } from "../utils/interface.util"

export interface SendgridEmailDataDTO{
    email: string,
    fromName: string,
    template: string,
    preheaderText?: string,
    code?: string,
    emailTitle: string,
    emailSalute: string,
    bodyOne: string,
    bodyTwo?: string,
    bodyThree?: string,
    loginEmail?: string,
    loginPassword?: string,
    password?: string,
    buttonUrl?: string,
    buttonText?: string,
    eventTitle?: string,
    eventDescription?: string,
    startDate?: string,
    endDate?: string
}

export interface SendEmailDTO{
    user: IUserDoc,
    driver: EEmailDriver,
    template?: string,
    code?: string,
    metadata?:any,
    options?: {
        subject?: string,
        salute?: string,
        buttonUrl?: string,
        buttonText?: string,
        emailBody?: string,
        emailBodies?: Array<string>,
        bodyOne?: string,
        bodyTwo?: string,
        bodyThree?: string,
        otpType?: EVerifyOTP,
        status?: string
    }
}

export interface sendUserEmailDTO {
    driver: EEmailDriver;
    user: any;
    template: EEmailTemplate;
    options: {
      temporaryPassword: string;
      invitedBy: string;
      userType: EUserType;
      loginUrl?: string;
    };
}