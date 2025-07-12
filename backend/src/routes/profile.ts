import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get detailed profile information
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    res.json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Update profile information
router.put('/', [
  authenticateToken,
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number must be valid'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  body('zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code must be less than 20 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),
  body('riskTolerance')
    .optional()
    .isIn(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'])
    .withMessage('Risk tolerance must be CONSERVATIVE, MODERATE, or AGGRESSIVE'),
  body('investmentGoals')
    .optional()
    .isArray()
    .withMessage('Investment goals must be an array'),
  body('annualIncome')
    .optional()
    .isNumeric()
    .withMessage('Annual income must be a number'),
  body('netWorth')
    .optional()
    .isNumeric()
    .withMessage('Net worth must be a number'),
  body('businessName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Business name must be less than 200 characters'),
  body('businessType')
    .optional()
    .isIn(['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLC', 'CORPORATION', 'NON_PROFIT'])
    .withMessage('Invalid business type'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  body('timezone')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Timezone must be less than 50 characters'),
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be a valid language code'),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const {
      dateOfBirth,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      country,
      riskTolerance,
      investmentGoals,
      annualIncome,
      netWorth,
      businessName,
      businessType,
      currency,
      timezone,
      language,
    } = req.body;

    // Check if profile exists, create if not
    let profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: req.user.id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          phoneNumber,
          address,
          city,
          state,
          zipCode,
          country,
          riskTolerance,
          investmentGoals,
          annualIncome: annualIncome ? parseFloat(annualIncome) : null,
          netWorth: netWorth ? parseFloat(netWorth) : null,
          businessName,
          businessType,
          currency,
          timezone,
          language,
        },
      });
    } else {
      profile = await prisma.profile.update({
        where: { userId: req.user.id },
        data: {
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(zipCode !== undefined && { zipCode }),
          ...(country !== undefined && { country }),
          ...(riskTolerance && { riskTolerance }),
          ...(investmentGoals && { investmentGoals }),
          ...(annualIncome !== undefined && { annualIncome: parseFloat(annualIncome) }),
          ...(netWorth !== undefined && { netWorth: parseFloat(netWorth) }),
          ...(businessName !== undefined && { businessName }),
          ...(businessType && { businessType }),
          ...(currency && { currency }),
          ...(timezone && { timezone }),
          ...(language && { language }),
        },
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Complete risk assessment
router.post('/risk-assessment', [
  authenticateToken,
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Questions array is required'),
  body('questions.*.id')
    .isString()
    .withMessage('Question ID is required'),
  body('questions.*.answer')
    .isString()
    .withMessage('Question answer is required'),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const { questions } = req.body;

    // Simple risk assessment algorithm
    let riskScore = 0;
    const totalQuestions = questions.length;

    questions.forEach((question: any) => {
      switch (question.id) {
        case 'age':
          if (question.answer === '18-30') riskScore += 3;
          else if (question.answer === '31-50') riskScore += 2;
          else riskScore += 1;
          break;
        case 'investment_horizon':
          if (question.answer === '1-3_years') riskScore += 1;
          else if (question.answer === '3-10_years') riskScore += 2;
          else riskScore += 3;
          break;
        case 'risk_tolerance':
          if (question.answer === 'conservative') riskScore += 1;
          else if (question.answer === 'moderate') riskScore += 2;
          else riskScore += 3;
          break;
        case 'financial_goals':
          if (question.answer === 'preserve_capital') riskScore += 1;
          else if (question.answer === 'moderate_growth') riskScore += 2;
          else riskScore += 3;
          break;
        case 'emergency_fund':
          if (question.answer === 'less_than_3_months') riskScore += 1;
          else if (question.answer === '3-6_months') riskScore += 2;
          else riskScore += 3;
          break;
        default:
          break;
      }
    });

    // Calculate risk tolerance based on score
    const averageScore = riskScore / totalQuestions;
    let riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

    if (averageScore <= 1.5) {
      riskTolerance = 'CONSERVATIVE';
    } else if (averageScore <= 2.5) {
      riskTolerance = 'MODERATE';
    } else {
      riskTolerance = 'AGGRESSIVE';
    }

    // Update or create profile with risk assessment
    let profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: req.user.id,
          riskTolerance,
        },
      });
    } else {
      profile = await prisma.profile.update({
        where: { userId: req.user.id },
        data: { riskTolerance },
      });
    }

    res.json({
      success: true,
      message: 'Risk assessment completed successfully',
      data: {
        riskTolerance,
        riskScore: averageScore,
        profile,
      },
    });
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router; 