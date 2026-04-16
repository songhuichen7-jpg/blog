import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "技术",
    slug: "tech",
    description: "算法、框架、性能优化等纯技术内容。",
  },
  {
    name: "项目",
    slug: "projects",
    description: "项目实践、选型、复盘总结。",
  },
  {
    name: "随笔",
    slug: "essays",
    description: "AI 感受、生活思考等非技术内容。",
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
