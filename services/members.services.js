const mongoose = require("mongoose");
const Member = require("../models/member.model");
const { generate_memberCopID } = require("../utilities/generate_member_cop_id");
const { ObjectId } = mongoose.Types;

exports.getMemberByCopIDService = async (memberCopID) => {
  return await Member.findOne({ memberCopID });
};
exports.getMemberByIdService = async (id) => {
  return await Member.findById(id);
};

exports.updateMemberEmailService = async (memberCopID, email, oldEmail) => {
  await Member.updateOne(
    { memberCopID },
    {
      $set: {
        emails: {
          defaultEmail: { email, addedAt: Date.now() },
        },
      },
    }
  );
  await this.updateMemberOldEmailService(memberCopID, oldEmail);
};

exports.updateMemberOldEmailService = async (memberCopID, oldEmail) => {
  await Member.updateOne(
    { memberCopID },
    {
      $push: {
        "emails.oldEmails": { ...oldEmail, removedAt: Date.now() },
      },
    }
  );
};

exports.addNewMemberService = async (member) => {
  if (!member.memberCopID && member.name) {
    if (!member.name.split(" ")[1]) {
      throw new Error("Please provide your full name!");
    } else {
      const memberCopID = await generate_memberCopID(member.name);
      member.memberCopID = memberCopID;
    }
  }
  const isMemberExist = await this.getMemberByCopIDService(member.memberCopID);
  if (isMemberExist) {
    throw new Error("Sorry, This member id already used!");
  }
  const result = await Member.create(member);
  return result;
};

exports.updateMemberInformationService = async (memberId, newData) => {
  const result = await Member.findByIdAndUpdate(
    memberId,
    { $set: newData },
    { new: true },
    { runValidators: true }
  );
  return result;
};

exports.deleteAMember = async (id) => {
  const result = await Member.deleteOne({ _id: new ObjectId(id) });
  return result;
};
