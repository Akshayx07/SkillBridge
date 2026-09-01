import { PrismaClient, Role, ApplicationStatus, MentorshipStatus, HackathonStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Hash passwords ─────────────────────────────────────────────────────
  const defaultPassword = await bcrypt.hash("password123", 12);

  // ─── Create Skills ──────────────────────────────────────────────────────
  console.log("  Creating skills...");
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: "TypeScript", category: "Language" } }),
    prisma.skill.create({ data: { name: "React", category: "Frontend" } }),
    prisma.skill.create({ data: { name: "Next.js", category: "Framework" } }),
    prisma.skill.create({ data: { name: "Node.js", category: "Backend" } }),
    prisma.skill.create({ data: { name: "Python", category: "Language" } }),
    prisma.skill.create({ data: { name: "PostgreSQL", category: "Database" } }),
    prisma.skill.create({ data: { name: "Docker", category: "DevOps" } }),
    prisma.skill.create({ data: { name: "AWS", category: "Cloud" } }),
    prisma.skill.create({ data: { name: "Machine Learning", category: "AI" } }),
    prisma.skill.create({ data: { name: "UI/UX Design", category: "Design" } }),
    prisma.skill.create({ data: { name: "GraphQL", category: "API" } }),
    prisma.skill.create({ data: { name: "Rust", category: "Language" } }),
  ]);

  // ─── Create Users ───────────────────────────────────────────────────────
  console.log("  Creating users...");

  // Students
  const student1 = await prisma.user.create({
    data: {
      name: "Alex Chen",
      email: "alex@student.com",
      password: defaultPassword,
      role: Role.STUDENT,
      profile: {
        create: {
          bio: "Final-year CS student passionate about full-stack development and open source. Led the campus coding club for 2 years.",
          headline: "CS Student @ Stanford University",
          location: "San Francisco, CA",
          university: "Stanford University",
          githubUrl: "https://github.com/alexchen",
          linkedinUrl: "https://linkedin.com/in/alexchen",
          skills: {
            create: [
              { skillId: skills[0].id, level: 4 }, // TypeScript
              { skillId: skills[1].id, level: 5 }, // React
              { skillId: skills[2].id, level: 4 }, // Next.js
              { skillId: skills[4].id, level: 3 }, // Python
              { skillId: skills[5].id, level: 3 }, // PostgreSQL
            ],
          },
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@student.com",
      password: defaultPassword,
      role: Role.STUDENT,
      profile: {
        create: {
          bio: "Data science enthusiast with a focus on NLP and recommendation systems. Previously interned at a healthcare AI startup.",
          headline: "ML Engineering Student @ MIT",
          location: "Boston, MA",
          university: "MIT",
          website: "https://priyasharma.dev",
          githubUrl: "https://github.com/priyasharma",
          skills: {
            create: [
              { skillId: skills[4].id, level: 5 }, // Python
              { skillId: skills[8].id, level: 4 }, // Machine Learning
              { skillId: skills[0].id, level: 3 }, // TypeScript
              { skillId: skills[3].id, level: 3 }, // Node.js
              { skillId: skills[5].id, level: 3 }, // PostgreSQL
            ],
          },
        },
      },
    },
  });

  // Industry Professional
  const industry1 = await prisma.user.create({
    data: {
      name: "Jordan Rivera",
      email: "jordan@industry.com",
      password: defaultPassword,
      role: Role.INDUSTRY,
      profile: {
        create: {
          bio: "Senior Platform Engineer at Stripe. Open source contributor. Passionate about mentoring the next generation of engineers.",
          headline: "Senior Platform Engineer @ Stripe",
          location: "Seattle, WA",
          company: "Stripe",
          experience: "8 years in software engineering. Previously at Google and Shopify.",
          githubUrl: "https://github.com/jordanrivera",
          linkedinUrl: "https://linkedin.com/in/jordanrivera",
          skills: {
            create: [
              { skillId: skills[0].id, level: 5 }, // TypeScript
              { skillId: skills[3].id, level: 5 }, // Node.js
              { skillId: skills[6].id, level: 4 }, // Docker
              { skillId: skills[7].id, level: 5 }, // AWS
              { skillId: skills[11].id, level: 4 }, // Rust
              { skillId: skills[10].id, level: 4 }, // GraphQL
            ],
          },
        },
      },
      jobPostings: {
        create: [
          {
            title: "Junior Full-Stack Engineer",
            description:
              "Join our payments platform team building next-generation financial infrastructure. You'll work with TypeScript, Node.js, and PostgreSQL to ship features used by millions of businesses worldwide.",
            company: "Stripe",
            location: "Seattle, WA",
            isRemote: true,
            salary: "$110,000 - $140,000",
            jobType: "FULL_TIME",
            skills: {
              create: [
                { skillId: skills[0].id }, // TypeScript
                { skillId: skills[1].id }, // React
                { skillId: skills[3].id }, // Node.js
                { skillId: skills[5].id }, // PostgreSQL
              ],
            },
          },
          {
            title: "Backend Engineering Intern",
            description:
              "Summer internship on our infrastructure team. You'll build internal tools and contribute to our open-source developer SDKs.",
            company: "Stripe",
            location: "Seattle, WA",
            isRemote: false,
            salary: "$8,500/month",
            jobType: "INTERNSHIP",
            skills: {
              create: [
                { skillId: skills[0].id }, // TypeScript
                { skillId: skills[3].id }, // Node.js
                { skillId: skills[6].id }, // Docker
              ],
            },
          },
        ],
      },
    },
  });

  // Academician
  const academician1 = await prisma.user.create({
    data: {
      name: "Dr. Sarah Okafor",
      email: "sarah@academician.com",
      password: defaultPassword,
      role: Role.ACADEMICIAN,
      profile: {
        create: {
          bio: "Associate Professor of Computer Science at Georgia Tech. Research focus on distributed systems and blockchain. Published 40+ papers in top-tier venues.",
          headline: "Associate Professor @ Georgia Tech",
          location: "Atlanta, GA",
          university: "Georgia Institute of Technology",
          website: "https://cc.gatech.edu/~sokafor",
          linkedinUrl: "https://linkedin.com/in/sarahokafor",
          experience: "12 years in academia. PhD from Carnegie Mellon University.",
          skills: {
            create: [
              { skillId: skills[4].id, level: 5 }, // Python
              { skillId: skills[5].id, level: 4 }, // PostgreSQL
              { skillId: skills[7].id, level: 4 }, // AWS
              { skillId: skills[8].id, level: 5 }, // Machine Learning
            ],
          },
        },
      },
    },
  });

  // Admin
  const admin1 = await prisma.user.create({
    data: {
      name: "SkillBridge Admin",
      email: "admin@skillbridge.com",
      password: defaultPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          bio: "Platform administrator for SkillBridge. Managing the hackathon ecosystem.",
          headline: "Platform Admin",
          location: "Remote",
        },
      },
    },
  });

  console.log("  Users created.");

  // ─── Create Applications ────────────────────────────────────────────────
  console.log("  Creating applications...");

  const jobs = await prisma.job.findMany();

  await prisma.application.create({
    data: {
      userId: student1.id,
      jobId: jobs[0].id, // Junior Full-Stack Engineer
      status: ApplicationStatus.PENDING,
      coverLetter:
        "I'm excited to apply for this role. My experience building production apps with Next.js and PostgreSQL aligns perfectly with your stack. I've led campus projects that served 500+ users.",
      resumeUrl: "https://storage.example.com/resumes/alex-chen.pdf",
    },
  });

  await prisma.application.create({
    data: {
      userId: student2.id,
      jobId: jobs[0].id, // Junior Full-Stack Engineer
      status: ApplicationStatus.REVIEWING,
      coverLetter:
        "As an ML engineering student, I bring a unique perspective to full-stack development. I've built data pipelines and APIs that process millions of records daily.",
      resumeUrl: "https://storage.example.com/resumes/priya-sharma.pdf",
    },
  });

  await prisma.application.create({
    data: {
      userId: student1.id,
      jobId: jobs[1].id, // Backend Engineering Intern
      status: ApplicationStatus.ACCEPTED,
      coverLetter:
        "This internship aligns with my goal of becoming a systems engineer. I've contributed to 3 open-source projects and built a custom Docker-based CI pipeline for my coding club.",
    },
  });

  console.log("  Applications created.");

  // ─── Create Mentorships ─────────────────────────────────────────────────
  console.log("  Creating mentorships...");

  await prisma.mentorship.create({
    data: {
      mentorId: industry1.id,
      menteeId: student1.id,
      status: MentorshipStatus.ACTIVE,
      notes: "Career guidance and system design mentorship",
      startDate: new Date("2026-01-15"),
    },
  });

  await prisma.mentorship.create({
    data: {
      mentorId: academician1.id,
      menteeId: student2.id,
      status: MentorshipStatus.ACTIVE,
      notes: "Research mentorship - NLP and recommendation systems",
      startDate: new Date("2026-02-01"),
    },
  });

  await prisma.mentorship.create({
    data: {
      mentorId: industry1.id,
      menteeId: student2.id,
      status: MentorshipStatus.PENDING,
      notes: "Technical interview preparation",
    },
  });

  console.log("  Mentorships created.");

  // ─── Create Hackathons ──────────────────────────────────────────────────
  console.log("  Creating hackathons...");

  await prisma.hackathon.create({
    data: {
      title: "SkillBridge Launch Hack 2026",
      description:
        "Our inaugural hackathon! Build innovative solutions that bridge the gap between students, industry, and academia. Focus areas: EdTech, Open Source Tools, and Social Impact.",
      status: HackathonStatus.OPEN,
      startDate: new Date("2026-10-01T09:00:00Z"),
      endDate: new Date("2026-10-03T17:00:00Z"),
      location: "Virtual + Stanford Campus",
      isVirtual: true,
      maxTeamSize: 4,
      organizerId: admin1.id,
    },
  });

  await prisma.hackathon.create({
    data: {
      title: "AI for Good Hackathon",
      description:
        "Use machine learning to solve real-world problems in healthcare, climate, and education. Industry mentors from Google and Microsoft will guide teams.",
      status: HackathonStatus.IN_PROGRESS,
      startDate: new Date("2026-08-15T08:00:00Z"),
      endDate: new Date("2026-08-17T18:00:00Z"),
      location: "Georgia Tech Campus",
      isVirtual: false,
      maxTeamSize: 5,
      organizerId: academician1.id,
    },
  });

  await prisma.hackathon.create({
    data: {
      title: "FinTech Innovation Sprint",
      description:
        "Build the future of financial technology. Prize pool of $50K. Sponsored by Stripe, Square, and Plaid.",
      status: HackathonStatus.COMPLETED,
      startDate: new Date("2026-05-10T09:00:00Z"),
      endDate: new Date("2026-05-12T17:00:00Z"),
      location: "Virtual",
      isVirtual: true,
      maxTeamSize: 3,
      organizerId: industry1.id,
    },
  });

  console.log("  Hackathons created.");

  // ─── Summary ────────────────────────────────────────────────────────────
  console.log("\n✅ Seed complete!\n");
  console.log("  Test Accounts (password: password123):");
  console.log("  ────────────────────────────────────────");
  console.log(`  Student:     ${student1.email}`);
  console.log(`  Student:     ${student2.email}`);
  console.log(`  Industry:    ${industry1.email}`);
  console.log(`  Academician: ${academician1.email}`);
  console.log(`  Admin:       ${admin1.email}`);
  console.log("");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
