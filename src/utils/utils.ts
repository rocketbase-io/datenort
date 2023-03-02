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

export async function getFileFromUrl(url: string): Promise<FileInfo> {
    const fileBuffer = await getBufferFromUrl(url);
    const fileName = url.split('/').filter(s=> s != "").reverse()[0];
    const fileExt = (await fileType.fromBuffer(fileBuffer))?.ext;
    const mimeType = (await fileType.fromBuffer(fileBuffer))?.mime;
    if(!mimeType) throw new ValidationError("File type of downloaded url couldn't be determined", ["url: " + url]);

    return  {
        buffer: fileBuffer,
        size: fileBuffer.toString().length,
        mimetype: mimeType,
        originalname: `${fileName.endsWith(fileExt??'') ? fileName : (fileName+'.'+fileExt)}`,
        referenceUrl: url
    };
}
