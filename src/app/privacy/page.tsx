import Link from 'next/link'
import { CervioLogo } from '@/components/features/CervioLogo'

export default function PrivacyPage() {
  const effective = 'April 4, 2026'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: '-apple-system, SF Pro Text, Helvetica Neue, sans-serif' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--surface)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: 'var(--shadow-sm)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <CervioLogo size={26} color="var(--accent)" textSize={18} />
        </Link>
        <Link href="/auth/login" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in →</Link>
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '52px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Legal</div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.8, marginBottom: 12, lineHeight: 1.2 }}>Privacy Policy</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This Privacy Policy describes how Morphotech Australia Pty Ltd ("Morphotech", "we", "us", or "our") collects, uses, and protects your personal information when you use the Cervio platform and related services.
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>Effective: {effective}</span>
            <span>·</span>
            <span>Morphotech Australia Pty Ltd</span>
          </div>
        </div>

        {/* Content */}
        {[
          {
            title: '1. About Us',
            content: `Cervio is operated by Morphotech Australia Pty Ltd (ABN to be registered), a company incorporated in New South Wales, Australia. Our registered address is in Sydney, New South Wales, Australia.\n\nFor privacy-related enquiries, you may contact us at: privacy@morphotech.com.au`
          },
          {
            title: '2. Information We Collect',
            content: `We collect the following categories of personal information:\n\n**Account Information:** When you register for Cervio, we collect your name, email address, and password (stored as a secure hash).\n\n**Business Profile Information:** Information you voluntarily provide about your business, including business name, role, business description, team size, industry, and strategic goals. This information is used exclusively to personalise your Cervio experience.\n\n**Usage Data:** Information about how you use the Cervio platform, including features accessed, AI interactions, briefings generated, decisions logged, meetings prepared, and calendar events created.\n\n**Technical Data:** IP address, browser type, device information, operating system, and access timestamps, collected automatically when you use our services.\n\n**Payment Information:** If you subscribe to a paid plan, payment processing is handled by Stripe Inc. We do not store your full card details. We receive confirmation of payment and a Stripe customer identifier.`
          },
          {
            title: '3. How We Use Your Information',
            content: `We use your personal information for the following purposes:\n\n**Service Delivery:** To provide, operate, and maintain the Cervio platform, including generating AI-powered briefings, decision analyses, and personalised recommendations.\n\n**AI Personalisation:** Your business profile and usage data are used as context for AI-generated content. This context is sent to Anthropic's Claude API to generate personalised outputs. We do not train AI models on your personal data.\n\n**Account Management:** To create and manage your account, process payments, and communicate important service updates.\n\n**Service Improvement:** Aggregated, anonymised usage data may be used to improve our features and user experience. We do not use individual personal data for this purpose without consent.\n\n**Legal Compliance:** To comply with applicable Australian laws and regulations, including the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).`
          },
          {
            title: '4. Third-Party Services',
            content: `We use the following third-party services to operate Cervio:\n\n**Anthropic (AI Processing):** Your business context and queries are processed by Anthropic's Claude API to generate AI outputs. Anthropic processes this data subject to their own privacy policy. We send only the minimum necessary context for each interaction.\n\n**Supabase (Database & Authentication):** Your data is stored in Supabase's infrastructure, hosted on AWS in the ap-south-1 (Mumbai) region. Supabase is SOC 2 compliant.\n\n**Vercel (Hosting):** Our web application is hosted on Vercel's infrastructure. Vercel processes request and response data as part of serving the application.\n\n**Stripe (Payments):** Payment processing is handled by Stripe Inc. Stripe is PCI DSS Level 1 certified. We share only necessary information (email, name) to facilitate billing.\n\nWe do not sell your personal information to any third party.`
          },
          {
            title: '5. Data Storage and Security',
            content: `**Storage Location:** Your data is primarily stored in AWS ap-south-1 (Mumbai, India) via Supabase. By using Cervio, you consent to this cross-border transfer.\n\n**Security Measures:** We implement industry-standard security practices including: encrypted data transmission (TLS 1.2+), encrypted data at rest, row-level security policies on all database tables, secure authentication via Supabase Auth, and regular security reviews.\n\n**Data Retention:** We retain your personal data for as long as your account is active. You may request deletion of your account and all associated data at any time through the Settings page or by contacting us directly.\n\n**Breach Notification:** In the event of a data breach affecting your personal information, we will notify you and, where required, the Office of the Australian Information Commissioner (OAIC) within 30 days of becoming aware of the breach, in accordance with the Notifiable Data Breaches (NDB) scheme.`
          },
          {
            title: '6. Your Rights Under Australian Privacy Law',
            content: `Under the Privacy Act 1988 (Cth) and the Australian Privacy Principles, you have the following rights:\n\n**Access:** You have the right to request access to the personal information we hold about you. You can export all your data directly from Settings → Export Your Data.\n\n**Correction:** You have the right to request correction of inaccurate or incomplete personal information.\n\n**Deletion:** You have the right to request deletion of your personal information. You can delete your account and all associated data from Settings → Delete Account.\n\n**Complaints:** If you believe we have breached the Australian Privacy Principles, you may lodge a complaint with us directly at privacy@morphotech.com.au. If you are unsatisfied with our response, you may escalate to the Office of the Australian Information Commissioner (OAIC) at www.oaic.gov.au.\n\nWe will respond to all privacy requests within 30 days.`
          },
          {
            title: '7. Cookies and Tracking',
            content: `Cervio uses essential cookies and local storage for authentication and session management. We do not use third-party advertising cookies or tracking pixels.\n\n**Authentication Tokens:** Stored in browser local storage to maintain your login session.\n\n**Preferences:** Your theme preference (light/dark/system) is stored in browser local storage.\n\nWe do not use Google Analytics, Facebook Pixel, or any other third-party behavioural tracking technologies.`
          },
          {
            title: '8. Children\'s Privacy',
            content: `Cervio is designed for business use by adults. We do not knowingly collect personal information from individuals under the age of 18. If you believe a minor has provided us with personal information, please contact us immediately at privacy@morphotech.com.au and we will promptly delete that information.`
          },
          {
            title: '9. Changes to This Policy',
            content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes via email or a prominent notice within the Cervio platform at least 14 days before the changes take effect.\n\nYour continued use of Cervio after the effective date of any changes constitutes your acceptance of the revised Privacy Policy.`
          },
          {
            title: '10. Contact Us',
            content: `For all privacy-related enquiries, requests, or complaints:\n\n**Morphotech Australia Pty Ltd**\nSydney, New South Wales, Australia\nEmail: privacy@morphotech.com.au\nWebsite: cervio.ai\n\nFor urgent security concerns: security@morphotech.com.au\n\nWe aim to respond to all enquiries within 5 business days.`
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.3, marginBottom: 12 }}>{section.title}</h2>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {section.content.split('\n\n').map((para, j) => {
                if (para.startsWith('**')) {
                  const parts = para.split('**')
                  return (
                    <p key={j} style={{ marginBottom: 12 }}>
                      {parts.map((part, k) => k % 2 === 1 ? <strong key={k} style={{ color: 'var(--text)', fontWeight: 600 }}>{part}</strong> : part)}
                    </p>
                  )
                }
                return <p key={j} style={{ marginBottom: 12 }}>{para}</p>
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 32, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            © 2026 Morphotech Australia Pty Ltd. All rights reserved.
          </div>
          <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Back to Cervio →</Link>
        </div>
      </main>
    </div>
  )
}
