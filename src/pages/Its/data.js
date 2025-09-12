// All data for the StatLearn application

export const contentData = {
  'intro-stats': {
    title: 'Introduction to Statistics',
    videoId: 'zlouNJHdmsE',
    notes: 'Statistics is the science of collecting, organizing, analyzing, and interpreting data to make informed decisions. It provides tools for understanding variability and uncertainty in real-world phenomena.'
  },
  'descriptive-stats': {
    title: 'Descriptive Statistics',
    videoId: 'MRqtXL2WX2M',
    notes: 'Descriptive statistics summarize and describe the main features of a dataset. Key measures include central tendency (mean, median, mode) and variability (variance, standard deviation, range).'
  },
  'probability-basics': {
    title: 'Probability Fundamentals',
    videoId: 'SrEmzdOT65s',
    notes: 'Probability is the mathematical study of chance and uncertainty. It provides the foundation for statistical inference and decision-making under uncertainty.'
  },
  'distributions': {
    title: 'Probability Distributions',
    videoId: 'j__Kredt7JY',
    notes: 'Probability distributions describe how probabilities are assigned to different outcomes. Understanding distributions is essential for modeling real-world phenomena.'
  },
  'sampling': {
    title: 'Sampling Theory',
    videoId: 'G5v15rDJfAo',
    notes: 'Sampling theory deals with selecting representative subsets from populations. Good sampling techniques ensure valid statistical inferences.'
  },
  'hypothesis-testing': {
    title: 'Hypothesis Testing',
    videoId: 'VK-rnA3-41c',
    notes: 'Hypothesis testing is a statistical method for making decisions about population parameters based on sample evidence. It involves formulating and testing claims about populations.'
  },
  'dashboard': {
    title: 'Learning Dashboard',
    videoId: 'zlouNJHdmsE',
    notes: 'Welcome to your Statistics & Probability learning dashboard. Here you can track your progress, view completed topics, and plan your study schedule.'
  },
  'favorites': {
    title: 'Favorite Topics',
    videoId: 'MRqtXL2WX2M',
    notes: 'Your bookmarked statistics and probability concepts. These are the topics you\'ve marked for quick reference and review.'
  },
  'quiz-basics': {
    title: 'Statistics Basics Quiz',
    videoId: 'SrEmzdOT65s',
    notes: 'Test your understanding of fundamental statistical concepts including measures of central tendency, variability, and basic probability.'
  },
  'advanced-quiz': {
    title: 'Advanced Statistics Quiz',
    videoId: 'j__Kredt7JY',
    notes: 'Challenge yourself with advanced topics in probability distributions, hypothesis testing, and statistical inference.'
  },
  'final-project': {
    title: 'Statistical Analysis Project',
    videoId: 'G5v15rDJfAo',
    notes: 'Apply your knowledge in a comprehensive project involving data collection, analysis, and interpretation using statistical methods.'
  }
};

export const knowledgeGraphNodes = [
  { 
    id: 'stat-1', 
    name: 'Descriptive Statistics', 
    type: 'concept', 
    x: 100, 
    y: 100,
    description: 'Methods for organizing, summarizing, and presenting data. Includes measures of central tendency (mean, median, mode) and measures of variability (range, variance, standard deviation).'
  },
  { 
    id: 'stat-2', 
    name: 'Mean & Median', 
    type: 'measure', 
    x: 200, 
    y: 50,
    description: 'Central tendency measures. Mean is the arithmetic average, while median is the middle value. Understanding when to use each measure is crucial for data analysis.'
  },
  { 
    id: 'stat-3', 
    name: 'Variance & Std Dev', 
    type: 'measure', 
    x: 200, 
    y: 150,
    description: 'Measures of spread that quantify how much data points deviate from the mean. Variance is average squared deviation; standard deviation is its square root.'
  },
  { 
    id: 'stat-4', 
    name: 'Probability Theory', 
    type: 'concept', 
    x: 350, 
    y: 100,
    description: 'Mathematical framework for quantifying uncertainty. Covers sample spaces, events, probability rules, and the foundation for statistical inference.'
  },
  { 
    id: 'stat-5', 
    name: 'Distributions', 
    type: 'theory', 
    x: 450, 
    y: 50,
    description: 'Probability distributions describe how probabilities are assigned to outcomes. Includes discrete (binomial, Poisson) and continuous (normal, exponential) distributions.'
  },
  { 
    id: 'stat-6', 
    name: 'Random Variables', 
    type: 'theory', 
    x: 450, 
    y: 150,
    description: 'Functions that assign numerical values to outcomes of random experiments. Can be discrete or continuous, with associated probability distributions.'
  },
  { 
    id: 'stat-7', 
    name: 'Hypothesis Testing', 
    type: 'method', 
    x: 300, 
    y: 250,
    description: 'Statistical method for making decisions about population parameters based on sample data. Involves null/alternative hypotheses, test statistics, and p-values.'
  },
  { 
    id: 'stat-8', 
    name: 'Confidence Intervals', 
    type: 'inference', 
    x: 400, 
    y: 300,
    description: 'Range of values that likely contains the true population parameter. Provides estimate uncertainty and is fundamental to statistical inference.'
  }
];

