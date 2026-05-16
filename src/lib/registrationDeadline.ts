const REGISTRATION_DEADLINE = new Date(2026, 4, 17);
const GRACE_PERIOD_HOURS = 24;
const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const GRACE_DEADLINE = new Date(
  REGISTRATION_DEADLINE.getTime() + GRACE_PERIOD_HOURS * MS_PER_HOUR,
);

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getPlayerRegistrationDeadlineStatus(now = new Date()) {
  const today = startOfLocalDay(now);
  const daysRemaining = Math.ceil(
    (REGISTRATION_DEADLINE.getTime() - today.getTime()) / MS_PER_DAY,
  );
  const hoursRemaining = Math.max(
    0,
    Math.ceil((REGISTRATION_DEADLINE.getTime() - now.getTime()) / MS_PER_HOUR),
  );
  const graceHoursRemaining = Math.max(
    0,
    Math.ceil((GRACE_DEADLINE.getTime() - now.getTime()) / MS_PER_HOUR),
  );
  const inGracePeriod = daysRemaining <= 0 && graceHoursRemaining > 0;

  if (daysRemaining <= 0 && graceHoursRemaining <= 0) {
    return {
      deadlineLabel: "17 May 2026",
      daysRemaining: 0,
      hoursRemaining: 0,
      isClosed: true,
      message: "Player registration closed on 17 May 2026.",
    };
  }

  if (inGracePeriod) {
    const graceLabel =
      graceHoursRemaining === 1 ? "1 hour" : `${graceHoursRemaining} hours`;
    return {
      deadlineLabel: "17 May 2026",
      daysRemaining: 0,
      hoursRemaining: graceHoursRemaining,
      isClosed: false,
      message: `Grace period: Player registration closes in ${graceLabel}. Deadline was 17 May 2026.`,
    };
  }

  const hourLabel = hoursRemaining === 1 ? "1 hour" : `${hoursRemaining} hours`;
  const dayLabel = daysRemaining === 1 ? "1 day" : `${daysRemaining} days`;
  const timeLabel =
    hoursRemaining < 48 ? `${hourLabel} remaining` : `${dayLabel} remaining`;

  return {
    deadlineLabel: "17 May 2026",
    daysRemaining,
    hoursRemaining,
    isClosed: false,
    message: `Player registration closes on 17 May 2026. ${timeLabel}.`,
  };
}
