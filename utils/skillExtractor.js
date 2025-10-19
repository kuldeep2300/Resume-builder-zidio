// Extract skills from achievement descriptions and metadata
const extractSkills = (achievements) => {
  const skillSet = new Set();

  achievements.forEach((achievement) => {
    // Add skills from skills array
    if (achievement.skills && achievement.skills.length > 0) {
      achievement.skills.forEach((skill) => skillSet.add(skill));
    }

    // Extract from metadata techStack (for projects)
    if (achievement.metadata && achievement.metadata.techStack) {
      achievement.metadata.techStack.forEach((tech) => skillSet.add(tech));
    }

    // Extract from description using basic keyword matching
    if (achievement.description) {
      const commonSkills = [
        'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 
        'Express', 'MongoDB', 'SQL', 'PostgreSQL', 'AWS', 'Docker',
        'Kubernetes', 'Git', 'HTML', 'CSS', 'TypeScript', 'Vue',
        'Angular', 'Django', 'Flask', 'FastAPI', 'Machine Learning',
        'Data Science', 'TensorFlow', 'PyTorch', 'Redux', 'Next.js',
        'Tailwind', 'Bootstrap', 'REST API', 'GraphQL', 'Firebase'
      ];

      commonSkills.forEach((skill) => {
        if (achievement.description.toLowerCase().includes(skill.toLowerCase())) {
          skillSet.add(skill);
        }
      });
    }
  });

  return Array.from(skillSet);
};

module.exports = { extractSkills };