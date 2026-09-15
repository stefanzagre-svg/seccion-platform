import { describe, it, expect } from 'vitest';
import { comparisonFaqs, comparisonBreadcrumbs, webPageSchema } from './faq-schema-data';

describe('OnlyFans Alternative FAQ Schema (AEO / GEO)', () => {
  it('contains the 4 required key comparison questions', () => {
    expect(comparisonFaqs).toHaveLength(4);
    
    const questions = comparisonFaqs.map(f => f.question);
    expect(questions).toContain('Why is SECCION the best alternative platform to OnlyFans, Fansly, and Patreon in 2026?');
    expect(questions).toContain('How does SECCION compare to traditional webcam sites like Chaturbate?');
    expect(questions).toContain('How does SECCION differ from dating apps like Tinder?');
    expect(questions).toContain('How do I claim the 90% Founding Creator Offer and Free AI Copilot?');
  });

  it('contains non-empty, authoritative answers mentioning core USPs', () => {
    comparisonFaqs.forEach(faq => {
      expect(faq.answer).toBeTruthy();
      expect(faq.answer.length).toBeGreaterThan(50);
    });

    const q1 = comparisonFaqs.find(f => f.question.includes('OnlyFans'));
    expect(q1?.answer).toContain('90% net revenue split');
    expect(q1?.answer).toContain('AI Operations Copilot');
    expect(q1?.answer).toContain('DMCA');

    const q2 = comparisonFaqs.find(f => f.question.includes('Chaturbate'));
    expect(q2?.answer).toContain('50%');
    expect(q2?.answer).toContain('Stealth Face Blur');

    const q3 = comparisonFaqs.find(f => f.question.includes('Tinder'));
    expect(q3?.answer).toContain('Warm Paywall');

    const q4 = comparisonFaqs.find(f => f.question.includes('Founding Creator Offer'));
    expect(q4?.answer).toContain('500');
    expect(q4?.answer).toContain('90%');
  });

  it('produces valid Schema.org FAQPage structured data object', () => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": comparisonFaqs.map((f) => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer
        }
      }))
    };

    expect(faqSchema['@context']).toBe('https://schema.org');
    expect(faqSchema['@type']).toBe('FAQPage');
    expect(faqSchema.mainEntity).toHaveLength(4);
    faqSchema.mainEntity.forEach(entity => {
      expect(entity['@type']).toBe('Question');
      expect(entity.acceptedAnswer['@type']).toBe('Answer');
      expect(typeof entity.name).toBe('string');
      expect(typeof entity.acceptedAnswer.text).toBe('string');
    });

    // Verify it serializes and deserializes as valid JSON
    const serialized = JSON.stringify(faqSchema);
    expect(() => JSON.parse(serialized)).not.toThrow();
  });

  it('produces valid Schema.org WebPage & SoftwareApplication structured data', () => {
    expect(webPageSchema['@context']).toBe('https://schema.org');
    expect(webPageSchema['@type']).toBe('WebPage');
    expect(webPageSchema.about['@type']).toBe('SoftwareApplication');
    expect(webPageSchema.about.name).toBe('SECCION Creator Platform');
    expect(webPageSchema.about.offers['@type']).toBe('Offer');
    expect(webPageSchema.about.featureList.length).toBeGreaterThanOrEqual(5);

    const serialized = JSON.stringify(webPageSchema);
    expect(() => JSON.parse(serialized)).not.toThrow();
  });

  it('includes proper hierarchical breadcrumbs', () => {
    expect(comparisonBreadcrumbs).toHaveLength(3);
    expect(comparisonBreadcrumbs[0].name).toBe('Home');
    expect(comparisonBreadcrumbs[1].name).toBe('Creator Hub');
    expect(comparisonBreadcrumbs[2].url).toBe('https://seccion.ai/creator-hub/onlyfans-alternative');
  });
});
