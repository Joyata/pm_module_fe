// taskUtils.js
export function distributeTasks(tasks, employees) {
  const sortedTasks = tasks.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority.charCodeAt(0) - a.priority.charCodeAt(0);
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  let workload = Object.fromEntries(employees.map((emp) => [emp.id, 0]));

  sortedTasks.forEach((task) => {
    const employeeId = Object.keys(workload).reduce((a, b) =>
      workload[a] < workload[b] ? a : b
    );
    task.assignedTo = employeeId;
    workload[employeeId] += task.estimatedTime;
  });

  return sortedTasks;
}

export function scheduleTasks(tasks, startDate, endDate) {
  const taskGroups = {
    A: tasks.filter((t) => t.frequency === "monthly"),
    B: tasks.filter((t) => t.frequency === "3 monthly"),
    C: tasks.filter((t) => t.frequency === "6 monthly"),
    D: tasks.filter((t) => t.frequency === "12 monthly"),
  };

  const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
  const scheduledTasks = [];

  for (const [frequency, groupTasks] of Object.entries(taskGroups)) {
    const frequencyDays = { A: 30, B: 90, C: 180, D: 365 }[frequency];
    const tasksPerDay = groupTasks.length / (totalDays / frequencyDays);

    let currentDate = new Date(startDate);
    let taskCounter = 0;

    while (currentDate <= endDate) {
      const tasksToSchedule =
        Math.floor(taskCounter + tasksPerDay) - Math.floor(taskCounter);

      for (let i = 0; i < tasksToSchedule && groupTasks.length > 0; i++) {
        const task = groupTasks.shift();
        scheduledTasks.push({
          ...task,
          start: new Date(currentDate),
          end: new Date(
            currentDate.getTime() + task.estimatedTime * 60 * 60 * 1000
          ),
        });
      }

      taskCounter += tasksPerDay;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return scheduledTasks;
}
