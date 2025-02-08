# **FastJobHunter Technical Specification v0.2**

## **System Architecture**

### **Infrastructure**
- **Frontend**: Next.js (App Router, TypeScript, Tailwind CSS, ShadCN for UI components)
- **Backend**: Next.js API Routes + Edge Functions
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Hosting**: Vercel (Frontend & API), Supabase (Database)
- **Authentication**: Clerk (OAuth, JWT, Multi-provider login)
- **Payments**: Stripe (Credit-based system)
- **AI Processing**: OpenAI (GPT-4 Turbo, Caching for optimized cost)
- **Security & Infrastructure Protection**: Cloudflare (DDoS protection, CDN, WAF)
- **Monitoring**: Sentry (Error logging), Datadog (Performance monitoring)
- **CI/CD**: GitHub Actions for automated testing, builds, and deployments

---

## **Database Schema**

### **User Management**
```sql
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    credits_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Credit Transactions**
```sql
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(user_id),
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- 'purchase', 'usage', 'refund'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Usage Tracking**
```sql
CREATE TABLE usage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(user_id),
    feature_type TEXT NOT NULL, -- 'resume', 'cover_letter', 'linkedin'
    credits_used INTEGER NOT NULL,
    input_hash TEXT, -- Used for caching similar AI requests
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **System Logs**
```sql
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(user_id),
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## **API Endpoints**

### **Authentication**
- `GET /api/auth/session` → Retrieves current session info (Clerk-based)
- `POST /api/auth/callback` → Handles authentication callback

### **Credits & Payments**
- `GET /api/credits/balance` → Returns user's current credit balance
- `POST /api/credits/purchase` → Initiates credit purchase via Stripe
- `POST /api/webhook/stripe` → Stripe webhook handler

### **AI Processing**
- `POST /api/optimize/resume` → Generates optimized resume (3 credits)
- `POST /api/generate/cover-letter` → Generates cover letter (2 credits)
- `POST /api/generate/linkedin` → Generates LinkedIn message (1 credit)

---

## **Security Measures**
1. **API Authentication**
   - All API calls require JWT authentication via Clerk.
   - API rate-limiting in place to prevent abuse.
   - Cloudflare WAF (Web Application Firewall) enabled for DDoS protection.

2. **Data Protection**
   - Supabase Row Level Security (RLS) to ensure user-specific access.
   - HTTPS-only communication enforced.
   - Cloudflare CDN for mitigating latency and preventing attacks.

3. **Performance Optimization**
   - **Caching for AI requests** to reduce redundant processing.
   - **Database query optimizations** for faster response times.
   - **Lazy loading of frontend components** for improved UX.

---

## **Development Workflow**

1. **Version Control & CI/CD**
   - GitHub with feature-branch workflow.
   - PR reviews mandatory before merges.
   - Automated testing pipeline via **GitHub Actions**.
   - Vercel auto-deployment for frontend & API.

2. **Testing Strategy**
   - Unit tests for utility functions.
   - Integration tests for APIs.
   - E2E tests for core user flows.

3. **Deployment Process**
   - CI/CD via GitHub Actions + Vercel (Frontend & API) + Supabase migrations.
   - Feature flags for gradual rollouts.
   - Automated rollback strategy in case of failure.

---

## **Frontend Development Best Practices**
To build a **modern, clean SaaS frontend**, we recommend:
1. **ShadCN for UI Components** → Ensures an accessible, themeable component system.
2. **Tailwind CSS** → Keeps styling modular and maintainable.
3. **Component-Based Architecture** → Use a structured folder approach:
   ```
   src/components/
   ├── ui/            # Shared UI elements
   ├── forms/         # Form inputs & validation
   ├── dashboard/     # Dashboard views
   ├── auth/          # Login/Signup components
   ```
4. **Optimized State Management** → Use React context & hooks for global state.
5. **Lazy Loading & Suspense** → Optimize load performance.

---

## **Initial Credit Pricing & Usage**

### **Credit Packages**
- Starter: 10 credits → $5.00
- Basic: 25 credits → $10.00
- Pro: 100 credits → $35.00

### **Feature Costs**
- Resume Optimization → **3 credits**
- Cover Letter Generation → **2 credits**
- LinkedIn Message → **1 credit**

---

## **Monitoring & Analytics**

### **Key Metrics**
- User sign-ups & conversion rates.
- Feature usage breakdown (Resume vs. Cover Letter vs. LinkedIn).
- Average LLM processing time & caching efficiency.
- Payment processing success rate.
- Error tracking & API response times.

### **Tools**
- **Vercel Analytics** for frontend performance.
- **Supabase Dashboard** for database insights.
- **Custom event tracking** for feature usage analysis.
- **Sentry for error tracking & monitoring.**

---

## **Next Steps**
1. **Finalize Next.js migration & Clerk authentication.**
2. **Deploy initial API endpoints & validate caching efficiency.**
3. **Test Stripe integration & webhook processing.**
4. **Refine security & rate-limiting mechanisms.**
5. **Prepare for public beta testing & user feedback collection.**

🚀 **Target Completion for v0.2: 12 Weeks!**
