// Email service for notifications and results distribution

import nodemailer from "nodemailer";
import { EmailConfig } from "@/types";

// Create transporter (configure in .env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send email notification
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<void> {
  try {
    const recipients = Array.isArray(to) ? to : [to];
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipients.join(", "),
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
      html,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email");
  }
}

/**
 * Notify examiner about new essay assignment
 */
export async function notifyExaminer(
  examinerEmail: string,
  studentName: string,
  matricNumber: string,
  essayId: string
): Promise<void> {
  const subject = "New Essay Assignment - Exam Manager";
  const html = `
    <h2>New Essay Assignment</h2>
    <p>You have been assigned to evaluate an essay submission.</p>
    <ul>
      <li><strong>Student:</strong> ${studentName}</li>
      <li><strong>Matric Number:</strong> ${matricNumber}</li>
      <li><strong>Essay ID:</strong> ${essayId}</li>
    </ul>
    <p>Please log in to the Exam Manager system to evaluate this essay.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/examiner/evaluate/${essayId}">View Essay</a></p>
  `;
  
  await sendEmail(examinerEmail, subject, html);
}

/**
 * Distribute results to all university officials
 */
export async function distributeResults(
  emailConfig: EmailConfig,
  examTitle: string,
  resultsData: {
    studentName: string;
    matricNumber: string;
    objectiveScore: number;
    essayScore: number;
    totalScore: number;
    grade: string;
  }[]
): Promise<void> {
  const subject = `Examination Results - ${examTitle}`;
  
  // Create results table
  const resultsTable = `
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>Matric Number</th>
          <th>Student Name</th>
          <th>Objective Score</th>
          <th>Essay Score</th>
          <th>Total Score</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>
        ${resultsData
          .map(
            (result) => `
          <tr>
            <td>${result.matricNumber}</td>
            <td>${result.studentName}</td>
            <td>${result.objectiveScore.toFixed(2)}</td>
            <td>${result.essayScore.toFixed(2)}</td>
            <td>${result.totalScore.toFixed(2)}</td>
            <td>${result.grade}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
  
  const html = `
    <h2>Examination Results - ${examTitle}</h2>
    <p>Please find below the comprehensive examination results:</p>
    ${resultsTable}
    <p><strong>Note:</strong> These results are confidential and for official use only.</p>
  `;
  
  // Send to all configured email addresses
  const recipients = [
    emailConfig.viceChancellorEmail,
    emailConfig.registrarEmail,
    emailConfig.bursarEmail,
    emailConfig.librarianEmail,
    emailConfig.facultyDeanEmail,
    emailConfig.headOfDeptEmail,
    emailConfig.facultyExamOfficerEmail,
    emailConfig.deptExamOfficerEmail,
    emailConfig.deputyVCEmail,
    ...emailConfig.courseLecturerEmails,
  ].filter(Boolean);
  
  await sendEmail(recipients, subject, html);
}

/**
 * Send flag notification for essay re-evaluation
 */
export async function notifyFlaggedEssay(
  examinerEmail: string,
  essayId: string,
  reason: string
): Promise<void> {
  const subject = "Essay Flagged for Re-evaluation";
  const html = `
    <h2>Essay Flagged for Re-evaluation</h2>
    <p>An essay has been flagged due to score variance exceeding the threshold.</p>
    <ul>
      <li><strong>Essay ID:</strong> ${essayId}</li>
      <li><strong>Reason:</strong> ${reason}</li>
    </ul>
    <p>Please review and provide an additional evaluation.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/examiner/evaluate/${essayId}">View Essay</a></p>
  `;
  
  await sendEmail(examinerEmail, subject, html);
}
