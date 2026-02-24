import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const FadeIn = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-72px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
};
const testimonials = [
    // Agency Founders / CEOs (#1-9)
    {
        name: 'Vinay Gupta',
        role: 'Founder, Advinix Digital Marketing Agency',
        avatar: '/test/1.jpg',
        linkedin: 'https://www.linkedin.com/in/vinay-gupta-912886135',
        feedback: "White-label web development became our silent delivery engine. We pitch website packages to every marketing client and our partner handles it all in 3 days. Our agency revenue jumped 40% without adding a single developer — and that's insane 😆",
    },
    {
        name: 'Ayush Tripathi',
        role: 'Co-Founder, Grow Digital Marketing Agency',
        avatar: '/test/2.jpg',
        linkedin: 'https://in.linkedin.com/in/ayush-tripathi740',
        feedback: "We were managing 23 clients and struggling with website delivery timelines. White-label web development fixed our bottleneck completely. We now close website add-ons confidently every single time.",
    },
    {
        name: 'Anshul H.',
        role: 'Founder & CEO, 7P Digital',
        avatar: '/test/3.jpg',
        linkedin: 'https://in.linkedin.com/in/anshulhitkari',
        feedback: "White-label delivery used to feel risky — until I found the right partner. Clean code, proper handoff, source files included — my clients think we built it in-house. That's exactly what I needed.",
    },
    {
        name: 'Vaishali Waghmode',
        role: 'Founder, Shinescript AI Marketing Agency',
        avatar: '/test/4.jpg',
        linkedin: 'https://www.linkedin.com/in/digital-marketing-consultant-pune',
        feedback: "I run an AI-driven agency so I know what good infrastructure looks like. A solid white-label web dev setup with 3-day delivery is genuinely impressive. My clients have no idea who actually builds their sites.",
    },
    {
        name: 'Ayushi Bansal',
        role: 'Founder & CEO, Social Parindee Agency',
        avatar: '/test/5.jpg',
        linkedin: 'https://in.linkedin.com/in/ayushi-bansal-274844129',
        feedback: "Three months into white-label web delivery and we've already recovered the yearly plan cost multiple times over. The math just works. My only regret is not adopting this model when I first launched my agency.",
    },
    {
        name: 'Ram S Aarora',
        role: 'Founder & CEO, Digital Markitors',
        avatar: '/test/6.jpg',
        linkedin: 'https://in.linkedin.com/in/ramsarora',
        feedback: "Running an agency since 2016, I've tried every outsourcing model. White-label web development done right is the cleanest setup I've ever used. No drama, no delays, and my brand stays front and center.",
    },
    {
        name: 'Sandy Sandy',
        role: 'Founder & CEO, MarketingCheff',
        avatar: '/test/7.jpg',
        linkedin: 'https://in.linkedin.com/in/askdigitalsandy',
        feedback: "We added white-label website delivery to our marketing retainers and it became our highest-margin service overnight. Our dev partner handles the build, we handle the client. Perfectly silent partnership.",
    },
    {
        name: 'Aman Shishodia',
        role: 'Founder, 360° Digital Marketing Solutions',
        avatar: '/test/8.jpg',
        linkedin: 'https://www.linkedin.com/in/aman-shishodia-a37615241',
        feedback: "Full-service marketing means clients expect websites too. White-label web development made that possible without hiring a dev team. The 3-day turnaround is real — I've tested it across multiple client projects.",
    },
    {
        name: 'Gaurav Sharma',
        role: 'Founder & CEO, Attrock',
        avatar: '/test/9.jpg',
        linkedin: 'https://in.linkedin.com/in/marketingwithgaurav',
        feedback: "Scaling output without scaling headcount was our biggest challenge. White-label web development solved it from day one. The quality is consistent and my team focuses only on what matters — clients.",
    },


    // Individual / Freelance Digital Marketers (#10-14)
    {
        name: 'Anchal Mehta',
        role: 'Social Media & Performance Marketer',
        avatar: '/test/10.jpg',
        linkedin: 'https://www.linkedin.com/in/aanchalmehta22',
        feedback: "My clients always asked for websites alongside ads. I used to say no. Now I say yes to everything — my white-label dev partner builds it, I brand it, and I keep the full margin. Such a game changer.",
    },
    {
        name: 'Roma K.',
        role: 'Freelance Digital Marketing Specialist',
        avatar: '/test/11.jpg',
        linkedin: 'https://www.linkedin.com/in/roma-k-4a954985',
        feedback: "As a freelancer managing close to 10,000 followers and multiple brand clients, I needed a delivery partner I could trust. White-label web development is exactly that — invisible, fast, and always on-brand.",
    },
    {
        name: 'Himanshu',
        role: 'Freelance Digital Marketer',
        avatar: '/test/12.jpg',
        linkedin: 'https://in.linkedin.com/in/himanshudigitalmarketer',
        feedback: "Five years of freelancing and website delivery was always my weak spot. White-label web dev fixed that permanently. I submit the brief, it gets deployed in 3 days. My clients think I have a full team.",
    },
    {
        name: 'Dhrubajit Kundu',
        role: 'Social Media Marketing & SEM Specialist',
        avatar: '/test/13.jpg',
        linkedin: 'https://www.linkedin.com/in/dhrubajitkundu',
        feedback: "I was skeptical about outsourcing website builds but the quality blew me away. Mobile responsive, clean code, delivered on time. White-label web development is now a permanent part of my service stack.",
    },
    {
        name: 'Amit Panchal',
        role: 'Digital Marketing Consultant',
        avatar: '/test/14.jpg',
        linkedin: 'https://www.linkedin.com/in/amithpanchal',
        feedback: "15 years in digital marketing means clients expect everything from you. Adding website delivery through a white-label model was the smartest business move I made this year. Silent, reliable, and scalable.",
    },
];



// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIAL CARD
// ─────────────────────────────────────────────────────────────────────────────
const TestimonialCard = ({ name, role, avatar, linkedin, feedback }) => (
    <div
        style={{
            background: '#ffffff',
            border: '1.5px solid #c7d7fd',       // clearly visible blue border
            borderRadius: 16,
            padding: '22px 20px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            flexShrink: 0,
            width: 400,
            userSelect: 'none',
            boxShadow: '0 4px 24px rgba(37,99,235,0.12), 0 1px 4px rgba(37,99,235,0.08)',
        }}
    >
        {/* Quote mark */}
        <div style={{
            fontSize: 32,
            lineHeight: 1,
            color: '#2563eb',                    // solid blue, clearly visible
            fontFamily: 'Georgia, serif',
            marginBottom: -6,
            opacity: 0.5,
        }}>
            "
        </div>

        {/* Feedback text */}
        <p style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.65,
            color: '#000',
                                // near-black, fully readable
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 500,
        }}>
            {feedback}
        </p>

        {/* Divider */}
        <div style={{
            height: 1,
            background: '#c7d7fd',               // visible divider
            marginTop: 4,
        }} />

        {/* Author row */}
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 2,
        }}>
            {/* Avatar */}
            <img
                src={avatar}
                alt={name}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #93c5fd',
                    flexShrink: 0,
                }}
            />

            {/* Name + Role */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0f172a',             // strong black
                    fontFamily: "'Inter', system-ui, sans-serif",
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {name}
                </div>
                <div style={{
                    fontSize: 11,
                    color: '#64748b',             // medium grey, readable on white
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 500,
                    marginTop: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {role}
                </div>
            </div>

            {/* LinkedIn icon */}
            <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: '#dbeafe',
                    border: '1px solid #93c5fd',
                    flexShrink: 0,
                    transition: 'background 0.2s ease',
                    textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#bfdbfe'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#dbeafe'}
            >
                <img
                    src="/svg/linkedin.svg"
                    alt="LinkedIn"
                    style={{ width: 24, height: 24 }}
                />
            </a>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIAL MARQUEE ROW
// ─────────────────────────────────────────────────────────────────────────────
const TestimonialMarqueeRow = ({ items, direction = 1 }) => {
    const doubled = [...items, ...items];

    return (
        <div style={{
            overflow: 'hidden',
            maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
        }}>
            <motion.div
                animate={{ x: direction > 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
                transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
                style={{
                    display: 'flex',
                    gap: 16,
                    width: 'max-content',
                    paddingBottom: 4,
                }}
            >
                {doubled.map((item, i) => (
                    <TestimonialCard key={i} {...item} />
                ))}
            </motion.div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION TESTIMONIALS — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function SectionTestimonials() {
    const row1 = testimonials.slice(0, 7);
    const row2 = testimonials.slice(7, 14);

    return (
        <section
            style={{
                position: 'relative',
                padding: 'clamp(80px, 10vw, 130px) 0',
                background: '#e8f0fe',           // clearly blue-tinted bg — cards will pop
                overflow: 'hidden',
            }}
        >
            {/* ── Background glow ─────────────────────────────────────────── */}
            <div style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 900,
                height: 900,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 65%)',
                pointerEvents: 'none',
            }} />

            {/* ── Grid pattern ────────────────────────────────────────────── */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(rgba(37,99,235,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.07) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
                pointerEvents: 'none',
            }} />

            {/* ── Content ─────────────────────────────────────────────────── */}
            <div style={{
                maxWidth: 1160,
                margin: '0 auto',
                position: 'relative',
                zIndex: 1,
                padding: '0 clamp(20px, 5vw, 60px)',
            }}>

                {/* Section label */}
                <FadeIn>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            border: '1px solid rgba(37,99,235,0.4)',
                            background: 'rgba(255,255,255,0.7)',
                            borderRadius: 999,
                            padding: '5px 16px',
                        }}>
                            <div style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: '#2563eb',
                                boxShadow: '0 0 8px rgba(37,99,235,0.6)',
                            }} />
                            <span style={{
                                color: '#1d4ed8',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                            }}>
                                WHAT PARTNERS SAY
                            </span>
                        </div>
                    </div>
                </FadeIn>

                {/* Headline */}
                <FadeIn delay={0.08}>
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: 'clamp(30px, 5.5vw, 58px)',
                        fontWeight: 900,
                        color: '#0f172a',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        letterSpacing: '-0.025em',
                        lineHeight: 1.1,
                        margin: '0 0 16px',
                    }}>
                        Trusted by{' '}
                        <span style={{ color: '#2563eb' }}>
                            Agencies & Freelancers
                        </span>
                    </h2>
                </FadeIn>

                {/* Sub-headline */}
                <FadeIn delay={0.14}>
                    <p style={{
                        textAlign: 'center',
                        fontSize: 'clamp(14px, 1.8vw, 17px)',
                        color: '#475569',                    // solid readable grey
                        fontFamily: "'Inter', system-ui, sans-serif",
                        lineHeight: 1.7,
                        maxWidth: 500,
                        margin: '0 auto 52px',
                    }}>
                        Real feedback from partners who scaled their delivery with 3Digree.
                    </p>
                </FadeIn>
            </div>

            {/* ── Full-width marquee rows ──────────────────────────────────── */}
            <FadeIn delay={0.2}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <TestimonialMarqueeRow items={row1} direction={1} />
                    <TestimonialMarqueeRow items={row2} direction={-1} />
                </div>
            </FadeIn>

        </section>
    );
}
