import fs from "fs";
import ejs, { renderFile } from "ejs";
import appRootUrl from "app-root-path";
import appRootPath from "app-root-path";
import { SendEmailDTO, SendgridEmailDataDTO } from "../dtos/emaitl.dto";
import sgMail from "@sendgrid/mail";
import transporter from "../utils/sendgrid.util";
import { EEmailDriver, EVerifyOTP } from "../utils/enums.util";
import { IResult } from "../utils/interface.util";

const BASE_FOLDER: string = `${appRootPath.path}/src`;

class EmailService {
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

  public async sendInviteEmail(
    email: string,
    initiativeName: string,
    creatorEmail: string,
    inviteLink: string,
    userName: string
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/invite.ejs`;

      if (!fs.existsSync(templatePath)) {
        throw new Error(`EJS file not found at ${templatePath}`);
      }

      const emailHtml = await ejs.renderFile(templatePath, {
        initiativeName,
        creatorEmail,
        inviteLink,
        userName,
      });

      const message = {
        to: email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: `You are invited to join ${initiativeName} on troott`,
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = `Email sent successfully to ${email}`;
      result.data = sendEmail;
      return result;
    } catch (error) {
      console.log("Failed to send invite email:", error);
      result.error = true;
      result.message = "Failed to send invite email.";
      result.code = 500;
      return result;
    }
  }

  public async sendUserWelcomeEmail() {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    return result;
  }

  public async sendPreacherWelcomeEmail() {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    return result;
  }

  public async sendCreatorWelcomeEmail() {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    return result;
  }

  public async sendStaffrWelcomeEmail() {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    return result;
  }

  public async sendPasswordChangeNotificationEmail() {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    return result;
  }

  public async sendPasswordResetNotificationEmail() {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    return result;
  }


  public async userInviteEmail() {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    return result;
  }

  public async staffInviteEmail() {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    return result;
  }
}

export default new EmailService();

/***
 * send creator verification status in review
 * send creator verification status accepted
 * send creator verification status rejection
 *
 * send admin login invite (email, password)
 *
 * send listener welcome email
 * send creator welcome email
 * send admin welcome email
 *
 * send listener | creator | admin password reset email
 *
 * send new sermon notification to listeners
 * send new playlist notification to listeners
 *
 *
 */
