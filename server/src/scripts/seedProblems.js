require("dotenv").config();

const mongoose = require("mongoose");
const Problem = require("../models/Problem");

const problems = [
  {
    title: "Sum of Two Numbers",

    description:
      "Given two integers a and b, print their sum.",

    difficulty: "easy",

    constraints: [
      "-1000000000 <= a, b <= 1000000000",
    ],

    examples: [
      {
        input: "5 7",
        output: "12",
        explanation: "5 + 7 = 12",
      },
      {
        input: "-3 8",
        output: "5",
        explanation: "-3 + 8 = 5",
      },
    ],

    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;

    // Write your code here

    return 0;
}`,

      javascript: `const fs = require("fs");

const input = fs
  .readFileSync(0, "utf8")
  .trim()
  .split(/\\s+/)
  .map(Number);

const [a, b] = input;

// Write your code here`,

      python: `a, b = map(int, input().split())

# Write your code here`,
    },

    testCases: [
      {
        input: "5 7",
        expectedOutput: "12",
      },
      {
        input: "-3 8",
        expectedOutput: "5",
      },
      {
        input: "1000000000 1000000000",
        expectedOutput: "2000000000",
      },
      {
        input: "0 0",
        expectedOutput: "0",
      },
    ],

    timeLimit: 2000,
    source: "manual",
    isActive: true,
  },
];

const seedProblems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "codeclash",
    });

    for (const problem of problems) {
      await Problem.findOneAndUpdate(
        {
          title: problem.title,
        },
        problem,
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
    }

    console.log(
      `${problems.length} coding problem added successfully`
    );
  } catch (error) {
    console.error(`Problem seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedProblems();