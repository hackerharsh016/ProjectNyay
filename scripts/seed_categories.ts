import prisma from "../src/lib/prisma";

const categories = [
  "Politics",
  "Crime",
  "Current Affairs",
  "Economy",
  "Education",
  "Governance",
  "Technology",
  "Environment",
  "Law",
  "Others"
];

async function main() {
  console.log("Seeding categories...");
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  
  const allCategories = await prisma.category.findMany();
  console.log("\nCategories in Database:");
  console.log(allCategories.map((c: { name: string }) => `- ${c.name}`).join("\n"));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
