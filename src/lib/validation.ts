import { ACCESS_SECRET } from "@/constants/secrets";
// import { OTP } from "@/types/otp";
// import { JWT, Token } from "@/types/token";

export function validateEmail(email: string): boolean {
    
    // check if email is not null
    if (!email) 
        return false;

    // student: email@my.xu.edu.ph
    // faculty: email@xu.edu.ph
    // TODO: enable this check after testing
    // if (!email.endsWith('@my.xu.edu.ph') && !email.endsWith('@xu.edu.ph')) 
    //     return false;
    
    // check if format is an email@domain
    if (email.split('@').length !== 2) 
        return false;

    return true;
}


export function validatePassword(password: string): boolean {

    // check if password is not null
    if (!password) 
        return false;

    // at least 4 characters
    if (password.length < 4) 
        return false;
    
    return true;

}


export function validateType(type: string): boolean {
    return type === 'student' || type === 'faculty';
}


export function validateExpires(expires: number): boolean {
    return expires > Date.now();
}


export function validateSignature(signature: string): boolean {
    return signature === OTP_SECRET;
}


export function validateDecodedOTP(otp: OTP): boolean {

    // check if otp is not null
    if (!otp) 
        return false;

    // check if no of object keys is 5
    if (Object.keys(otp).length !== 5) 
        return false;

    // check if has email, password and signature keys
    if (!otp.email || !otp.password || !otp.signature || !otp.type || !otp.expires) 
        return false;

    // check every key if it is valid
    // TODO: enable this check after testing    
    // if (!validateEmail(otp.email))          return false;
    if (!validatePassword(otp.password))    return false;
    if (!validateSignature(otp.signature))  return false;
    if (!validateType(otp.type))            return false;
    if (!validateExpires(otp.expires))      return false;

    return true;
}


export function validateDecodedToken(token: Token): boolean {

     // check if otp is not null
     if (!token) 
        return false;
    
    // check if no of object keys is 3
    if (Object.keys(token).length !== 3) 
        return false;

    // check if has email, password and signature keys
    if (!token.email || !token.password || !token.type) 
        return false;

    // check every key if it is valid
    // TODO: enable this check after testing
    // if (!validateEmail(token.email))          return false;
    if (!validatePassword(token.password))    return false;
    if (!validateType(token.type))            return false;

    return true;
}