


import Attachments from "./attachment";
import { getScholarDetails } from "@/actions/scholarship";

export default async function VerifyAttachments() {

  const scholarDetails = await getScholarDetails();

  console.log("scholar details", scholarDetails);

  return (
    <Attachments scholarData={scholarDetails} />
  );
}