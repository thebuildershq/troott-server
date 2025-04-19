import fs from "fs";
import ejs, { renderFile } from "ejs";
import appRootUrl from "app-root-path";
import appRootPath from "app-root-path";
import { SendgridEmailDataDTO, sendUserEmailDTO } from "../dtos/email.dto";
import sgMail from "@sendgrid/mail";
import transporter from "../utils/sendgrid.util";
import { IEmailRequest, IResult, ITransactionDoc } from "../utils/interface.util";
import { EmailQueue } from "./queue.service";
import { EmailPriority, EmailStatus, EmailType, EUserType } from "../utils/enums.util";
import userService from "./user.service";
import User from "../models/User.model";
import { inviteUserDTO } from "../dtos/user.dto";

const BASE_FOLDER: string = `${appRootPath.path}/src`;

class EmailService {
  private emailQueue: EmailQueue;
  private maxRetries: number = 3;
  /**
   * @description Sends an email using Sendgrid API
   * @param {SendgridEmailDataDTO} data - Email data including template and content
   * @returns {Promise<void>}
   */
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
    this.emailQueue = new EmailQueue();
  }

  /**
   * @description Sends an invitation email to join an initiative
   * @param {string} email - Recipient's email address
   * @param {string} initiativeName - Name of the initiative
   * @param {string} creatorEmail - Email of the initiative creator
   * @param {string} inviteLink - Invitation link
   * @param {string} userName - Name of the invited user
   * @returns {Promise<IResult>} Result object with status and message
   */
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

  /**
   * @description Sends an invitation email to join an initiative
   * @param {string} email - Recipient's email address
   * @param {string} initiativeName - Name of the initiative
   * @param {string} creatorEmail - Email of the initiative creator
   * @param {string} inviteLink - Invitation link
   * @param {string} userName - Name of the invited user
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async userInviteEmail(
    email: string,
    userName: string,
    inviteLink: string
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/user-invite.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        userName,
        inviteLink,
        platformName: process.env.APP_NAME,
      });

      const message = {
        to: email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: `Join ${process.env.APP_NAME} - Your Personal Invitation`,
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "User invite email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send user invite email";
      result.code = 500;
    }
    return result;
  }

    /**
   * @description Sends an invitation email to new users with login credentials
   * @param {string} email - User's email address
   * @param {string} userType - User type (staff, preacher, creator, listener)
   * @param {string} tempPassword - Temporary password for initial login
   * @param {string} firstName - User's first name
   * @param {string} lastName - User's last name
   * @returns {Promise<IResult>} Result object with status and message
   */
    public async sendUserInviteEmail(data: sendUserEmailDTO): Promise<IResult> {
      const result: IResult = { error: false, message: "", code: 200, data: {} };
      try {
        const templatePath = `${BASE_FOLDER}/views/emails/ejs/${data.template}.ejs`;
        
        // Determine login URL and template data based on user type
        const loginUrls = {
          [EUserType.STAFF]: '/staff/login',
          [EUserType.PREACHER]: '/preacher/login',
          [EUserType.CREATOR]: '/creator/login',
          [EUserType.LISTENER]: '/login'
        };

        const loginUrl = data.options.loginUrl || 
        `${process.env.FRONTEND_URL}${loginUrls[data.options.userType as keyof typeof loginUrls ] || '/login'}`;

        const emailHtml = await ejs.renderFile(templatePath, {
          userType: data.options.userType,
          email: data.user.email,
          temporaryPassword: data.options.temporaryPassword,
          invitedBy: data.options.invitedBy,
          loginUrl,
        });
  
        const message = {
          to: data.user.email,
          from: process.env.EMAIL_FROM_EMAIL as string,
          subject: `Welcome to ${process.env.APP_NAME}`,
          html: emailHtml,
        };
  
        const sendEmail = await sgMail.send(message);
        result.message = "Invitation email sent successfully";
        result.data = sendEmail;
      } catch (error) {
        result.error = true;
        result.message = "Failed to send invitation email";
        result.code = 500;
      }
      return result;
    }

  /**
   * @description Sends an invitation email to new staff members with login credentials
   * @param {string} email - Staff member's email address
   * @param {string} role - Staff member's assigned role
   * @param {string} tempPassword - Temporary password for initial login
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async staffInviteEmail(
    email: string,
    role: string,
    tempPassword: string
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/staff-invite.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        role,
        email,
        tempPassword,
        loginUrl: `${process.env.FRONTEND_URL}/staff/login`,
      });

      const message = {
        to: email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: `Welcome to ${process.env.APP_NAME} Staff`,
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Staff invite email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send staff invite email";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Sends welcome email to new users
   * @param {any} user - User object containing email and name
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendUserWelcomeEmail(user: any): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/user-welcome.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        userName: user.firstName,
        exploreUrl: `${process.env.FRONTEND_URL}/explore`,
      });

      const message = {
        to: user.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: `Welcome to ${process.env.APP_NAME}!`,
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Welcome email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send welcome email";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Sends welcome email to new preachers
   * @param {any} preacher - Preacher object containing email and name
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendPreacherWelcomeEmail(preacher: any): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/preacher-welcome.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        preacherName: preacher.firstName,
        dashboardUrl: `${process.env.FRONTEND_URL}/preacher/dashboard`,
        guidelineUrl: `${process.env.FRONTEND_URL}/preacher/guidelines`,
      });

      const message = {
        to: preacher.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: `Welcome to ${process.env.APP_NAME} Preacher Community!`,
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Preacher welcome email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send preacher welcome email";
      result.code = 500;
    }
    return result;
  }
  /**
   * @description Sends welcome email to new content creators
   * @param {any} creator - Creator object containing email and name
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendCreatorWelcomeEmail(creator: any): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/creator-welcome.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        creatorName: creator.firstName,
        dashboardUrl: `${process.env.FRONTEND_URL}/creator/dashboard`,
        uploadUrl: `${process.env.FRONTEND_URL}/creator/upload`,
      });

      const message = {
        to: creator.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: `Welcome to ${process.env.APP_NAME} Creator Community!`,
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Creator welcome email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send creator welcome email";
      result.code = 500;
    }
    return result;
  }
  /**
   * @description Sends welcome email to new staff members
   * @param {any} staff - Staff object containing email and role
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendStaffWelcomeEmail(staff: any): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/staff-welcome.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        staffName: staff.firstName,
        role: staff.role,
        adminUrl: `${process.env.FRONTEND_URL}/admin`,
      });

      const message = {
        to: staff.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: `Welcome to ${process.env.APP_NAME} Staff!`,
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Staff welcome email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send staff welcome email";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Notifies user about password change
   * @param {any} user - User object containing email and name
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendPasswordChangeNotificationEmail(
    user: any
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/password-change-notification.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        userName: user.firstName,
        supportEmail: process.env.SUPPORT_EMAIL,
        changeTime: new Date().toLocaleString(),
      });

      const message = {
        to: user.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: "Your Password Has Been Changed",
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Password change notification sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send password change notification";
      result.code = 500;
    }
    return result;
  }
  /**
   * @description Sends password reset link
   * @param {any} user - User object containing email and name
   * @param {string} resetLink - Password reset link
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendPasswordResetNotificationEmail(
    user: any,
    resetLink: string
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/password-reset.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        userName: user.firstName,
        resetLink,
        expiryTime: "1 hour",
        supportEmail: process.env.SUPPORT_EMAIL,
      });

      const message = {
        to: user.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: "Reset Your Password",
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Password reset email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send password reset email";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Sends a subscription confirmation email
   * @param {any} user - User object containing email and name
   * @param {any} plan - Subscription plan details
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendSubscriptionConfirmation(
    user: any,
    plan: any
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/subscription-confirmation.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        userName: user.firstName,
        planName: plan.name,
        startDate: new Date().toLocaleDateString(),
        amount: plan.amount,
      });

      const message = {
        to: user.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: "Welcome to Your Troott Subscription!",
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Subscription confirmation email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send subscription confirmation email";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Sends a trial activation email
   * @param {any} user - User object containing email and name
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendTrialActivation(user: any): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/trial-activation.ejs`;
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // Assuming 14-day trial

      const emailHtml = await ejs.renderFile(templatePath, {
        userName: user.firstName,
        trialEndDate: trialEndDate.toLocaleDateString(),
      });

      const message = {
        to: user.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: "Your Troott Trial Has Begun!",
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Trial activation email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send trial activation email";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Sends personalized sermon recommendations
   * @param {any} user - User object containing email and preferences
   * @param {any[]} sermons - Array of recommended sermons
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendSermonRecommendations(
    user: any,
    sermons: any[]
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/sermon-recommendations.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        userName: user.firstName,
        sermons: sermons,
      });

      const message = {
        to: user.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: "Sermons You Might Like",
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Recommendations email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send recommendations email";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Sends re-engagement email to inactive users
   * @param {any} user - User object containing email and last login
   * @param {any} [offer] - Optional promotional offer details
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendReengagementEmail(user: any, offer?: any): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/reengagement.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        userName: user.firstName,
        offer: offer,
        lastLoginDate: user.lastLoginDate,
      });

      const message = {
        to: user.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: "We Miss You at Troott!",
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Reengagement email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send reengagement email";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Sends promotional offer email
   * @param {any} user - User object containing email and name
   * @param {any} offer - Promotional offer details
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendPromotionalOffer(user: any, offer: any): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/promotional-offer.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        userName: user.firstName,
        offerTitle: offer.title,
        discount: offer.discount,
        validUntil: offer.expiryDate,
        promoCode: offer.code,
        subscribeUrl: `${process.env.FRONTEND_URL}/subscribe?promo=${offer.code}`,
      });

      const message = {
        to: user.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: offer.title,
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Promotional offer email sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send promotional offer";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Announces new feature to multiple users
   * @param {any[]} users - Array of user objects
   * @param {any} feature - New feature details
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendFeatureAnnouncement(
    users: any[],
    feature: any
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/feature-announcement.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        featureName: feature.name,
        featureDescription: feature.description,
        featureImage: feature.imageUrl,
        learnMoreUrl: feature.documentationUrl,
      });

      const messages = users.map((user) => ({
        to: user.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: `New Feature: ${feature.name}`,
        html: emailHtml,
      }));

      const sendEmail = await sgMail.send(messages);
      result.message = "Feature announcement sent successfully";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send feature announcement";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Sends support ticket confirmation
   * @param {any} ticket - Support ticket details
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendSupportTicketConfirmation(ticket: any): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/support-ticket.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        userName: ticket.userName,
        ticketId: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority,
        trackingUrl: `${process.env.FRONTEND_URL}/support/ticket/${ticket.id}`,
      });

      const message = {
        to: ticket.userEmail,
        from: process.env.SUPPORT_EMAIL as string,
        subject: `Support Ticket #${ticket.id} Created`,
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Support ticket confirmation sent";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send support ticket confirmation";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Confirms successful sermon upload to preacher
   * @param {any} preacher - Preacher object containing email and name
   * @param {any} sermon - Uploaded sermon details
   * @returns {Promise<IResult>} Result object with status and message
   */
  public async sendSermonUploadConfirmation(
    preacher: any,
    sermon: any
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const templatePath = `${BASE_FOLDER}/views/emails/ejs/sermon-upload.ejs`;
      const emailHtml = await ejs.renderFile(templatePath, {
        preacherName: preacher.firstName,
        sermonTitle: sermon.title,
        duration: sermon.duration,
        category: sermon.category,
        viewUrl: `${process.env.FRONTEND_URL}/sermons/${sermon.id}`,
        dashboardUrl: `${process.env.FRONTEND_URL}/preacher/dashboard`,
      });

      const message = {
        to: preacher.email,
        from: process.env.EMAIL_FROM_EMAIL as string,
        subject: "Sermon Upload Successful",
        html: emailHtml,
      };

      const sendEmail = await sgMail.send(message);
      result.message = "Sermon upload confirmation sent";
      result.data = sendEmail;
    } catch (error) {
      result.error = true;
      result.message = "Failed to send sermon upload confirmation";
      result.code = 500;
    }
    return result;
  }

  /**
   * @description Process email request following the email algorithm
   * @param {IEmailRequest} request - Email request details
   * @returns {Promise<IResult>} Result object with status and message
   */

  private async tprocessEmailRequest(request: IEmailRequest): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      // 1. Validate request
      await this.validateEmailRequest(request);

      // 2. Queue email based on type
      const priority = this.determineEmailPriority(request.type);
      await this.emailQueue.add(request, priority);

      // 3. Process and send email
      const emailStatus = await this.sendEmail(request);

      // // 4. Track performance
      // await this.emailTracker.trackDelivery({
      //   recipient: request.recipient,
      //   status: emailStatus,
      //   type: request.type
      // });

      result.message = "Email processed successfully";
      result.data = { status: emailStatus };
    } catch (error) {
      result.error = true;
      result.message = "Failed to process email";
      result.code = 500;
    }

    return result;
  }

  /**
   * @description Validate email request parameters
   * @private
   */
  private async validateEmailRequest(request: IEmailRequest): Promise<void> {
    const preferences = await userService.getNotificationPreferences(
      request.recipient
    );

    if (!preferences) {
      throw new Error("User preferences not found");
    }

    if (request.type === EmailType.MARKETING && !preferences.email) {
      throw new Error("User opted out of marketing emails");
    }

    if (!request.subject || !request.content) {
      throw new Error("Missing required email content");
    }
  }

  /**
   * @description Determine email priority based on type
   * @private
   */
  private determineEmailPriority(type: EmailType): EmailPriority {
    switch (type) {
      case EmailType.TRANSACTIONAL:
        return EmailPriority.HIGH;
      case EmailType.MARKETING:
        return EmailPriority.LOW;
      case EmailType.PRODUCT_UPDATE:
        return EmailPriority.MEDIUM;
      default:
        return EmailPriority.MEDIUM;
    }
  }

  /**
   * @description Send email with retry mechanism
   * @private
   */
  private async sendEmail(request: IEmailRequest): Promise<EmailStatus> {
    let attempts = 0;
    let lastError: any;

    while (attempts < this.maxRetries) {
      try {
        const templatePath = `${BASE_FOLDER}/views/emails/ejs/${request.template}.ejs`;
        const emailHtml = await ejs.renderFile(templatePath, request.content);

        const message = {
          to: request.recipient,
          from: process.env.EMAIL_FROM_EMAIL as string,
          subject: request.subject,
          html: emailHtml,
          attachments: request.attachments,
        };

        await sgMail.send({
          to: message.to,
          from: message.from,
          subject: message.subject,
          html: message.html as string,
          attachments: message.attachments,
        });
        return EmailStatus.DELIVERED;
      } catch (error) {
        lastError = error;
        attempts++;
        await this.delay(Math.pow(2, attempts) * 1000); // Exponential backoff
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async ssendPromotionalOffer(user: any, offer: any): Promise<IResult> {
    const emailRequest: IEmailRequest = {
      recipient: user.email,
      subject: offer.title,
      content: {
        userName: user.firstName,
        offerTitle: offer.title,
        discount: offer.discount,
        validUntil: offer.expiryDate,
        promoCode: offer.code,
        subscribeUrl: `${process.env.FRONTEND_URL}/subscribe?promo=${offer.code}`,
      },
      type: EmailType.MARKETING,
      template: "promotional-offer",
    };

    return this.tprocessEmailRequest(emailRequest);
  }

    /**
   * @description Sends refund confirmation email to user
   * @param {ITransactionDoc} transaction - Transaction details including refund information
   * @returns {Promise<IResult>} Result object with status and message
   */
    public async sendRefundConfirmation(transaction: ITransactionDoc): Promise<IResult> {
      const result: IResult = { error: false, message: "", code: 200, data: {} };
      
      try {
        const user = await User.findById(transaction.user);
        const templatePath = `${BASE_FOLDER}/views/emails/ejs/refund-confirmation.ejs`;
        
        const emailHtml = await ejs.renderFile(templatePath, {
          userName: user?.firstName,
          transactionId: transaction.reference,
          amount: transaction.amount,
          currency: transaction.currency,
          reason: transaction.reason,
          refundDate: new Date().toLocaleDateString(),
          supportEmail: process.env.SUPPORT_EMAIL,
          helpUrl: `${process.env.FRONTEND_URL}/help/refunds`
        });
  
        const message = {
          to: user?.email,
          from: process.env.EMAIL_FROM_EMAIL as string,
          subject: "Your Refund Has Been Processed",
          html: emailHtml,
        };
  
        const sendEmail = await sgMail.send(message);
        result.message = "Refund confirmation email sent successfully";
        result.data = sendEmail;
      } catch (error) {
        result.error = true;
        result.message = "Failed to send refund confirmation email";
        result.code = 500;
      }
      
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
