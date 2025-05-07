import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/encryption";

// TODO: changed csoMainDashboard to osgMainDashboard
const CSO_ONLY = [
  "/AnnouncementPage",
  "/csoMainDashboard",
  "/scholarStatus",
  "/AttachmentPage",
]

const SCHOLAR_ONLY = [
  "/scholarMainDashboard",
  "/scholarNotification",
]


export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  console.log(request.nextUrl.pathname);

  // if (!token) {

  //   for (const path of SCHOLAR_ONLY) {
  //     if (request.nextUrl.pathname.startsWith(path)) {
  //       return NextResponse.rewrite(new URL("/login", request.url));
  //     }
  //   }
  //   for (const path of CSO_ONLY) {
  //     if (request.nextUrl.pathname.startsWith(path)) {
  //       return NextResponse.rewrite(new URL("/login", request.url));
  //     }
  //   }

  //   if (request.nextUrl.pathname.startsWith("/api")) {
  //     return NextResponse.rewrite(new URL("/login", request.url));
  //   }

  // }


  if (token) {
    try {
      const decryptedToken = await decrypt(token.value);
      const parsedToken = JSON.parse(decryptedToken);
      const { email, password, type } = parsedToken;

      if (type !== "scholar" && type !== "cso") {
        const response = NextResponse.rewrite(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
      }

      // let redirect;
      // if (
      //   // TODO: change the name of this route or else it gets blocked 
      //   !request.nextUrl.pathname.startsWith("/verifyAttachments") 
      //   && (request.nextUrl.pathname === "/"
      //   || request.nextUrl.pathname.startsWith("/login")
      //   || request.nextUrl.pathname.startsWith("/verify") )
      // ) {
      //   if (type === "scholar") {
      //     redirect = new URL("/scholarMainDashboard", request.url);
      //   }
      //   else if (type === "cso") {
      //     redirect = new URL("/csoMainDashboard", request.url);
      //   }
      // }
      // else if (type === "scholar") {
      //   for (const path of CSO_ONLY) {
      //     if (request.nextUrl.pathname.startsWith(path)) {
      //       redirect = new URL("/scholarMainDashboard", request.url);
      //       console.log(redirect);
      //     }
      //   }
      // }
      // else if (type === "cso") {
      //   for (const path of SCHOLAR_ONLY) {
      //     if (request.nextUrl.pathname.startsWith(path)) {
      //       redirect = new URL("/csoMainDashboard", request.url);
      //     }
      //   }
      // }

      let response = NextResponse.next();
      // if (redirect) {
      //   response = NextResponse.rewrite(redirect);
      // }

      response.headers.set("email", email);
      response.headers.set("password", password);
      response.headers.set("type", type);

      return response;

    }
    catch (error) {
      // Token is not valid anymore or decryption failed
      console.error("Error decrypting token:", error);
      const response = NextResponse.rewrite(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }


  }






}
