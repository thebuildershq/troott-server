import { renderFile } from "ejs";
import appRootUrl from "app-root-path";
import appRootPath from "app-root-path";
import { SendEmailDTO, SendgridEmailDataDTO } from "../dtos/email.dto";
import sgMail from "@sendgrid/mail";
import transporter from "../utils/sendgrid.util";
import { EEmailDriver, EEmailTemplate, EVerifyOTP } from "../utils/enums.util";
import { IResult } from "../utils/interface.util";

const BASE_FOLDER: string = `${appRootPath.path}/src`;

class OTPService {
  public async sendEmailWithSendgrid(
    data: SendgridEmailDataDTO
  ): Promise<void> {
    const options = {
      auth: {
        apiKey: process.env.SENDGRID_API_KEY as string,
      },
    };
    const appUrlSource = `${appRootUrl.path}/src`;

    renderFile(
      `${appUrlSource}/views/emails/ejs/${data.template}.ejs`,
      {
        preheaderText: data.preheaderText,
        emailTitle: data.emailTitle,
        emailSalute: data.emailSalute,
        bodyOne: data.bodyOne,
        bodyTwo: data.bodyTwo,
        bodyThree: data.bodyThree,
        loginEmail: data.loginEmail,
        loginPassword: data.loginPassword,
        buttonUrl: data.buttonUrl,
        buttonText: data.buttonText,
        eventTitle: data.eventTitle,
        eventDescription: data.eventDescription,
        startDate: data.startDate,
        endDate: data.endDate,
        email: data.email,
        password: data.password,
        code: data.code,
      },

      {},

      async (error, html) => {
        try {
          const mailData = {
            to: data.email,
            from: `${
              data.fromName ? data.fromName : process.env.EMAIL_FROM_NAME
            } <${process.env.EMAIL_FROM_EMAIL}>`,
            subject: data.emailTitle,
            text: "email",
            html: html,
          };

          //send mail
          await transporter.send(options, mailData);
        } catch (error) {
          console.log(error);
          return error;
        }
      }
    );
  }

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  }

  /**
   * @name sendOTPEmail
   * @description Send OTP email to a user
   * @param { SendEmailDTO } config
   * @returns IResult
   */
  public async sendOTPEmail(config: SendEmailDTO): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const { driver, user, code, options, template } = config;

      // Default values
      let buttonText: string = (options && options.buttonText) || "Verify";
      let _template = template ? template : EEmailTemplate.VERIFY_EMAIL;
      let salute =
        options && options.salute
          ? options.salute
          : ", Let's verify your account";
      let url = options && options.buttonUrl ? options.buttonUrl : "";
      let fromName = process.env.EMAIL_FROM_NAME as string;

      let bodyOne =
        options && options.bodyOne
          ? options.bodyOne
          : `We have received your request to make a security-sensitive changes to your troott account.`;
      let bodyTwo =
        options && options.bodyTwo
          ? options.bodyTwo
          : `To ensure the security of your account, we have generated a one-time password (OTP) for verification.`;
      let bodyThree =
        options && options.bodyThree
          ? options.bodyThree
          : `Note that this OTP expires in 10 minutes.`;

      let title: string =
        options && options.subject
          ? options.subject
          : options && options.otpType
          ? this.switchOTPTitle(options.otpType)
          : "Verify Account";

      // Prepare email content
      const emailContent = {
        email: user.email,
        code: code,
        fromName: fromName,
        template: _template,
        emailSalute: salute,
        emailTitle: title,
        preheaderText: title.toLowerCase(),
        bodyOne: bodyOne,
        bodyTwo: bodyTwo,
        bodyThree: bodyThree,
        buttonText: buttonText,
        buttonUrl: `${url}`,
      };

      // Send email using SendGrid if the driver is sendgrid
      if (driver === EEmailDriver.SENDGRID) {
        await this.sendEmailWithSendgrid(emailContent);
        result.message = `OTP sent successfully to ${emailContent.email}`;
        result.data = emailContent;
        return result;
      } else {
        result.error = true;
        result.message = "Invalid email driver.";
        result.code = 400;
      }
    } catch (error) {
      console.log("Error sending OTP email:", error);
      result.error = true;
      result.message = "Failed to send OTP email.";
      result.code = 500;
    }

    return result;
  }

  /**
   * @name switchOTPTitle
   * @description Switch {type} to determine OTP email title
   * @param {VerifyOTPType} type
   * @returns {string} string
   */
  private switchOTPTitle(type: EVerifyOTP): string {
    let result: string;

    switch (type) {
      case EVerifyOTP.REGISTER:
        result = "Verify Your Account";
        break;
      case EVerifyOTP.LOGIN:
        result = "Verify Your Email";
        break;
      case EVerifyOTP.CHANGE_PASSWORD:
        result = "Password Change Code";
        break;
      case EVerifyOTP.PASSWORD_RESET:
        result = "Password Reset Code";
        break;
      case EVerifyOTP.VERIFY:
        result = "Verify your troott account";
        break;
      default:
        result = "Verify Account";
        break;
    }

    return result;
  }
}

export default new OTPService();
