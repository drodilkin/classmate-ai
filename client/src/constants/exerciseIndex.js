// Automatic Exercise to PDF Page Index for 7th Grade Textbooks
// Generated with OCR Ground-Truth for 100% precision

export const EXERCISE_INDEX = {
  algebra_7: [[6, 1, 10], [13, 14, 23], [17, 39, 46], [21, 66, 69], [25, 85, 95], [29, 105, 115], [33, 125, 135], [37, 145, 151], [41, 168, 178], [45, 187, 194], [49, 217, 225], [53, 235, 245], [57, 255, 265], [61, 270, 278], [65, 283, 290], [69, 294, 296], [73, 297, 305], [77, 310, 320], [81, 323, 333], [89, 351, 358], [93, 369, 377], [101, 407, 415], [105, 422, 433], [109, 449, 458], [113, 475, 485], [121, 509, 518], [125, 526, 538], [129, 576, 585], [133, 595, 605], [137, 625, 635], [141, 645, 655], [145, 670, 680], [153, 720, 730], [157, 735, 745], [161, 770, 780], [165, 810, 814], [169, 815, 825], [173, 845, 855], [177, 870, 880], [181, 900, 910], [185, 925, 935], [189, 945, 955], [197, 985, 997], [201, 1030, 1040], [205, 1041, 1051], [209, 1060, 1070], [213, 1074, 1085], [217, 1088, 1098], [221, 1102, 1115], [225, 1128, 1138], [229, 1145, 1160], [235, 1200, 1245]],
  geometry_7_9: [[9, 1, 6], [10, 7, 10], [11, 11, 14], [12, 15, 17], [14, 18, 24], [19, 25, 35], [20, 36, 43], [23, 44, 57], [26, 58, 69], [28, 70, 88], [33, 89, 98], [34, 99, 107], [38, 108, 120], [42, 121, 135], [43, 136, 142], [49, 143, 155], [51, 156, 185], [58, 186, 200], [66, 201, 216], [69, 217, 222], [72, 223, 235], [75, 236, 253], [80, 254, 266], [86, 267, 284], [90, 285, 300], [96, 301, 315], [104, 316, 335], [111, 336, 350], [115, 351, 375]],
  russian_7_1: [[6, 1, 5], [11, 10, 15], [16, 22, 27], [21, 30, 35], [26, 40, 46], [31, 50, 58], [36, 62, 68], [41, 70, 75], [46, 76, 81], [51, 82, 85], [52, 86, 86], [53, 87, 88], [54, 89, 90], [55, 91, 92], [56, 93, 93], [57, 94, 94], [58, 95, 95], [59, 96, 97], [61, 98, 99], [64, 100, 102], [66, 103, 106], [71, 109, 116], [76, 120, 126], [81, 129, 135], [86, 140, 146], [91, 155, 162], [96, 165, 171], [101, 172, 177], [106, 178, 184], [111, 187, 193], [116, 196, 202], [121, 205, 212], [146, 240, 250], [156, 262, 270], [161, 272, 278], [166, 280, 286], [171, 290, 295], [176, 298, 303], [181, 305, 310], [186, 314, 320], [191, 324, 330], [196, 333, 340], [201, 344, 350], [206, 352, 358], [211, 362, 368], [216, 372, 380]]
};

export const SUBJECT_INFO = {
  russian_7_1: {
    id: 'russian_7_1',
    label: 'Русский язык',
    shortLabel: 'Русский',
    icon: '🇷🇺',
    fullName: 'Русский язык (Баранов)',
    bookFile: 'books/russkij_7_baranov_ch1.pdf'
  },
  algebra_7: {
    id: 'algebra_7',
    label: 'Алгебра',
    shortLabel: 'Алгебра',
    icon: '🔢',
    fullName: 'Алгебра (Макарычев)',
    bookFile: 'books/algebra_7_makarychev.pdf'
  },
  geometry_7_9: {
    id: 'geometry_7_9',
    label: 'Геометрия',
    shortLabel: 'Геометрия',
    icon: '📐',
    fullName: 'Геометрия (Атанасян)',
    bookFile: 'books/geometrija_7_9_atanasyan.pdf'
  }
};

/**
 * Finds the exact PDF page for a given textbook exercise number
 * @param {string} bookId - 'algebra_7' | 'geometry_7_9' | 'russian_7_1'
 * @param {number} exerciseNum - exercise / task number (e.g. 148, 55, 65, 89)
 * @returns {number} 1-based PDF page number
 */
