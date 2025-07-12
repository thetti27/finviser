# Risk Assessment System

## Overview

The Finviser platform includes a comprehensive risk assessment system designed to help users understand their risk tolerance and receive personalized investment recommendations. This system is based on established financial risk tolerance principles and provides a foundation for portfolio diversification and investment advice.

## Features

### 1. Multi-Step Questionnaire

The assessment consists of 10 carefully crafted questions covering key aspects of financial risk tolerance:

1. **Age** - Investment time horizon considerations
2. **Investment Horizon** - How long before needing the money
3. **Risk Tolerance** - Self-assessment of risk comfort level
4. **Financial Goals** - Primary investment objectives
5. **Emergency Fund** - Financial safety net assessment
6. **Income Stability** - Job security and income reliability
7. **Investment Experience** - Knowledge and experience level
8. **Loss Reaction** - Emotional response to market volatility
9. **Debt Level** - Current financial obligations
10. **Financial Knowledge** - Understanding of markets and investments

### 2. Weighted Scoring Algorithm

Each question has a different weight based on its importance to risk tolerance:

- **Risk Tolerance** (2.0x) - Most important factor
- **Loss Reaction** (2.2x) - Critical for emotional stability
- **Financial Goals** (1.8x) - Drives investment decisions
- **Investment Experience** (1.6x) - Knowledge affects comfort level
- **Financial Knowledge** (1.7x) - Understanding reduces anxiety
- **Investment Horizon** (1.5x) - Time allows for recovery
- **Income Stability** (1.4x) - Stable income supports risk-taking
- **Emergency Fund** (1.3x) - Safety net enables risk tolerance
- **Age** (1.2x) - Younger investors can take more risk
- **Debt Level** (1.1x) - Lower debt supports risk tolerance

### 3. Risk Profile Categories

#### Conservative Profile (Score: 0.0 - 1.8)
- **Focus**: Capital preservation and stable returns
- **Characteristics**:
  - Prefer stable, low-risk investments
  - Low tolerance for volatility
  - Suitable for short-term goals or retirement
  - Focus on bonds and stable dividend stocks
- **Recommended Allocation**:
  - Bonds: 60-80%
  - Stocks: 20-40%
  - Cash: 5-10%

#### Moderate Profile (Score: 1.8 - 2.4)
- **Focus**: Balanced growth and stability
- **Characteristics**:
  - Can handle some market volatility
  - Balanced approach to growth and stability
  - Suitable for medium-term goals
  - Diversified portfolio across asset classes
- **Recommended Allocation**:
  - Bonds: 40-60%
  - Stocks: 40-60%
  - Cash: 5-10%

#### Aggressive Profile (Score: 2.4 - 3.0)
- **Focus**: Maximum growth potential
- **Characteristics**:
  - High tolerance for volatility
  - Focus on maximum growth potential
  - Suitable for long-term goals
  - Higher allocation to stocks and alternative investments
- **Recommended Allocation**:
  - Bonds: 10-30%
  - Stocks: 70-90%
  - Cash: 0-5%

## User Interface

### Assessment Flow

1. **Introduction Page**
   - Explains the assessment process
   - Provides tips for honest answers
   - Shows progress indicator

2. **Question Interface**
   - Clean, intuitive question display
   - Radio button selection for answers
   - Progress bar showing completion
   - Navigation between questions

3. **Life Event Tracking** (Final Question)
   - Optional selection of major life events
   - Text area for additional notes
   - Context for reassessment recommendations

4. **Results Display**
   - Clear risk profile presentation
   - Detailed characteristics explanation
   - Recommended asset allocation
   - Options to retake or proceed to dashboard

### History and Tracking

- **Assessment History**: Complete record of all assessments
- **Trend Analysis**: Visual indicators of risk tolerance changes
- **Reassessment Reminders**: Automatic suggestions based on time or life events
- **Life Event Context**: Tracking of events that may affect risk tolerance

## API Endpoints

### Get Assessment Questions
```http
GET /api/risk-assessment/questions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [...],
    "totalQuestions": 10
  }
}
```

### Submit Assessment
```http
POST /api/risk-assessment/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "age",
      "answer": "31-40"
    }
  ],
  "lifeEvent": "marriage",
  "notes": "Recently married, planning for family"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Risk assessment completed successfully",
  "data": {
    "assessment": {
      "id": "...",
      "riskScore": 2.1,
      "riskProfile": "MODERATE",
      "completedAt": "2024-01-01T00:00:00.000Z"
    },
    "profile": {
      "name": "Moderate",
      "description": "...",
      "characteristics": [...],
      "recommendedAllocation": {...}
    }
  }
}
```

