jest.mock("nodemailer", () => ({ createTransport: jest.fn() }));
const nodemailer = require("nodemailer");

test("SMTP mode sends verification mail through the declared transport", async () => {
  const previous = { delivery: process.env.EMAIL_DELIVERY, host: process.env.SMTP_HOST };
  process.env.EMAIL_DELIVERY = "smtp";
  process.env.SMTP_HOST = "smtp.fixture.invalid";
  const sendMail = jest.fn().mockResolvedValue({ messageId: "fixture" });
  nodemailer.createTransport.mockReturnValue({ sendMail });
  let mailer;
  jest.isolateModules(() => { mailer = require("../../../utils/mailer"); });
  try {
    await mailer.sendEmailVerificationEmail("fixture@example.com", "original-token");
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "fixture@example.com", text: expect.stringContaining("original-token") }));
  } finally {
    process.env.EMAIL_DELIVERY = previous.delivery;
    if (previous.host === undefined) delete process.env.SMTP_HOST; else process.env.SMTP_HOST = previous.host;
  }
});
