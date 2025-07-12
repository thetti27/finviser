import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Risk assessment questions with scoring weights
const RISK_ASSESSMENT_QUESTIONS = [
  {
    id: 'age',
    question: 'What is your age?',
    type: 'single_choice',
    options: [
      { value: '18-30', label: '18-30 years', score: 3 },
      { value: '31-40', label: '31-40 years', score: 2 },
      { value: '41-50', label: '41-50 years', score: 2 },
      { value: '51-60', label: '51-60 years', score: 1 },
      { value: '60+', label: '60+ years', score: 1 }
    ],
    weight: 1.2
  },
  {
    id: 'investment_horizon',
    question: 'How long do you plan to invest before needing the money?',
    type: 'single_choice',
    options: [
      { value: '1-3_years', label: '1-3 years', score: 1 },
      { value: '3-5_years', label: '3-5 years', score: 2 },
      { value: '5-10_years', label: '5-10 years', score: 2.5 },
      { value: '10-20_years', label: '10-20 years', score: 3 },
      { value: '20+_years', label: '20+ years', score: 3 }
    ],
    weight: 1.5
  },
  {
    id: 'risk_tolerance',
    question: 'How would you describe your risk tolerance?',
    type: 'single_choice',
    options: [
      { value: 'conservative', label: 'Conservative - I prefer stable, low-risk investments', score: 1 },
      { value: 'moderate', label: 'Moderate - I can handle some ups and downs', score: 2 },
      { value: 'aggressive', label: 'Aggressive - I can handle significant volatility for higher returns', score: 3 }
    ],
    weight: 2.0
  },
  {
    id: 'financial_goals',
    question: 'What is your primary financial goal?',
    type: 'single_choice',
    options: [
      { value: 'preserve_capital', label: 'Preserve capital and maintain purchasing power', score: 1 },
      { value: 'moderate_growth', label: 'Moderate growth with some risk', score: 2 },
      { value: 'maximum_growth', label: 'Maximum growth potential, accepting higher risk', score: 3 }
    ],
    weight: 1.8
  },
  {
    id: 'emergency_fund',
    question: 'How much emergency savings do you have?',
    type: 'single_choice',
    options: [
      { value: 'less_than_3_months', label: 'Less than 3 months of expenses', score: 1 },
      { value: '3-6_months', label: '3-6 months of expenses', score: 2 },
      { value: '6-12_months', label: '6-12 months of expenses', score: 2.5 },
      { value: '12+_months', label: '12+ months of expenses', score: 3 }
    ],
    weight: 1.3
  },
  {
    id: 'income_stability',
    question: 'How stable is your current income?',
    type: 'single_choice',
    options: [
      { value: 'very_stable', label: 'Very stable (government job, tenured position)', score: 3 },
      { value: 'stable', label: 'Stable (established company, good job security)', score: 2.5 },
      { value: 'moderate', label: 'Moderate (some uncertainty but generally secure)', score: 2 },
      { value: 'unstable', label: 'Unstable (contract work, commission-based, new business)', score: 1 }
    ],
    weight: 1.4
  },
  {
    id: 'investment_experience',
    question: 'What is your experience with investments?',
    type: 'single_choice',
    options: [
      { value: 'none', label: 'No experience', score: 1 },
      { value: 'beginner', label: 'Beginner (some basic knowledge)', score: 1.5 },
      { value: 'intermediate', label: 'Intermediate (regular investor)', score: 2.5 },
      { value: 'advanced', label: 'Advanced (experienced investor)', score: 3 }
    ],
    weight: 1.6
  },
  {
    id: 'loss_reaction',
    question: 'How would you react if your investment lost 20% of its value in a short period?',
    type: 'single_choice',
    options: [
      { value: 'panic_sell', label: 'I would panic and sell immediately', score: 1 },
      { value: 'concerned_sell', label: 'I would be concerned and consider selling', score: 1.5 },
      { value: 'hold_wait', label: 'I would hold and wait for recovery', score: 2.5 },
      { value: 'buy_more', label: 'I would see it as a buying opportunity', score: 3 }
    ],
    weight: 2.2
  },
  {
    id: 'debt_level',
    question: 'What is your current debt situation?',
    type: 'single_choice',
    options: [
      { value: 'high_debt', label: 'High debt (credit cards, loans >50% of income)', score: 1 },
      { value: 'moderate_debt', label: 'Moderate debt (mortgage, some loans)', score: 2 },
      { value: 'low_debt', label: 'Low debt (just mortgage or car payment)', score: 2.5 },
      { value: 'no_debt', label: 'No significant debt', score: 3 }
    ],
    weight: 1.1
  },
  {
    id: 'financial_knowledge',
    question: 'How would you rate your knowledge of financial markets and investments?',
    type: 'single_choice',
    options: [
      { value: 'none', label: 'No knowledge', score: 1 },
      { value: 'basic', label: 'Basic understanding', score: 1.5 },
      { value: 'good', label: 'Good understanding', score: 2.5 },
      { value: 'expert', label: 'Expert level', score: 3 }
    ],
    weight: 1.7
  }
];

