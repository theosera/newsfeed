import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const categories = [
    { name: "Top", description: "主要なニュース全般" },
    { name: "Tech", description: "技術ニュースと開発ブログ" },
    { name: "Business", description: "ビジネスと経済" },
    { name: "World", description: "国際ニュース" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(category.name) },
      update: category,
      create: {
        ...category,
        slug: slugify(category.name),
      },
    });
  }

  const techCategory = await prisma.category.findUniqueOrThrow({
    where: { slug: "tech" },
  });

  const demoSources = [
    {
      name: "GitHub Blog",
      slug: "github-blog",
      url: "https://github.blog/feed/",
      websiteUrl: "https://github.blog/",
      description: "GitHub 公式ブログ",
    },
    {
      name: "MDN Blog",
      slug: "mdn-blog",
      url: "https://developer.mozilla.org/en-US/blog/rss.xml",
      websiteUrl: "https://developer.mozilla.org/en-US/blog/",
      description: "MDN の公式ブログ",
    },
    {
      name: "DEV Community",
      slug: "dev-community",
      url: "https://dev.to/feed",
      websiteUrl: "https://dev.to/",
      description: "開発者コミュニティの投稿",
    },
  ];

  for (const source of demoSources) {
    await prisma.source.upsert({
      where: { slug: source.slug },
      update: {
        ...source,
        categoryId: techCategory.id,
      },
      create: {
        ...source,
        categoryId: techCategory.id,
      },
    });
  }

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const users = [
    {
      email: "admin@example.com",
      name: "Admin User",
      role: Role.ADMIN,
    },
    {
      email: "demo@example.com",
      name: "Demo User",
      role: Role.USER,
    },
  ];

  for (const user of users) {
    const savedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash,
      },
      create: {
        ...user,
        passwordHash,
      },
    });

    await prisma.userSetting.upsert({
      where: { userId: savedUser.id },
      update: {},
      create: {
        userId: savedUser.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