### Get Assessment History
```http
GET /api/risk-assessment/history
Authorization: Bearer <token>
```

### Get Current Profile
```http
GET /api/risk-assessment/current
Authorization: Bearer <token>
```

### Check Reassessment Need
```http
GET /api/risk-assessment/reassessment-check
Authorization: Bearer <token>
```

## Database Schema

### RiskAssessment Model
```prisma
model RiskAssessment {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  profileId     String?
  profile       Profile?      @relation(fields: [profileId], references: [id], onDelete: SetNull)
  
  // Assessment Data
  answers       Json          // Array of question-answer pairs
  riskScore     Decimal       @db.Decimal(5, 4)
  riskProfile   RiskTolerance
  
  // Context
  lifeEvent     String?       // e.g., "marriage", "job_change", "retirement"
  notes         String?
  
  // Timestamps
  completedAt   DateTime      @default(now())
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@map("risk_assessments")
}
```

### Profile Model Updates
```prisma
model Profile {
  // ... existing fields ...
  
  // Risk Assessment
  lastRiskAssessment DateTime?
  
  // Relationships
  riskAssessments   RiskAssessment[]
}
```

## Security and Privacy

### Data Protection
- All assessment data is encrypted at rest
- User authentication required for all operations
- Assessment history is private to each user
- No assessment data is shared with third parties

### Validation
- Comprehensive input validation for all answers
- Rate limiting on assessment submissions
- Secure storage of assessment results
- Audit trail for assessment changes

## Reassessment Guidelines

### When to Retake Assessment

#### Major Life Events
- Marriage or divorce
- Birth of a child
- Job change or career shift
- Retirement
- Significant inheritance
- Health issues

#### Financial Changes
- Significant increase/decrease in income
- Major purchase (home, business)
- Change in debt levels
- Shift in financial goals
- Market experience changes

#### Time-Based
- Annual review (recommended)
- Every 6 months for active investors
- After major market events

### Automatic Reminders
- Annual reassessment notifications
- Life event tracking suggestions
- Dashboard alerts for outdated assessments
- Email reminders for reassessment

## Integration with Portfolio Management

The risk assessment results integrate with the broader portfolio management system:

1. **Portfolio Recommendations**: Asset allocation based on risk profile
2. **Investment Suggestions**: Filtered investment options matching risk tolerance
3. **Rebalancing Alerts**: Notifications when portfolio drifts from target allocation
4. **Goal Planning**: Risk-adjusted goal setting and tracking

## Future Enhancements

### Planned Features
- **Dynamic Question Weighting**: Adjust weights based on user demographics
- **Market Condition Integration**: Consider current market conditions in recommendations
- **Behavioral Analysis**: Track actual investment behavior vs. stated preferences
- **Family Risk Assessment**: Joint assessment for couples and families
- **Scenario Analysis**: "What-if" analysis for different risk profiles

### Advanced Analytics
- **Risk Tolerance Evolution**: Machine learning to predict risk tolerance changes
- **Portfolio Performance Correlation**: Analysis of performance vs. risk profile
- **Market Stress Testing**: Simulate portfolio performance under different market conditions

## Best Practices

### For Users
1. **Answer Honestly**: Base answers on current financial situation, not aspirations
2. **Consider Emotions**: Think about how you'd actually react to market volatility
3. **Regular Updates**: Retake assessment when circumstances change
4. **Document Changes**: Note life events that affect risk tolerance

### For Developers
1. **Data Validation**: Always validate assessment inputs
2. **Error Handling**: Graceful handling of incomplete assessments
3. **Performance**: Optimize for quick assessment completion
4. **Accessibility**: Ensure assessment is accessible to all users

## Support and Troubleshooting

### Common Issues
- **Incomplete Assessments**: Users can save progress and return later
- **Score Calculation Errors**: Comprehensive validation and error handling
- **Profile Mismatches**: Clear explanation of profile characteristics
- **Reassessment Timing**: Flexible scheduling based on user needs

### Getting Help
- In-app help system with assessment guidance
- Support documentation for each question
- Contact support for technical issues
- Community forums for user discussions 