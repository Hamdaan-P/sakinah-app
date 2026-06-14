/**
 * Colour + icon helpers shared across SupportPage subcomponents.
 */

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Open':       return '#2196F3';
    case 'InProgress': return '#FF9800';
    case 'Resolved':   return '#4CAF50';
    case 'Closed':     return '#9E9E9E';
    default:           return '#7A7363';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Low':    return '#4CAF50';
    case 'Medium': return '#2196F3';
    case 'High':   return '#FF9800';
    case 'Urgent': return '#F44336';
    default:       return '#7A7363';
  }
}

export function getTutorialTypeColor(type: string): string {
  switch (type) {
    case 'Walkthrough': return '#00BCD4';
    case 'Article':     return '#4CAF50';
    case 'QuickTip':    return '#FFEB3B';
    default:            return '#7A7363';
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Beginner':     return '#4CAF50';
    case 'Intermediate': return '#FF9800';
    case 'Advanced':     return '#F44336';
    default:             return '#7A7363';
  }
}

export function getTutorialTypeIcon(type: string): string {
  switch (type) {
    case 'Walkthrough': return '👣';
    case 'Article':     return '📄';
    case 'QuickTip':    return '💡';
    default:            return '📖';
  }
}
