const REGISTRATION_DEADLINE = new Date(2026, 4, 17);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getPlayerRegistrationDeadlineStatus(now = new Date()) {
  const today = startOfLocalDay(now);
  const daysRemaining = Math.ceil(
    (REGISTRATION_DEADLINE.getTime() - today.getTime()) / MS_PER_DAY,
  );

  if (daysRemaining < 0) {
    return {
      deadlineLabel: "17 May 2026",
      daysRemaining: 0,
      isClosed: true,
      message: "Player registration closed on 17 May 2026.",
    };
  }

  return {
    deadlineLabel: "17 May 2026",
    daysRemaining,
    isClosed: false,
    message: `Player registration closes on 17 May 2026. ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining.`,
  };
}