// Risk profile categories
const RISK_PROFILES = {
  CONSERVATIVE: {
    name: 'Conservative',
    description: 'You prefer stable, low-risk investments with predictable returns.',
    scoreRange: { min: 0, max: 1.8 },
    characteristics: [
      'Focus on capital preservation',
      'Prefer bonds and stable dividend stocks',
      'Low tolerance for volatility',
      'Suitable for short-term goals or retirement'
    ],
    recommendedAllocation: {
      bonds: '60-80%',
      stocks: '20-40%',
      cash: '5-10%'
    }
  },
  MODERATE: {
    name: 'Moderate',
    description: 'You can handle some market volatility for balanced growth potential.',
    scoreRange: { min: 1.8, max: 2.4 },
    characteristics: [
      'Balanced approach to growth and stability',
      'Diversified portfolio across asset classes',
      'Moderate tolerance for volatility',
      'Suitable for medium-term goals'
    ],
    recommendedAllocation: {
      bonds: '40-60%',
      stocks: '40-60%',
      cash: '5-10%'
    }
  },
  AGGRESSIVE: {
    name: 'Aggressive',
    description: 'You can handle significant volatility for maximum growth potential.',
    scoreRange: { min: 2.4, max: 3.0 },
    characteristics: [
      'Focus on maximum growth potential',
      'Higher allocation to stocks and alternative investments',
      'High tolerance for volatility',
      'Suitable for long-term goals'
    ],
    recommendedAllocation: {
      bonds: '10-30%',
      stocks: '70-90%',
      cash: '0-5%'
    }
  }
};

// Calculate risk score from answers
const calculateRiskScore = (answers: any[]): number => {
  let totalScore = 0;
  let totalWeight = 0;

  answers.forEach(answer => {
    const question = RISK_ASSESSMENT_QUESTIONS.find(q => q.id === answer.questionId);
    if (question) {
      const option = question.options.find(opt => opt.value === answer.answer);
      if (option) {
        totalScore += option.score * question.weight;
        totalWeight += question.weight;
      }
    }
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

// Determine risk profile from score
const determineRiskProfile = (score: number): string => {
  if (score <= RISK_PROFILES.CONSERVATIVE.scoreRange.max) {
    return 'CONSERVATIVE';
  } else if (score <= RISK_PROFILES.MODERATE.scoreRange.max) {
    return 'MODERATE';
  } else {
    return 'AGGRESSIVE';
  }
};

// Get risk assessment questions
router.get('/questions', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    res.json({
      success: true,
      data: {
        questions: RISK_ASSESSMENT_QUESTIONS,
        totalQuestions: RISK_ASSESSMENT_QUESTIONS.length
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Submit risk assessment
router.post('/submit', [
  authenticateToken,
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers array is required with at least one answer'),
  body('answers.*.questionId')
    .isString()
    .withMessage('Question ID is required'),
  body('answers.*.answer')
    .isString()
    .withMessage('Answer is required'),
  body('lifeEvent')
    .optional()
    .isString()
    .withMessage('Life event must be a string'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { answers, lifeEvent, notes } = req.body;

    // Calculate risk score
    const riskScore = calculateRiskScore(answers);
    const riskProfile = determineRiskProfile(riskScore);
    const profileDetails = RISK_PROFILES[riskProfile as keyof typeof RISK_PROFILES];

    // Store assessment results
    const assessment = await prisma.riskAssessment.create({
      data: {
        userId: req.user.id,
        answers: answers,
        riskScore: riskScore,
        riskProfile: riskProfile,
        lifeEvent: lifeEvent || null,
        notes: notes || null,
        completedAt: new Date()
      }
    });

    // Update user profile with new risk tolerance
    await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: {
        riskTolerance: riskProfile,
        lastRiskAssessment: new Date()
      },
      create: {
        userId: req.user.id,
        riskTolerance: riskProfile,
        lastRiskAssessment: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Risk assessment completed successfully',
      data: {
        assessment: {
          id: assessment.id,
          riskScore: riskScore,
          riskProfile: riskProfile,
          completedAt: assessment.completedAt
        },
        profile: {
          name: profileDetails.name,
          description: profileDetails.description,
          characteristics: profileDetails.characteristics,
          recommendedAllocation: profileDetails.recommendedAllocation
        }
      }
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's risk assessment history
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const assessments = await prisma.riskAssessment.findMany({
      where: { userId: req.user.id },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        riskScore: true,
        riskProfile: true,
        lifeEvent: true,
        notes: true,
        completedAt: true
      }
    });

    res.json({
      success: true,
      data: {
        assessments: assessments.map(assessment => ({
          ...assessment,
          profile: RISK_PROFILES[assessment.riskProfile as keyof typeof RISK_PROFILES]
        }))
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get current risk profile
router.get('/current', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      select: {
        riskTolerance: true,
        lastRiskAssessment: true
      }
    });

    if (!profile || !profile.riskTolerance) {
      return res.status(404).json({
        success: false,
        error: 'No risk assessment found'
      });
    }

    const profileDetails = RISK_PROFILES[profile.riskTolerance as keyof typeof RISK_PROFILES];

    res.json({
      success: true,
      data: {
        riskProfile: profile.riskTolerance,
        lastAssessment: profile.lastRiskAssessment,
        profile: profileDetails
      }
    });
  } catch (error) {
    console.error('Get current profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Check if reassessment is recommended
router.get('/reassessment-check', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      select: {
        riskTolerance: true,
        lastRiskAssessment: true
      }
    });

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

    let shouldReassess = false;
    let reason = '';

    if (!profile || !profile.lastRiskAssessment) {
      shouldReassess = true;
      reason = 'No previous assessment found';
    } else if (profile.lastRiskAssessment < oneYearAgo) {
      shouldReassess = true;
      reason = 'Annual reassessment recommended';
    } else if (profile.lastRiskAssessment < sixMonthsAgo) {
      shouldReassess = true;
      reason = 'Consider reassessment due to time elapsed';
    }

    res.json({
      success: true,
      data: {
        shouldReassess,
        reason,
        lastAssessment: profile?.lastRiskAssessment,
        currentProfile: profile?.riskTolerance
      }
    });
  } catch (error) {
    console.error('Reassessment check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 