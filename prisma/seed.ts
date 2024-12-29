import { studentsData } from "@/lib/data";
import { Day, PrismaClient, UserSex } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // SCHOOL
  const school = await prisma.school.create({
    data: {
      id: "88840a8d-82d5-48b0-8211-abb03e8aa077",
      name: "Lessons School",
      address: "Sarodha",
    },
  });

  // ADMIN
  const admins = await Promise.all([
    prisma.admin.create({
      data: {
        id: "admin1",
        username: "admin1",
        school: {
          connect: {
            id: school.id,
          },
        },
      },
    }),
    prisma.admin.create({
      data: {
        id: "admin2",
        username: "admin2",
        school: {
          connect: {
            id: school.id,
          },
        },
      },
    }),
  ]);

  // GRADES
  const grades = await Promise.all(
    Array.from({ length: 6 }, (_, i) =>
      prisma.grade.create({
        data: {
          level: i + 1,
          school: {
            connect: {
              id: school.id,
            },
          },
        },
      })
    )
  );

  // CLASSES
  const classes = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const randomGrade = grades[Math.floor(Math.random() * grades.length)];
      return prisma.class.create({
        data: {
          name: `${randomGrade.level}-${i + 1}A`,
          gradeId: randomGrade.id,
          capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
          schoolId: school.id,
        },
      });
    })
  );

  // SUBJECTS
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];

  const subjects = await Promise.all(
    subjectData.map((subject) =>
      prisma.subject.create({
        data: {
          ...subject,
          schoolId: school.id,
        },
      })
    )
  );

  // TEACHERS
  const tmap: any = [];
  const teachers = (
    await Promise.all(
      Array.from({ length: 15 }, (_, i) => {
        const randomSubject =
          subjects[Math.floor(Math.random() * subjects.length)];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        if (
          tmap.filter(
            (s: any) => s.c === randomClass.id && s.g === randomSubject.id
          )?.length === 0
        ) {
          tmap.push({ c: randomClass.id, g: randomSubject.id });
          return prisma.teacher.create({
            data: {
              username: `teacher${i + 1}`,
              name: `TName${i + 1}`,
              surname: `TSurname${i + 1}`,
              email: `teacher${i + 1}@example.com`,
              phone: `123-456-789${i + 1}`,
              address: `Address${i + 1}`,
              bloodType: "A+",
              sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
              subjects: { connect: [{ id: randomSubject.id }] },
              classes: { connect: [{ id: randomClass.id }] },
              birthday: new Date(
                new Date().setFullYear(new Date().getFullYear() - 30)
              ),
              schoolId: school.id,
            },
          });
        }
      })
    )
  ).filter(
    (teacher): teacher is Awaited<ReturnType<typeof prisma.teacher.create>> =>
      teacher !== undefined
  );

  // LESSONS
  const lmap: any = [];
  const lessons = (
    await Promise.all(
      Array.from({ length: 30 }, (_, i) => {
        const randomSubject =
          subjects[Math.floor(Math.random() * subjects.length)];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        if (
          lmap.filter(
            (s: any) => s.c === randomClass.id && s.s === randomSubject.id
          )?.length === 0
        ) {
          lmap.push({ c: randomClass.id, s: randomSubject.id });
          return prisma.lesson.create({
            data: {
              name: `Lesson${i + 1}`,
              day: Day[
                Object.keys(Day)[
                  Math.floor(Math.random() * Object.keys(Day).length)
                ] as keyof typeof Day
              ],
              startTime: new Date(
                new Date().setHours(new Date().getHours() + 1)
              ),
              endTime: new Date(new Date().setHours(new Date().getHours() + 3)),
              subjectId: randomSubject.id,
              classId: randomClass.id,
              teacherId: teachers[i % teachers.length].id,
              schoolId: school.id,
            },
          });
        }
      })
    )
  ).filter(
    (lesson): lesson is Awaited<ReturnType<typeof prisma.lesson.create>> =>
      lesson !== undefined
  );

  // PARENTS
  const parents = await Promise.all(
    Array.from({ length: 25 }, (_, i) =>
      prisma.parent.create({
        data: {
          username: `parentId${i + 1}`,
          name: `PName${i + 1}`,
          surname: `PSurname${i + 1}`,
          email: `parent${i + 1}@example.com`,
          phone: `123-456-789${i + 1}`,
          address: `Address${i + 1}`,
          schoolId: school.id,
        },
      })
    )
  );

  // STUDENTS
  const smap: any = [];
  const students = (
    await Promise.all(
      Array.from({ length: 50 }, (_, i) => {
        const randomGrade = grades[Math.floor(Math.random() * grades.length)];
        const randomParent =
          parents[Math.floor(Math.random() * parents.length)];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        if (
          smap.filter(
            (s: any) =>
              (s.c === randomClass.id && s.g === randomGrade.id) ||
              randomParent.id === s.p
          )?.length === 0
        ) {
          smap.push({
            c: randomClass.id,
            g: randomGrade.id,
            p: randomParent.id,
          });
          return prisma.student.create({
            data: {
              username: `student${i + 1}`,
              name: `SName${i + 1}`,
              surname: `SSurname${i + 1}`,
              email: `student${i + 1}@example.com`,
              phone: `987-654-321${i + 1}`,
              address: `Address${i + 1}`,
              bloodType: "O-",
              sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
              parentId: randomParent.id,
              gradeId: randomGrade.id,
              classId: randomClass.id,
              birthday: new Date(
                new Date().setFullYear(new Date().getFullYear() - 10)
              ),
              schoolId: school.id,
            },
          });
        }
      })
    )
  ).filter(
    (s): s is Awaited<ReturnType<typeof prisma.student.create>> =>
      s !== undefined
  );

  // EXAMS
  await Promise.all(
    Array.from({ length: 10 }, (_, i) => {
      const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];
      return prisma.exam.create({
        data: {
          title: `Exam ${i + 1}`,
          startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
          endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
          lessonId: randomLesson.id,
          schoolId: school.id,
        },
      });
    })
  );

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
