import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody } from "h3";
import sanitizeHtml from "sanitize-html";
import axios from "axios"; // Import axios for making HTTP requests

const prisma = new PrismaClient();

// Function to verify CAPTCHA
const verifyCaptcha = async (captchaToken) => {
  const secretKey = "YOUR_SECRET_KEY"; // Replace with your actual secret key
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`
  );
  return response.data.success; // Return true if CAPTCHA is valid
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email, comment } = body;

  if (!name || !email || !comment) {
    return { error: "All fields are required." };
  }

  // Verify CAPTCHA
  // if (!(await verifyCaptcha(captchaToken))) {
  //   return { error: "CAPTCHA verification failed." }; // Return error if CAPTCHA verification fails
  // }

  // Sanitasi komentar untuk mencegah XSS
  const sanitizedComment = sanitizeHtml(comment, {
    allowedTags: [], // Disallow all HTML tags
    allowedAttributes: {}, // Remove all attributes
  });
  
  const newEntry = await prisma.guestbookEntry.create({
    data: {
      name,
      email,
      comment: sanitizedComment,
    },
  });

  return newEntry;
});
