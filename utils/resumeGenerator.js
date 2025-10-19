const { extractSkills } = require('./skillExtractor');

// Generate resume summary based on achievements
const generateSummary = (user, achievements) => {
  const achievementCounts = {
    hackathon: 0,
    course: 0,
    internship: 0,
    project: 0,
    certification: 0,
  };

  achievements.forEach((achievement) => {
    if (achievementCounts[achievement.type] !== undefined) {
      achievementCounts[achievement.type]++;
    }
  });

  const totalAchievements = achievements.length;
  const skills = extractSkills(achievements);
  const skillCount = skills.length;

  let summary = `Motivated professional with ${totalAchievements} verified achievements. `;

  if (achievementCounts.internship > 0) {
    summary += `Completed ${achievementCounts.internship} internship${achievementCounts.internship > 1 ? 's' : ''}. `;
  }

  if (achievementCounts.hackathon > 0) {
    summary += `Participated in ${achievementCounts.hackathon} hackathon${achievementCounts.hackathon > 1 ? 's' : ''}. `;
  }

  if (achievementCounts.project > 0) {
    summary += `Built ${achievementCounts.project} project${achievementCounts.project > 1 ? 's' : ''}. `;
  }

  if (achievementCounts.course > 0) {
    summary += `Completed ${achievementCounts.course} course${achievementCounts.course > 1 ? 's' : ''}. `;
  }

  if (skillCount > 0) {
    summary += `Proficient in ${skillCount}+ technologies including ${skills.slice(0, 3).join(', ')}.`;
  }

  return summary;
};

// Calculate resume completeness percentage
const calculateCompleteness = (resume, user) => {
  let score = 0;

  // Personal info (30 points)
  if (user.name) score += 5;
  if (user.email) score += 5;
  if (user.phone) score += 5;
  if (user.location) score += 5;
  if (user.linkedin) score += 5;
  if (user.github) score += 5;

  // Summary (10 points)
  if (resume.summary && resume.summary.length > 50) score += 10;

  // Skills (20 points)
  if (resume.skills && resume.skills.length > 0) {
    score += Math.min(20, resume.skills.length * 2);
  }

  // Achievements (40 points)
  if (resume.achievements && resume.achievements.length > 0) {
    score += Math.min(40, resume.achievements.length * 10);
  }

  return Math.min(100, score);
};

module.exports = {
  generateSummary,
  calculateCompleteness,
};