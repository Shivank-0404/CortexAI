import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDir = path.resolve("./temp");

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, {

        recursive: true

    });

}

// file.originalname is fully attacker-controlled (it's just the filename
// the client's multipart form declares). Building a path from it directly
// — e.g. "../../../../etc/cron.d/evil" — lets a malicious upload escape
// uploadDir. Keep only a safe extension from it and generate the rest
// ourselves. Exported standalone so it can be unit-tested directly.
export const generateSafeFilename = (originalname = "") => {

    const ext = path
        .extname(originalname)
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "");

    const safeExt = /^\.(pdf|png|jpe?g|gif|webp)$/.test(ext) ? ext : "";

    return `${Date.now()}-${crypto.randomUUID()}${safeExt}`;

};

const storage = multer.diskStorage({

    destination(req,file,cb){

        cb(null,uploadDir);

    },

    filename(req,file,cb){

        cb(

            null,

            generateSafeFilename(file.originalname)

        );

    }

});

const fileFilter=(req,file,cb)=>{

    if(

        file.mimetype==="application/pdf" ||

        file.mimetype.startsWith("image/")

    ){

        cb(null,true);

    }

    else{

        cb(

            new Error(

                "Only PDF and Images are allowed."

            )

        );

    }

};

export default multer({

    storage,

    fileFilter,

    limits:{

        fileSize:20*1024*1024

    }

});