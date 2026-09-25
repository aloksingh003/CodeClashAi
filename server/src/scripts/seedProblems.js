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
      { input: "5 7", expectedOutput: "12" },
      { input: "-3 8", expectedOutput: "5" },
      { input: "0 0", expectedOutput: "0" },
      {
        input: "1000000000 1000000000",
        expectedOutput: "2000000000",
      },
    ],
    timeLimit: 2000,
    source: "manual",
    isActive: true,
  },

  {
    title: "Reverse a String",
    description:
      "Given a string containing no spaces, print the string in reverse order.",
    difficulty: "easy",
    constraints: [
      "1 <= length of string <= 100000",
      "The string contains English letters and digits",
    ],
    examples: [
      {
        input: "codeclash",
        output: "hsalcedoc",
        explanation:
          "The characters are printed in reverse order.",
      },
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    string text;
    cin >> text;

    // Write your code here

    return 0;
}`,
      javascript: `const fs = require("fs");

const text = fs.readFileSync(0, "utf8").trim();

// Write your code here`,
      python: `text = input().strip()

# Write your code here`,
    },
    testCases: [
      {
        input: "codeclash",
        expectedOutput: "hsalcedoc",
      },
      {
        input: "hello",
        expectedOutput: "olleh",
      },
      {
        input: "a",
        expectedOutput: "a",
      },
      {
        input: "12345",
        expectedOutput: "54321",
      },
    ],
    timeLimit: 2000,
    source: "manual",
    isActive: true,
  },

  {
    title: "Maximum Element in an Array",
    description:
      "Given an array of n integers, print the maximum element present in the array.",
    difficulty: "easy",
    constraints: [
      "1 <= n <= 100000",
      "-1000000000 <= array[i] <= 1000000000",
    ],
    examples: [
      {
        input: "5\n3 8 2 10 4",
        output: "10",
        explanation:
          "10 is the largest element in the array.",
      },
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<long long> numbers(n);

    for (int i = 0; i < n; i++) {
        cin >> numbers[i];
    }

    // Write your code here

    return 0;
}`,
      javascript: `const fs = require("fs");

const input = fs
  .readFileSync(0, "utf8")
  .trim()
  .split(/\\s+/)
  .map(Number);

const n = input[0];
const numbers = input.slice(1, n + 1);

// Write your code here`,
      python: `n = int(input())
numbers = list(map(int, input().split()))

# Write your code here`,
    },
    testCases: [
      {
        input: "5\n3 8 2 10 4",
        expectedOutput: "10",
      },
      {
        input: "4\n-8 -2 -15 -3",
        expectedOutput: "-2",
      },
      {
        input: "1\n99",
        expectedOutput: "99",
      },
      {
        input: "6\n5 5 5 5 5 5",
        expectedOutput: "5",
      },
    ],
    timeLimit: 2000,
    source: "manual",
    isActive: true,
  },

  {
    title: "Palindrome String",
    description:
      "Given a lowercase string, print YES if it reads the same forward and backward. Otherwise, print NO.",
    difficulty: "easy",
    constraints: [
      "1 <= length of string <= 100000",
      "The string contains only lowercase English letters",
    ],
    examples: [
      {
        input: "racecar",
        output: "YES",
        explanation:
          "racecar is the same from both directions.",
      },
      {
        input: "hello",
        output: "NO",
        explanation:
          "hello is not the same in reverse.",
      },
    ],
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    string text;
    cin >> text;

    // Write your code here

    return 0;
}`,
      javascript: `const fs = require("fs");

const text = fs.readFileSync(0, "utf8").trim();

// Write your code here`,
      python: `text = input().strip()

# Write your code here`,
    },
    testCases: [
      {
        input: "racecar",
        expectedOutput: "YES",
      },
      {
        input: "hello",
        expectedOutput: "NO",
      },
      {
        input: "a",
        expectedOutput: "YES",
      },
      {
        input: "level",
        expectedOutput: "YES",
      },
    ],
    timeLimit: 2000,
    source: "manual",
    isActive: true,
  },

  {
    title: "Count Vowels",
    description:
      "Given a line of text, count and print the number of vowels. Consider both uppercase and lowercase vowels.",
    difficulty: "easy",
    constraints: [
      "1 <= length of text <= 100000",
      "Vowels are a, e, i, o and u",
    ],
    examples: [
      {
        input: "Hello World",
        output: "3",
        explanation:
          "The vowels are e, o and o.",
      },
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string text;
    getline(cin, text);

    // Write your code here

    return 0;
}`,
      javascript: `const fs = require("fs");

const text = fs.readFileSync(0, "utf8").trim();

// Write your code here`,
      python: `text = input()

# Write your code here`,
    },
    testCases: [
      {
        input: "Hello World",
        expectedOutput: "3",
      },
      {
        input: "AEIOU",
        expectedOutput: "5",
      },
      {
        input: "rhythm",
        expectedOutput: "0",
      },
      {
        input: "CodeClash AI",
        expectedOutput: "5",
      },
    ],
    timeLimit: 2000,
    source: "manual",
    isActive: true,
  },

  {
    title: "Nth Fibonacci Number",
    description:
      "Given a non-negative integer n, print the nth Fibonacci number. F(0) = 0, F(1) = 1 and F(n) = F(n - 1) + F(n - 2).",
    difficulty: "medium",
    constraints: [
      "0 <= n <= 40",
    ],
    examples: [
      {
        input: "10",
        output: "55",
        explanation:
          "The 10th Fibonacci number is 55.",
      },
    ],
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    // Write your code here

    return 0;
}`,
      javascript: `const fs = require("fs");

const n = Number(fs.readFileSync(0, "utf8").trim());

// Write your code here`,
      python: `n = int(input())

# Write your code here`,
    },
    testCases: [
      {
        input: "0",
        expectedOutput: "0",
      },
      {
        input: "1",
        expectedOutput: "1",
      },
      {
        input: "10",
        expectedOutput: "55",
      },
      {
        input: "40",
        expectedOutput: "102334155",
      },
    ],
    timeLimit: 2000,
    source: "manual",
    isActive: true,
  },

  {
    title: "Balanced Brackets",
    description:
      "Given a string containing only brackets (), {} and [], print YES if the brackets are balanced. Otherwise, print NO.",
    difficulty: "medium",
    constraints: [
      "1 <= length of string <= 100000",
      "The string contains only bracket characters",
    ],
    examples: [
      {
        input: "{[()]}",
        output: "YES",
        explanation:
          "Every opening bracket has a matching closing bracket in the correct order.",
      },
      {
        input: "{[(])}",
        output: "NO",
        explanation:
          "The brackets close in the wrong order.",
      },
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <stack>
using namespace std;

int main() {
    string brackets;
    cin >> brackets;

    // Write your code here

    return 0;
}`,
      javascript: `const fs = require("fs");

const brackets = fs.readFileSync(0, "utf8").trim();

// Write your code here`,
      python: `brackets = input().strip()

# Write your code here`,
    },
    testCases: [
      {
        input: "{[()]}",
        expectedOutput: "YES",
      },
      {
        input: "{[(])}",
        expectedOutput: "NO",
      },
      {
        input: "()[]{}",
        expectedOutput: "YES",
      },
      {
        input: "(((",
        expectedOutput: "NO",
      },
      {
        input: "([{}])",
        expectedOutput: "YES",
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
          returnDocument: "after",
          runValidators: true,
        }
      );
    }

    console.log(
      `${problems.length} coding problems added successfully`
    );
  } catch (error) {
    console.error(
      `Problem seeding failed: ${error.message}`
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedProblems();