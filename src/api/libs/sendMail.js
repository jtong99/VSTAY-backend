const sgMail = require("@sendgrid/mail");
const httpStatus = require("http-status");

const APIError = require("../utils/APIErr");

const { domain, ports, services } = require("../../config/vars");

sgMail.setApiKey(services.sendgrid.key);

const { isInEnum } = require("../helpers/enum");

const sendMail = async ({
  to,
  subject,
  text = "Hello plain world!",
  html = "<p>Hello HTML world!</p>",
}) => {
  const message = {
    from: "tmduc0908@gmail.com",
    to,
    subject: "Vstay | " + subject,
    text,
    html,
  };

  const result = await sgMail.send(message);

  if (result.statusCode < 200 && result.statusCode >= 300) {
    throw new APIError({
      message: "Unexpected error occured when sending email, please try again.",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }

  return {
    from: message.from,
    to: message.to,
    subject: message.subject,
    message: "OK",
    status: true,
  };
};

const emailVerification = async ({
  to,
  signupApi,
  name,
  language = "en",
  token,
}) => {
  const languageEnum = {
    vi: "vi",
    en: "en",
  };
  if (!isInEnum(language, languageEnum)) {
    language = "en";
  }

  const email = to;
  const subject = "📨 Email verification";
  const text = `Hey ${name}, you're almost ready to enjoy Knowllipop.
    Please click the big button below to verify your email account.
    ${signupApi}?email=${email}&name=${name}&token=${token}`;

  const content = {
    EMAIL_NAME: {
      en: "Email Verification",
      vi: "Email xác thực",
    },
    INTRODUCTION: {
      en: `Hey <strong>${name}</strong>, you're almost ready to enjoy Vstay.`,
      vi: `Xin chào <strong>${name}</strong>, chỉ còn một bước nữa thôi là bạn sẽ là một phần của Vstay rồi.`,
    },
    CTA: {
      en: "Please click the big button below to verify your email address.",
      vi:
        "Vui lòng bạn nhấn nút bên dưới để bọn mình tiến hành xác thực email của bạn nhé.",
    },
    CTA_TEXT: {
      en: "Verify email address",
      vi: "Xác thực email",
    },
    EXPIRED_CAUTION: {
      en:
        "This verification link will be expired after <strong>24 hours</strong>. After that, you have to send another request to verify your email.",
      vi:
        "Bạn cần phải xác thực email của mình trong vòng <strong>24</strong> giờ vì đường link này sẽ hết hạn sau 24 đấy nhé.",
    },
    EMAIL_AUTHOR: {
      en:
        '<p>Email is sent by <a href="https://Vstay.com" style="text-decoration: none;">Vstay</a></p>',
      vi:
        '<p>Email được gửi bởi <a href="https://Vstay.com" style="text-decoration: none;">Vstay</a></p>',
    },
  };

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/css/all.min.css">
  </head>
  
  <body style="padding: 15px;background-color: #eee;margin: 0!important;">
      <div class="wrapper" style="width: 100%;table-layout: fixed;">
          <div class="wrapper-inner" style="width: 100%;background-color: #eee;max-width: 670px;margin: 0 auto;">
              <table class="heading" width="100%" style="border-spacing: 0;font-family: sans-serif;color: #727f80;">
                  <tr>
                      <td align="center">
                          <div class="section" style="text-align: center;">
                              <table width="100%" style="border-spacing: 0;font-family: sans-serif;color: #727f80;">
                                  <tr>
                                      <td>
                                          <img src="https://drive.google.com/uc?id=1Scs1hOF2oG_Cu7fGY_UjbEdXBmPFfV8y" class="logo" style="border: 0;max-width: 200px!important;">

                                          </td>
                                  </tr>
                              </table>
                          </div>
                      
                      </td>
                  </tr>
              </table>
              <div style="width: 100%;max-width: 610px;Margin: 0 auto; background-color: rgb(244,71,107); border-radius: 6px 6px 0px 0px;
              margin-top: 25px;text-align: center;">
              <icon class="far fa-envelope" style="color: white;margin: 15px auto;font-size: 3rem;border: 0;-moz-osx-font-smoothing: grayscale;-webkit-font-smoothing: antialiased;display: inline-block;font-style: normal;font-variant: normal;text-rendering: auto;line-height: 1;font-weight: 400;font-family: &quot;Font Awesome 5 Free&quot;;"></icon>
              </div>
              <table class="text-table" style="box-shadow: 1px 1px 5px rgba(0,0,0,0.1);border: 1px solid rgba(0,0,0,0.1);border-spacing: 0;font-family: sans-serif;color: #727f80;width: 100%;max-width: 610px;margin: 0 auto;background-color: #fff;">
                  <tr class="one-column">
                      <td class="inner-td" style="padding: 10px;font-size: 16px;line-height: 20px;text-align: justify;">
                          <p
                              class="h1"
                              style="font-weight: 600;line-height: 45px;margin: 15px 0 5px 0;color: #4A4A4A;text-align: center!important;font-size: 25px!important;"
                              >${content.EMAIL_NAME[language]}
                          </p>
                          <p style="margin-bottom: 0px;text-align: center;margin-top: 20px;">${content.INTRODUCTION[language]}</p>
                          <p style="margin-top:5px;text-align: center;">${content.CTA[language]}</p>
                          <p style="text-align: center;">
                              <a
                                  class="verify-button"
                                  style="cursor: pointer;text-decoration: none;background-color: #EEBBC3;border: 0;box-sizing: border-box;color: #232946;display: inline-block;font-size: 0.9rem;font-weight: 400;line-height: 40px;padding: 0px 0px 0px 0px;text-align: center;vertical-align: middle;min-width: 244px;margin-top: 20px;margin-bottom: 10px;"
                                  href="${signupApi}?name=${name}&token=${token}"
                                  >${content.CTA_TEXT[language]}
                              </a>
                          </p>
                          <p style="text-align: center;font-size: 13px;">${content.EXPIRED_CAUTION[language]}</p>
                      </td>
                  </tr>
              </table>

              <div class="section" style="text-align: center;margin-top: 20px;font-size: 13px;margin-bottom: 0px;">
                  <table width="100%" style="border-spacing: 0;font-family: sans-serif;color: #727f80;">
                      <tr>
                          <td>
                              <div>
                                  <img class="icon-logo" src="https://drive.google.com/uc?id=1FdA2NB40KcsBMVIw3xZd895uQEcykzhr" alt="icon logo" style="border: 0;max-width: 30px;">
                                  ${content.EMAIL_AUTHOR[language]}
                                  <p>&copy; 2020 Vstay&reg;, All Rights Reserved.</p>
                                  </div>
                          </td>
                      </tr>
                  </table>
                  
              </div>
          </div>
      </div>
  </body>
</html>
    `;

  try {
    const result = await sendMail({
      to,
      subject,
      text,
      html,
    });
    return result;
  } catch (error) {
    logger.error("Error sending verification email: " + JSON.stringify(error));
    throw new APIError({
      message: "Error sending verification email",
      status: 500,
      stack: error.stack,
    });
  }
};

module.exports = {
  sendVerificationEmail: emailVerification,
};
