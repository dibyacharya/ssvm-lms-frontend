// Utility functions for parsing JSON and CSV question files

export const parseJSONQuestions = (jsonText) => {
  try {
    const questions = JSON.parse(jsonText);
    
    if (!Array.isArray(questions)) {
      throw new Error('JSON must contain an array of questions');
    }

    return questions.map((q, index) => ({
      id: `q_${Date.now()}_${index}`,
      question: q.question || q.Question || '',
      type: (q.type || q.Type || 'objective').toLowerCase(),
      points: q.points || q.Points || 10,
      options: q.type?.toLowerCase() === 'objective' || q.Type?.toLowerCase() === 'objective' 
        ? (q.options || q.Options || []) 
        : null,
      correctAnswer: q.correctAnswer || q.correct_answer || q.CorrectAnswer || null,
      bloomLevel: q.bloomLevel || q.bloom_level || q.BloomLevel || '',
      courseOutcome: q.courseOutcome || q.course_outcome || q.CourseOutcome || '',
      source: 'uploaded'
    }));
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error.message}`);
  }
};

export const parseCSVQuestions = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const question = {};

    headers.forEach((header, index) => {
      question[header] = values[index] || '';
    });

    const type = (question.type || 'objective').toLowerCase();
    const options = type === 'objective' 
      ? [
          question.option_a || question.optiona || '',
          question.option_b || question.optionb || '',
          question.option_c || question.optionc || '',
          question.option_d || question.optiond || ''
        ].filter(opt => opt)
      : null;

    questions.push({
      id: `q_${Date.now()}_${i}`,
      question: question.question || '',
      type: type,
      points: parseInt(question.points || question.points || 10),
      options: options,
      correctAnswer: question.correct_answer || question.correctanswer || question.correct || null,
      bloomLevel: question.bloom_level || question.bloomlevel || '',
      courseOutcome: question.course_outcome || question.courseoutcome || '',
      source: 'uploaded'
    });
  }

  return questions;
};

export const parseFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (extension === 'json') {
          resolve(parseJSONQuestions(text));
        } else if (extension === 'csv') {
          resolve(parseCSVQuestions(text));
        } else {
          reject(new Error(`Unsupported file type: ${extension}`));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Sample JSON format for reference
export const getSampleJSONFormat = () => {
  return JSON.stringify([
    {
      "question": "What is statistics?",
      "type": "subjective",
      "points": 20,
      "bloomLevel": "understand",
      "courseOutcome": "CO1"
    },
    {
      "question": "Which is a measure of central tendency?",
      "type": "objective",
      "points": 10,
      "options": ["Mean", "Range", "Variance", "Mode"],
      "correctAnswer": "Mean",
      "bloomLevel": "remember",
      "courseOutcome": "CO1"
    }
  ], null, 2);
};

// Sample CSV format for reference
export const getSampleCSVFormat = () => {
  return `question,type,option_a,option_b,option_c,option_d,correct_answer,points,bloom_level,course_outcome
What is statistics?,subjective,,,,,20,understand,CO1
Which is a measure of central tendency?,objective,Mean,Range,Variance,Mode,Mean,10,remember,CO1`;
};

