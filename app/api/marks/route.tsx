import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/prisma/client";

export async function POST(request: NextRequest)
{
    const body = await request.json();
    await prisma.marker.create({
        data: {            
            name: body.name,
            timeStamp: body.timeStamp,
            lat: body.lat,
            len: body.len
        }        
    })
    return NextResponse.json(body);
}

export async function GET(request: NextRequest)
{
    const markers = await prisma.marker.findMany();
    return NextResponse.json(markers);
}