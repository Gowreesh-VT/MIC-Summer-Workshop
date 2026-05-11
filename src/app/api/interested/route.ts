import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import InterestedUser from "@/models/InterestedUser";

const mobileRegex = /^[6-9]\d{9}$/;

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ workshopNames: [] }, { status: 200 });
  }

  await connectMongo();

  const interestedUser = await InterestedUser.findOne({
    email: session.user.email.toLowerCase(),
  }).select("workshopNames");

  return NextResponse.json(
    {
      workshopNames: interestedUser?.workshopNames ?? [],
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    mobileNumber?: string;
    workshopName?: string;
  };

  const workshopName = body.workshopName?.trim();

  if (!workshopName) {
    return NextResponse.json(
      { error: "Please provide a workshop name." },
      { status: 400 },
    );
  }

  await connectMongo();

  const existingUser = await InterestedUser.findOne({
    email: session.user.email.toLowerCase(),
  }).select("mobileNumber");

  const mobileNumber = body.mobileNumber?.trim() || existingUser?.mobileNumber?.trim();

  if (!mobileNumber || !mobileRegex.test(mobileNumber)) {
    return NextResponse.json(
      {
        error: "Please provide a valid 10-digit Indian mobile number.",
        requiresMobileNumber: true,
      },
      { status: 400 },
    );
  }

  const interestedUser = await InterestedUser.findOneAndUpdate(
    { email: session.user.email.toLowerCase() },
    {
      $set: {
        name: session.user.name,
        email: session.user.email.toLowerCase(),
        mobileNumber,
        status: "Interested",
      },
      $addToSet: {
        workshopNames: workshopName,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    },
  );

  return NextResponse.json(
    {
      message: "Interest saved successfully.",
      user: {
        name: interestedUser.name,
        email: interestedUser.email,
        mobileNumber: interestedUser.mobileNumber,
        workshopNames: interestedUser.workshopNames,
        status: interestedUser.status,
      },
    },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    workshopName?: string;
  };

  const workshopName = body.workshopName?.trim();

  if (!workshopName) {
    return NextResponse.json(
      { error: "Please provide a workshop name." },
      { status: 400 },
    );
  }

  await connectMongo();

  const interestedUser = await InterestedUser.findOne({
    email: session.user.email.toLowerCase(),
  }).select("workshopNames");

  if (!interestedUser) {
    return NextResponse.json({ error: "Interest record not found." }, { status: 404 });
  }

  if (!interestedUser.workshopNames?.includes(workshopName)) {
    return NextResponse.json({ error: "Interest record not found." }, { status: 404 });
  }

  const workshopNames = interestedUser.workshopNames as string[];

  interestedUser.workshopNames = workshopNames.filter(
    (name) => name !== workshopName,
  );

  if (interestedUser.workshopNames.length === 0) {
    await InterestedUser.deleteOne({ _id: interestedUser._id });
    return NextResponse.json(
      {
        message: "Interest removed successfully.",
        workshopNames: [],
      },
      { status: 200 },
    );
  }

  await interestedUser.save();

  return NextResponse.json(
    {
      message: "Interest removed successfully.",
      workshopNames: interestedUser.workshopNames,
    },
    { status: 200 },
  );
}
