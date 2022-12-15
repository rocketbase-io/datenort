import axios from "axios";
import fileType from "file-type";
import {ValidationError} from "@tsed/common";
import {FileInfo} from "../interfaces/FileInfo";

export async function getBufferFromUrl(url: string) : Promise<Buffer> {
    return new Promise((resolve, reject) => {
        axios.get(url, {responseType: "arraybuffer"}).then(res => {
            resolve(res.data);
        }).catch(err => {
            reject(err);
        })
    })
}

export async function getFileFromUrl(url: string) {
    let fileBuffer = await getBufferFromUrl(url);
    let fileName = url.split('/').filter(s=> s != "").reverse()[0];
    let mimeType = (await fileType.fromBuffer(fileBuffer))?.mime;
    let fileExt = (await fileType.fromBuffer(fileBuffer))?.ext;
    if(!mimeType) throw new ValidationError("File type of downloaded url couldn't be determined", ["url: " + url]);

    let fileInfo : FileInfo = {
        buffer: fileBuffer,
        size: fileBuffer.toString().length,
        mimetype: mimeType,
        originalname: `${fileName}.${fileExt}`,
        referenceUrl: url
    };

    return fileInfo;
}