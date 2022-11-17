import {PlatformMulterFile, ValidationError} from "@tsed/common";
import {PrismaClient, Prisma} from '@prisma/client'
import {randomInt} from "crypto";
import getColors from "get-image-colors";
import sizeOf from "image-size"

const prisma = new PrismaClient()

import * as blurhash from "blurhash";
import { createCanvas, loadImage, Image } from 'canvas';

const includeAll = { meta: { include: { colorPalette: true, resolution: true }}};

const getImageData = (image: Image) => {
    const canvas = createCanvas(image.width, image.height)
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    return context.getImageData(0, 0, image.width, image.height)
}

export async function findAssetById(id : string) : Promise<any> {
    return await prisma.asset.findUnique({
        where: {
            id: id,
        },
        include: includeAll
    })
}

export async function findAllAssets(page : number, pageSize : number) : Promise<any> {
    return await prisma.asset.findMany({
        skip: pageSize*page,
        take: pageSize,
        include: includeAll
    });
}

export async function uploadAsset(file : PlatformMulterFile) : Promise<Object> {

    let isImage = file.mimetype.startsWith('image');
    let imageDimensions : any;
    let imageColors : string[] = ["undefined" , "undefined", "undefined"];
    let imageBlurhash : string = "";

    if(isImage) {
        imageDimensions = sizeOf(file.buffer);

        await getColors(file.buffer, file.mimetype).then(colors => {
            imageColors = colors.map(colors => colors.hex());
        }).catch(error => {
            //TODO: If it cant get the color palette it returns 400. But maybe it should just not give a color palette.
            throw new ValidationError("Couldn't get color palette. Image type is possibly no supported.");
        })

        const image = await loadImage(file.buffer);
        const imageData = getImageData(image);

        imageBlurhash = blurhash.encode(imageData.data, imageData.width, imageData.height, 4, 4);
    }


    // TODO: Connection to the bucket


    /*
    TODO: Upload file to bucket with :bucketID
    TODO: Get entry id in bucket
    */

    let asset: Prisma.AssetCreateInput;
    asset = {
        urlPath: "/test" + randomInt(0, 9999), //TODO: Change to bucket entry id
        type: file.mimetype,
        meta: {
            create: {
                fileSize: file.size,
                originalFilename: file.originalname,

                //TODO: whats that?
                referenceUrl: "/test",

                //Only if file is an image
                resolution: isImage ? {
                    create: {
                        width: imageDimensions.width,
                        height: imageDimensions.height
                    }
                } : undefined,

                //Only if file is an image
                colorPalette: isImage ? {
                    create: {
                        primary: imageColors[0],
                        colors: [
                            imageColors[1],
                            imageColors[2]
                        ]
                    }
                } : undefined
            }
        },

        blurHash: isImage ? imageBlurhash : undefined,
    };

    return prisma.asset.create({data: asset, include: includeAll});
}