function getStatus(steps) {
    const values = Object.values(steps);
    const completed = values.filter(Boolean).length;
  
    if (completed === 0) return "planned";
    if (completed === values.length) return "done";
    return "ongoing";
  }
  
  module.exports = getStatus;