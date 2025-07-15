import { Router } from "express";

const webhookRouter = Router({ mergeParams: true });

webhookRouter.post("/email", async (req, res) => {
  const event = req.body;

  try {
    const messageId = event.message_id || event.sg_message_id;

    // You should verify the signature here (SendGrid/MailerSend)

    // await EmailLog.updateOne(
    //   { messageId },
    //   {
    //     status: event.event || event.type,
    //     deliveredAt: new Date(),
    //   },
    //   { upsert: true }
    // );

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error", err);
    res.sendStatus(500);
  }
});

export default webhookRouter;
