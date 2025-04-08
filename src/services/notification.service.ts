import admin from "firebase-admin";
import { IResult, ITransactionDoc } from "../utils/interface.util";
import User from "../models/User.model";

class NotificationService {
  constructor() {
    const serviceAccount = require("../../path/to/serviceAccountKey.json");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  /**
   * @name sendPushNotification
   * @description Sends a push notification to the user's device
   * @param deviceToken - Device token of the recipient
   * @param title - Notification title
   * @param body - Notification body
   * @param imageUrl - URL of the image to display in the notification (optional)
   * @param clickAction - URL to open when the notification is clicked (optional)
   * @returns {Promise<IResult>}
   */
  public async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    imageUrl?: string,
    clickAction?: string
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
        imageUrl,
      },
      token: deviceToken,
      webpush: {
        notification: {
          click_action: clickAction,
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      result.message = `Push notification sent successfully to ${deviceToken}`;
      result.data = response;
      return result;
    } catch (error) {
      console.error("Failed to send push notification:", error);
      result.error = true;
      result.message = "Failed to send push notification.";
      result.code = 500;
      return result;
    }
  }

  /**
   * @name sendNewSermonNotification
   * @description Sends a push notification for a new sermon
   * @param deviceToken - Device token of the recipient
   * @param sermonTitle - Title of the new sermon
   * @param imageUrl - URL of the image to display in the notification (optional)
   * @param clickAction - URL to open when the notification is clicked (optional)
   * @returns {Promise<IResult>}
   */
  public async sendNewSermonNotification(
    deviceToken: string,
    sermonTitle: string,
    imageUrl?: string,
    clickAction?: string
  ): Promise<IResult> {
    const title = "New Sermon Available!";
    const body = `Check out our latest sermon: ${sermonTitle}`;
    return await this.sendPushNotification(deviceToken, title, body, imageUrl, clickAction);
  }

  /**
   * @name sendNewPlaylistNotification
   * @description Sends a push notification for a new playlist
   * @param deviceToken - Device token of the recipient
   * @param playlistTitle - Title of the new playlist
   * @param imageUrl - URL of the image to display in the notification (optional)
   * @param clickAction - URL to open when the notification is clicked (optional)
   * @returns {Promise<IResult>}
   */
  public async sendNewPlaylistNotification(
    deviceToken: string,
    playlistTitle: string,
    imageUrl?: string,
    clickAction?: string
  ): Promise<IResult> {
    const title = "New Playlist Added!";
    const body = `Explore our new playlist: ${playlistTitle}`;
    return await this.sendPushNotification(deviceToken, title, body, imageUrl, clickAction);
  }

  /**
   * @name sendGeneralNotification
   * @description Sends a general push notification
   * @param deviceToken - Device token of the recipient
   * @param notificationTitle - Title of the notification
   * @param notificationBody - Body of the notification
   * @param imageUrl - URL of the image to display in the notification (optional)
   * @param clickAction - URL to open when the notification is clicked (optional)
   * @returns {Promise<IResult>}
   */
  public async sendGeneralNotification(
    deviceToken: string,
    notificationTitle: string,
    notificationBody: string,
    imageUrl?: string,
    clickAction?: string
  ): Promise<IResult> {
    return await this.sendPushNotification(
      deviceToken,
      notificationTitle,
      notificationBody,
      imageUrl,
      clickAction
    );
  }

    /**
   * @name sendRefundNotification
   * @description Sends a push notification for a processed refund
   * @param {ITransactionDoc} transaction - Transaction details including refund information
   * @returns {Promise<IResult>} Result object with status and message
   */
    public async sendRefundNotification(transaction: ITransactionDoc): Promise<IResult> {
      try {
        const user = await User.findById(transaction.user);
        if (!user || !user.deviceToken) {
          return {
            error: true,
            message: "User device token not found",
            code: 404,
            data: {}
          };
        }
  
        const title = "Refund Processed";
        const body = `Your refund of ${transaction.currency} ${transaction.amount} has been processed successfully.`;
        const clickAction = `${process.env.FRONTEND_URL}/transactions/${transaction.reference}`;
  
        return await this.sendPushNotification(
          user.deviceToken.toString(),
          title,
          body,
          undefined,
          clickAction
        );
      } catch (error) {
        return {
          error: true,
          message: "Failed to send refund notification",
          code: 500,
          data: error
        };
      }
    }
}

export default new NotificationService();


/**
 * 
 * send push notification for new sermon
 * send push notification for new playlist
 * send push notification for recommended sermon
 * send push notification for recommended playlist
 * 
 * 
 */