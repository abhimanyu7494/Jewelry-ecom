const cloudinary = require("../config/cloudinary");

const uploadImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }


    const allowedMimeTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);

    if (
      !allowedMimeTypes.has(
        req.file.mimetype
      )
    ) {
      return res.status(400).json({
        message:
          "Only JPG, PNG and WEBP images are allowed",
      });
    }


    const uploadResult =
      await new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder: "tejas-store",
                resource_type: "image",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          stream.end(req.file.buffer);
        }
      );

    return res.status(200).json({
      message:
        "Image uploaded successfully",

      imageUrl:
        uploadResult.secure_url,

      publicId:
        uploadResult.public_id,
    });
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error
    );

    return res.status(500).json({
      message: "Image upload failed",
    });
  }
};

module.exports = {
  uploadImage,
};