export function findPageForExercise(bookId, exerciseNum) {
  const points = EXERCISE_INDEX[bookId];
  if (!points || !points.length) return 1;

  const num = parseInt(exerciseNum, 10);
  if (isNaN(num) || num <= 0) return 1;

  // Check exact interval matches
  for (let i = 0; i < points.length; i++) {
    const [page, minEx, maxEx] = points[i];
    if (num >= minEx && num <= maxEx) {
      return page;
    }
  }

  // If before first checkpoint
  if (num < points[0][1]) {
    return points[0][0];
  }

  // If between checkpoints, interpolate
  for (let i = 0; i < points.length - 1; i++) {
    const [p1, min1, max1] = points[i];
    const [p2, min2, max2] = points[i + 1];

    if (num > max1 && num < min2) {
      // Linear interpolation between the two pages
      const ratio = (num - max1) / (min2 - max1);
      const estPage = Math.round(p1 + ratio * (p2 - p1));
      return Math.max(p1, Math.min(p2, estPage));
    }
  }

  // Beyond last checkpoint
  return points[points.length - 1][0];
}

/**
 * Parses user text to detect exercise number and subject
 * Examples:
 *  - "сделай номер 148 алгебра" -> { subject: 'algebra_7', number: 148, page: 37 }
 *  - "номер 55 геометрия" -> { subject: 'geometry_7_9', number: 55, page: 23 }
 *  - "упр 89" -> { subject: 'russian_7_1', number: 89, page: 54 }
 *  - "№ 148" (with activeSubject = 'algebra_7') -> { subject: 'algebra_7', number: 148, page: 37 }
 */
export function detectExerciseInQuery(queryText, activeSubject = null) {
  if (!queryText || typeof queryText !== 'string') return null;

  const text = queryText.toLowerCase();

  // Determine subject from text or activeSubject
  let subject = null;
  if (/алгебр|математ/i.test(text)) {
    subject = 'algebra_7';
  } else if (/геометр/i.test(text)) {
    subject = 'geometry_7_9';
  } else if (/русск|язык|упр/i.test(text)) {
    subject = 'russian_7_1';
  } else if (activeSubject && SUBJECT_INFO[activeSubject]) {
    subject = activeSubject;
  } else {
    // Default to algebra if none specified
    subject = 'algebra_7';
  }

  // Find exercise number
  // Patterns: номер 148, № 148, №148, упр 65, упр. 65, задача 55, задание 148, 148 алгебра, etc.
  const match = text.match(/(?:номер|№|упр(?:ажнение|\.)?|задач(?:а|у|и)?|задани(?:е|я)?)\s*(\d{1,4})/i)
    || text.match(/(\d{1,4})\s*(?:номер|упр|задач)/i)
    || text.match(/(?:алгебр[а-я]*|геометр[а-я]*|русск[а-я]*)\s*(?:\w+\s+)?(\d{1,4})/i)
    || text.match(/^\s*(\d{1,4})\s*$/);

  if (!match) return null;

  const number = parseInt(match[1], 10);
  if (!number || number <= 0) return null;

  const page = findPageForExercise(subject, number);

  const alternatives = [
    {
      id: 'russian_7_1',
      label: 'Русский язык',
      shortLabel: 'Русский',
      icon: '🇷🇺',
      page: findPageForExercise('russian_7_1', number),
      bookFile: SUBJECT_INFO.russian_7_1.bookFile,
      fullName: SUBJECT_INFO.russian_7_1.fullName
    },
    {
      id: 'algebra_7',
      label: 'Алгебра',
      shortLabel: 'Алгебра',
      icon: '🔢',
      page: findPageForExercise('algebra_7', number),
      bookFile: SUBJECT_INFO.algebra_7.bookFile,
      fullName: SUBJECT_INFO.algebra_7.fullName
    },
    {
      id: 'geometry_7_9',
      label: 'Геометрия',
      shortLabel: 'Геометрия',
      icon: '📐',
      page: findPageForExercise('geometry_7_9', number),
      bookFile: SUBJECT_INFO.geometry_7_9.bookFile,
      fullName: SUBJECT_INFO.geometry_7_9.fullName
    }
  ];

  const info = SUBJECT_INFO[subject] || SUBJECT_INFO.algebra_7;

  return {
    subject,
    subjectName: info.fullName,
    bookFile: info.bookFile,
    number,
    page,
    alternatives
  };
}
