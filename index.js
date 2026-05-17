const studentNames = students.map(s => s.name);

const activeStudents = students.filter(s => s.isActive);

const activeCount = students.filter(s => s.isActive).length;

const inactiveCount = students.filter(s => !s.isActive).length;

const maleCount = students.filter(s => s.gender === "Male").length;
const femaleCount = students.filter(s => s.gender === "Female").length;

const jsAbove70 = students.filter(s => s.marks.javascript > 70);

const jsBelow50 = students.filter(s => s.marks.javascript < 50);

const softwareStudents = students.filter(s => s.department === "Software Engineering");

const ageAbove21 = students.filter(s => s.age > 21);

const avgJsMark =
  students.reduce((acc, s) => acc + s.marks.javascript, 0) / students.length;

const highestJsStudent = students.reduce((a, b) =>
  a.marks.javascript > b.marks.javascript ? a : b
);

const lowestJsStudent = students.reduce((a, b) =>
  a.marks.javascript < b.marks.javascript ? a : b
);

const totalMarks = students.map(s => ({
  name: s.name,
  total:
    s.marks.javascript +
    s.marks.database +
    s.marks.networking
}));

const passedJs = students.filter(s => s.marks.javascript >= 50);

const failedJs = students.filter(s => s.marks.javascript < 50);

const withGrades = students.map(s => {
  let score = s.marks.javascript;
  let grade =
    score >= 80 ? "A" :
    score >= 70 ? "B" :
    score >= 60 ? "C" :
    score >= 50 ? "D" : "F";

  return { ...s, grade };
});

function searchStudent(name) {
  return students.filter(s =>
    s.name.toLowerCase().includes(name.toLowerCase())
  );
}

const dbAbove80 = students.filter(s => s.marks.database > 80).length;

const above70AllSubjects = students.filter(
  s =>
    s.marks.javascript > 70 &&
    s.marks.database > 70 &&
    s.marks.networking > 70
);

const deptCount = students.reduce((acc, s) => {
  acc[s.department] = (acc[s.department] || 0) + 1;
  return acc;
}, {});

const topDepartment = Object.entries(deptCount).sort((a, b) => b[1] - a[1])[0];

const sortedByJs = [...students].sort(
  (a, b) => b.marks.javascript - a.marks.javascript
);

const nameAndJs = students.map(s => ({
  name: s.name,
  javascript: s.marks.javascript
}));

const youngest = students.reduce((a, b) =>
  a.age < b.age ? a : b
);

const oldest = students.reduce((a, b) =>
  a.age > b.age ? a : b
);

function avgSingleStudent(student) {
  const m = student.marks;
  return (m.javascript + m.database + m.networking) / 3;
}

function isActive(student) {
  return student.isActive;
}

const jsBetween60And80 = students.filter(
  s => s.marks.javascript >= 60 && s.marks.javascript <= 80
);

const activeAbove75Js = students.filter(
  s => s.isActive && s.marks.javascript > 75
);

function studentReport(student) {
  const total =
    student.marks.javascript +
    student.marks.database +
    student.marks.networking;

  let grade =
    student.marks.javascript >= 80 ? "A" :
    student.marks.javascript >= 70 ? "B" :
    student.marks.javascript >= 60 ? "C" :
    student.marks.javascript >= 50 ? "D" : "F";

  return {
    name: student.name,
    age: student.age,
    department: student.department,
    isActive: student.isActive,
    marks: student.marks,
    total,
    grade
  };
}