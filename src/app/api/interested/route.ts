import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import InterestedUser from "@/models/InterestedUser";
import { buildProfileSubmission } from "@/lib/profile";

const mobileRegex = /^[6-9]\d{9}$/;

async function saveInterestedUser(params: {
  email: string;
  name: string;
  mobileNumber: string;
  registrationNumber: string;
  schoolCollegeName: string;
  workshopName?: string;
}) {
  const { email, name, mobileNumber, registrationNumber, schoolCollegeName, workshopName } = params;

  return InterestedUser.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        mobileNumber,
        registrationNumber,
        schoolCollegeName,
        status: "Interested",
      },
      ...(workshopName
        ? {
            $addToSet: {
              workshopNames: workshopName,
            },
          }
        : {}),
    },
    {
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    },
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ workshopNames: [] }, { status: 200 });
  }

  await connectMongo();

  const interestedUser = await InterestedUser.findOne({
    email: session.user.email.toLowerCase(),
  }).select("workshopNames mobileNumber registrationNumber schoolCollegeName");

  return NextResponse.json(
    {
      workshopNames: interestedUser?.workshopNames ?? [],
      user: interestedUser
        ? {
            mobileNumber: interestedUser.mobileNumber,
            registrationNumber: interestedUser.registrationNumber,
            schoolCollegeName: interestedUser.schoolCollegeName,
          }
        : null,
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
    registrationNumber?: string;
    schoolCollegeName?: string;
    workshopName?: string;
  };

  const workshopName = body.workshopName?.trim();
  const email = session.user.email.toLowerCase();

  await connectMongo();

  const existingUser = await InterestedUser.findOne({
    email,
  }).select("mobileNumber registrationNumber schoolCollegeName");

  const profileSubmission = buildProfileSubmission({
    email,
    body: {
      mobileNumber: body.mobileNumber,
      registrationNumber: body.registrationNumber,
      schoolCollegeName: body.schoolCollegeName,
    },
    existing: {
      mobileNumber: existingUser?.mobileNumber,
      registrationNumber: existingUser?.registrationNumber,
      schoolCollegeName: existingUser?.schoolCollegeName,
    },
  });

  if (!profileSubmission.mobileNumber || !mobileRegex.test(profileSubmission.mobileNumber)) {
    return NextResponse.json(
      {
        error: "Please provide a valid 10-digit Indian mobile number.",
        requiresProfileDetails: true,
      },
      { status: 400 },
    );
  }

  if (!profileSubmission.registrationNumber) {
    return NextResponse.json(
      {
        error: "Please provide a registration number.",
        requiresProfileDetails: true,
      },
      { status: 400 },
    );
  }

  if (!profileSubmission.isVitStudent && !profileSubmission.schoolCollegeName) {
    return NextResponse.json(
      {
        error: "Please provide your school or college name.",
        requiresProfileDetails: true,
      },
      { status: 400 },
    );
  }

  if (!workshopName) {
    const profileUser = await saveInterestedUser(
      {
        email,
        name: session.user.name,
        mobileNumber: profileSubmission.mobileNumber,
        registrationNumber: profileSubmission.registrationNumber,
        schoolCollegeName: profileSubmission.schoolCollegeName,
      },
    );

    return NextResponse.json(
      {
        message: "Profile saved successfully.",
        user: {
          name: profileUser.name,
          email: profileUser.email,
          mobileNumber: profileUser.mobileNumber,
          registrationNumber: profileUser.registrationNumber,
          schoolCollegeName: profileUser.schoolCollegeName,
          workshopNames: profileUser.workshopNames,
          status: profileUser.status,
        },
      },
      { status: 201 },
    );
  }

  const interestedUser = await saveInterestedUser(
    {
      email,
      name: session.user.name,
      mobileNumber: profileSubmission.mobileNumber,
      registrationNumber: profileSubmission.registrationNumber,
      schoolCollegeName: profileSubmission.schoolCollegeName,
      workshopName,
    },
  );

  return NextResponse.json(
    {
      message: workshopName ? "Interest saved successfully." : "Profile saved successfully.",
      user: {
        name: interestedUser.name,
        email: interestedUser.email,
        mobileNumber: interestedUser.mobileNumber,
        registrationNumber: interestedUser.registrationNumber,
        schoolCollegeName: interestedUser.schoolCollegeName,
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
  }).select("workshopNames mobileNumber registrationNumber schoolCollegeName");

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
    const hasProfileDetails = Boolean(
      interestedUser.mobileNumber ||
        interestedUser.registrationNumber ||
        interestedUser.schoolCollegeName,
    );

    if (!hasProfileDetails) {
      await InterestedUser.deleteOne({ _id: interestedUser._id });
      return NextResponse.json(
        {
          message: "Interest removed successfully.",
          workshopNames: [],
        },
        { status: 200 },
      );
    }

    interestedUser.status = "Interested";
    await interestedUser.save();

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
