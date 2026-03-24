import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "思考",
    slug: "thoughts",
    description: "关于技术、学习与成长的个人观察和思考。",
  },
  {
    name: "项目",
    slug: "projects",
    description: "个人项目的设计思路、决策过程与复盘总结。",
  },
  {
    name: "日常",
    slug: "life",
    description: "作为一个 CS 学生的日常、感受与随笔。",
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
