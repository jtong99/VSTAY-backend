const httpStatus = require("http-status");
const validator = require("validator");
const _ = require("lodash");
const {
  includeSpecialChar,
  includeLowerChar,
  includeUpperChar,
  includeNumberChar,
} = require("./base.validation");

module.exports.validateUpdateCurrentUserInput = (req, res, next) => {
  try {
    const errors = [];

    /**
     * Disallow users to modify restricted field
     * @param name This field is not editable in this function scope
     * @param email This field is not editable in this function scope
     * @param password This field is not editable in this function scope
     * @param status This field is not editable in this function scope
     * @param role This field is not editable in this function scope
     * @param avatar
     * @param about
     * @param skills
     * @param headline
     * @param language
     * @param facebook
     * @param linkedin
     * @param youtube
     */

    /**
     * Check email field validation
     * @param email String
     * @case email field is not editable
     */
    if (req.body.email || req.body.email === "") {
      errors.push(notEditable("email"));
    }

    /**
     * Check status field validation
     * @param status String
     * @case status field is not editable
     */
    if (req.body.status || req.body.status === "") {
      errors.push(notEditable("status"));
    }

    /**
     * Check role field validation
     * @param role String
     * @case role field is not editable
     */
    if (req.body.role || req.body.role === "") {
      errors.push(notEditable("role"));
    }

    /**
     * Check name field validation
     * @param name String
     * @case name field is not editable
     */
    if (req.body.name || req.body.name === "") {
      errors.push(notEditable("name"));
    }

    const about = req.body.about ? req.body.about : " ";
    const headline = req.body.headline ? req.body.headline : " ";
    const language = req.body.language ? req.body.language : " ";
    const facebook = req.body.facebook
      ? req.body.facebook
      : "https://www.facebook.com/";
    const linkedin = req.body.linkedin
      ? req.body.linkedin
      : "https://www.linkedin.com/in/";
    const youtube = req.body.youtube
      ? req.body.youtube
      : "https://www.youtube.com/channel/";

    let avatar = " ";

    if (req.file !== undefined) {
      if (req.file.filename) {
        avatar = req.file.filename;
      }
    }

    /**
     * Check about field validation
     * @param {String} about
     * @case about field length must be lower than 100 characters
     */
    if (!validator.isEmpty(about)) {
      if (!validator.isLength(about, { max: 100 })) {
        errors.push({
          field: "about",
          location: "body",
          message:
            "About field length must be lower than or equal 100 characters",
        });
      }
    }

    /**
     * Check headline field validation
     * @param {String} headline
     * @case headline field length must be lower than 20 characters
     */
    if (!validator.isEmpty(headline)) {
      if (!validator.isLength(headline, { max: 20 })) {
        errors.push({
          field: "headline",
          location: "body",
          message:
            "Headline field length must be lower than or equal 20 characters",
        });
      }
    }

    /**
     * Check language field validation
     * @param {String} language
     * @case language field length must be lower than 10 characters
     */
    if (!validator.isEmpty(language)) {
      if (!validator.isLength(language, { max: 10 })) {
        errors.push({
          field: "language",
          location: "body",
          message:
            "Language field length must be lower than or equal 10 characters",
        });
      }
    }

    /**
     * Check youtube field validation
     * @param {String} youtube
     * @case youtube field length must be lower than 10 characters
     */
    if (!validator.isEmpty(youtube)) {
      // const youtubeProfilePattern = /^(https?\:\/\/)?(youtube\.com|www\.youtube\.com|youtu\.?be)\/.+$/;
      if (!validator.isURL(youtube)) {
        errors.push({
          field: "youtube",
          location: "body",
          message: "youtube field length must be URL",
        });
      }
      // else if (!validator.matches(youtube, youtubeProfilePattern)) {
      //     errors.push(
      //         {
      //             field: 'youtube',
      //             location: 'body',
      //             message: 'Invalid youtube channel link',
      //         },
      //     );
      // }
    }

    /**
     * Check linkedin field validation
     * @param {String} linkedin
     * @case linkedin field length must be lower than 10 characters
     */
    if (!validator.isEmpty(linkedin)) {
      // const linkedinProfilePattern = /(https?:\/\/)?(www\.)?\.linkedin(\.com)\/in\//;
      if (!validator.isURL(linkedin)) {
        errors.push({
          field: "linkedin",
          location: "body",
          message: "Linkedin field length must be URL",
        });
      }
      // else if (!validator.matches(linkedin, linkedinProfilePattern)) {
      //     errors.push(
      //         {
      //             field: 'linkedin',
      //             location: 'body',
      //             message: 'Invalid linkedin profile link',
      //         },
      //     );
      // }
    }

    /**
     * Check facebook field validation
     * @param {String} facebook
     * @case facebook field length must be lower than 10 characters
     */
    if (!validator.isEmpty(facebook)) {
      // const facebookProfilePattern =
      //     /(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:profile.php\?id=(?=\d.*))?([\w\-]*)?/;
      if (!validator.isURL(facebook)) {
        errors.push({
          field: "facebook",
          location: "body",
          message: "Facebook field length must be URL",
        });
      }
      // else if (!validator.matches(facebook, facebookProfilePattern)) {
      //     errors.push(
      //         {
      //             field: 'facebook',
      //             location: 'body',
      //             message: 'Invalid facebook profile link',
      //         },
      //     );
      // }
    }

    // /**
    //  * Check avatar field validation
    //  * @param {String} avatar
    //  * @case avatar field extention mus be .jpg|.jpeg|.png
    //  */
    // if (!validator.isEmpty(avatar.trim())) {
    //   const validUploadedImage = /\.(|jpg|jpeg|png)$/;
    //   if (!validator.matches(avatar.toLowerCase(), validUploadedImage)) {
    //     errors.push({
    //       field: "avatar",
    //       location: "body",
    //       message: "Avatar image extention is not valid",
    //     });
    //   }
    // }

    if (errors.length) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          code: httpStatus.UNPROCESSABLE_ENTITY,
          message: "Bad data validation",
          errors: errors,
        })
        .end();
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
module.exports.validateUpdateUserPasswordInput = (req, res, next) => {
  try {
    const errors = [];

    const currentPassword = req.body.currentPassword
      ? req.body.currentPassword
      : " ";
    const newPassword = req.body.newPassword ? req.body.newPassword : " ";
    const confirmPassword = req.body.confirmPassword
      ? req.body.confirmPassword
      : " ";

    /**
     * Check currentPassword field validation
     * @param currentPassword String
     * @case Cannot be empty
     */
    if (validator.isEmpty(currentPassword.trim())) {
      errors.push({
        field: "currentPassword",
        location: "body",
        message: "currentPassword field cannot be empty",
      });
    }

    /**
     * Check newPassword field validation
     * @param newPassword String
     * @case Cannot be empty
     * @case Length is between 5 - 15 characters
     * @case Must contain upper characters
     * @case Must contain lower characters
     * @case Must contain number characters
     * @case Must not contain special characters
     */
    if (validator.isEmpty(newPassword.trim())) {
      errors.push({
        field: "newPassword",
        location: "body",
        message: "new password field cannot be empty",
      });
    } else {
      if (
        !validator.isLength(newPassword, {
          min: 5,
          max: 15,
        })
      ) {
        errors.push({
          field: "newPassword",
          location: "body",
          message: "new password field must be between 5 - 15 characters",
        });
      }

      if (!includeSpecialChar(newPassword)) {
        errors.push({
          field: "newPassword",
          location: "body",
          message:
            "new password field must contain at least 1 symbol character",
        });
      }

      if (!includeUpperChar(newPassword)) {
        errors.push({
          field: "newPassword",
          location: "body",
          message: "new password field must contain upper characters",
        });
      }

      if (!includeLowerChar(newPassword)) {
        errors.push({
          field: "newPassword",
          location: "body",
          message: "new password field must contain lower characters",
        });
      }

      if (!includeNumberChar(newPassword)) {
        errors.push({
          field: "newPassword",
          location: "body",
          message: "new password field must contain number",
        });
      }
    }

    /**
     * Check confirmPassword field validation
     * @param confirmPassword String
     * @case Cannot be empty
     * @case Match newPassword field
     */
    if (validator.isEmpty(confirmPassword.trim())) {
      errors.push({
        field: "confirmPassword",
        location: "body",
        message: "confirmPassword field cannot be empty",
      });
    }

    if (errors.length) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          code: httpStatus.UNPROCESSABLE_ENTITY,
          message: "validation errors",
          errors: errors,
        })
        .end();
    }

    return next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