export const quizData = {
  'quiz-basics': {
    title: 'Statistics Basics Quiz',
    description: 'Test your understanding of fundamental statistical concepts',
    timeLimit: 30,
    questions: [
      {
        id: 1,
        question: 'What is the mean of the dataset: 2, 4, 6, 8, 10?',
        options: ['5', '6', '7', '8'],
        correct: 1,
        explanation: 'Mean = (2+4+6+8+10)/5 = 30/5 = 6'
      },
      {
        id: 2,
        question: 'Which measure of central tendency is least affected by outliers?',
        options: ['Mean', 'Median', 'Mode', 'Range'],
        correct: 1,
        explanation: 'The median is the middle value and is not affected by extreme values (outliers)'
      },
      {
        id: 3,
        question: 'What does a standard deviation of 0 indicate?',
        options: ['High variability', 'All values are the same', 'Normal distribution', 'Negative correlation'],
        correct: 1,
        explanation: 'When standard deviation is 0, it means all data points are identical (no variability)'
      },
      {
        id: 4,
        question: 'In a normal distribution, approximately what percentage of data falls within one standard deviation of the mean?',
        options: ['50%', '68%', '95%', '99.7%'],
        correct: 1,
        explanation: 'In a normal distribution, about 68% of data falls within one standard deviation of the mean'
      },
      {
        id: 5,
        question: 'What is the probability of getting heads on a fair coin flip?',
        options: ['0.25', '0.5', '0.75', '1.0'],
        correct: 1,
        explanation: 'A fair coin has equal probability for heads and tails, so P(heads) = 1/2 = 0.5'
      }
    ]
  },
  'advanced-quiz': {
    title: 'Advanced Statistics Quiz',
    description: 'Challenge yourself with advanced statistical concepts',
    timeLimit: 45,
    questions: [
      {
        id: 1,
        question: 'In hypothesis testing, what is a Type I error?',
        options: ['Rejecting a true null hypothesis', 'Accepting a false null hypothesis', 'Using wrong test statistic', 'Having too small sample size'],
        correct: 0,
        explanation: 'Type I error occurs when we reject the null hypothesis when it is actually true'
      },
      {
        id: 2,
        question: 'What is the Central Limit Theorem primarily about?',
        options: ['Population means', 'Sample variance', 'Distribution of sample means', 'Confidence intervals'],
        correct: 2,
        explanation: 'CLT states that the distribution of sample means approaches normal distribution as sample size increases'
      },
      {
        id: 3,
        question: 'In a 95% confidence interval, what does the 95% represent?',
        options: ['Probability the parameter is in the interval', 'Confidence in the method', 'Sample accuracy', 'Population coverage'],
        correct: 1,
        explanation: '95% represents our confidence in the method - if we repeated the process many times, 95% of intervals would contain the true parameter'
      },
      {
        id: 4,
        question: 'What assumption is required for a t-test?',
        options: ['Large sample size', 'Normal distribution', 'Equal variances', 'Independence'],
        correct: 1,
        explanation: 'The t-test assumes that the data comes from a normally distributed population'
      },
      {
        id: 5,
        question: 'In regression analysis, what does R² measure?',
        options: ['Correlation strength', 'Variance explained', 'Prediction accuracy', 'Slope significance'],
        correct: 1,
        explanation: 'R² measures the proportion of variance in the dependent variable explained by the independent variables'
      }
    ]
  }
};