// Seed script for sample data

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/encryption";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@exammanager.com" },
    update: {},
    create: {
      email: "admin@exammanager.com",
      password: hashPassword("Admin@123"),
      role: "ADMIN",
      name: "System Administrator",
      adminSettings: {
        create: {
          viceChancellorEmail: "vc@university.edu",
          registrarEmail: "registrar@university.edu",
          bursarEmail: "bursar@university.edu",
          librarianEmail: "librarian@university.edu",
          facultyDeanEmail: "dean@university.edu",
          headOfDeptEmail: "hod@university.edu",
          facultyExamOfficerEmail: "feo@university.edu",
          deptExamOfficerEmail: "deo@university.edu",
          courseLecturerEmails: JSON.stringify(["lecturer1@university.edu", "lecturer2@university.edu"]),
          deputyVCEmail: "dvc@university.edu",
        },
      },
    },
  });

  console.log("Created admin user:", admin.email);

  // Create Faculties
  const engineering = await prisma.faculty.upsert({
    where: { code: "ENG" },
    update: {},
    create: {
      name: "Faculty of Engineering",
      code: "ENG",
      description: "Engineering and Technology",
      departments: {
        create: [
          {
            name: "Computer Engineering",
            code: "CEN",
            description: "Computer and Software Engineering",
          },
          {
            name: "Electrical Engineering",
            code: "EEN",
            description: "Electrical and Electronics Engineering",
          },
          {
            name: "Mechanical Engineering",
            code: "MEN",
            description: "Mechanical Engineering",
          },
        ],
      },
    },
  });

  const science = await prisma.faculty.upsert({
    where: { code: "SCI" },
    update: {},
    create: {
      name: "Faculty of Science",
      code: "SCI",
      description: "Natural and Applied Sciences",
      departments: {
        create: [
          {
            name: "Computer Science",
            code: "CSC",
            description: "Computer Science and Information Technology",
          },
          {
            name: "Mathematics",
            code: "MAT",
            description: "Mathematics and Statistics",
          },
        ],
      },
    },
  });

  console.log("Created faculties:", engineering.name, science.name);

  // Get departments
  const compEngDept = await prisma.department.findFirst({
    where: { code: "CEN" },
  });

  const compSciDept = await prisma.department.findFirst({
    where: { code: "CSC" },
  });

  // Create Examiners
  const examiner1 = await prisma.user.create({
    data: {
      email: "examiner1@exammanager.com",
      password: hashPassword("Examiner@123"),
      role: "EXAMINER",
      name: "Dr. John Examiner",
      examiner: {
        create: {
          employeeId: "EMP001",
          departmentId: compEngDept?.id,
          isActive: true,
        },
      },
    },
  });

  const examiner2 = await prisma.user.create({
    data: {
      email: "examiner2@exammanager.com",
      password: hashPassword("Examiner@123"),
      role: "EXAMINER",
      name: "Prof. Jane Evaluator",
      examiner: {
        create: {
          employeeId: "EMP002",
          departmentId: compSciDept?.id,
          isActive: true,
        },
      },
    },
  });

  console.log("Created examiners:", examiner1.email, examiner2.email);

  // Create Sample Students
  const students = [];
  for (let i = 1; i <= 10; i++) {
    const student = await prisma.user.create({
      data: {
        email: `student${i}@exammanager.com`,
        password: hashPassword("Student@123"),
        role: "STUDENT",
        name: `Student ${i}`,
        student: {
          create: {
            matricNumber: `MAT/2021/${String(i).padStart(3, "0")}`,
            passportPhoto: `https://via.placeholder.com/150?text=Student${i}`, // Placeholder
            classAttendance: 75 + Math.random() * 20,
            continuousAssessment: 60 + Math.random() * 30,
            departmentId: compEngDept?.id || "",
          },
        },
      },
    });
    students.push(student);
  }

  console.log(`Created ${students.length} sample students`);

  // Create Subject
  const subject = await prisma.subject.create({
    data: {
      name: "Introduction to Computer Science",
      code: "CSC101",
      description: "Fundamentals of Computer Science",
    },
  });

  console.log("Created subject:", subject.name);

  // Create Sample Questions (500+)
  const questions = [];
  const questionTemplates = [
    {
      base: "What is the time complexity of %s?",
      options: [
        ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        ["O(n)", "O(1)", "O(log n)", "O(n²)"],
        ["O(log n)", "O(1)", "O(n)", "O(n²)"],
        ["O(n²)", "O(1)", "O(n)", "O(log n)"],
      ],
      operations: ["binary search", "linear search", "binary tree traversal", "bubble sort"],
    },
    {
      base: "Which data structure uses %s?",
      options: [
        ["LIFO", "FIFO", "Both", "Neither"],
        ["FIFO", "LIFO", "Both", "Neither"],
      ],
      operations: ["Stack", "Queue"],
    },
  ];

  for (let i = 0; i < 500; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    const opIndex = Math.floor(i / template.options.length) % template.operations.length;
    const optionSet = template.options[opIndex % template.options.length];

    const question = await prisma.question.create({
      data: {
        subjectId: subject.id,
        questionText: template.base.replace("%s", template.operations[opIndex]),
        options: JSON.stringify(optionSet),
        correctAnswer: 0, // First option is correct
        marks: 1,
        isActive: true,
      },
    });
    questions.push(question);
  }

  console.log(`Created ${questions.length} sample questions`);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
