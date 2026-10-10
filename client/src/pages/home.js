import React, { useRef, useState, useEffect } from 'react';
import styles from './Home.module.css';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import AccordionGallery from '../components/AccordionGallery';
import AutoScrollGallery from '../components/AutoScrollGallery';
import {
  BookOpen,
  Lightbulb,
  Terminal,
  Users,
  Sparkles,
  ArrowRight,
  Target,
  Compass,
  Rocket,
  Award,
  ShieldCheck,
  Landmark,
  Trophy
} from 'lucide-react';

const startupGalleryItems = [
  {
    image: '/startups/Ankit%20Aggarwal.png',
    label: 'Ankit Aggarwal',
    alt: 'Startup founder Ankit Aggarwal',
    storyTitle: 'Ankit Aggarwal',
    description: 'As an undergraduate, Ankit realized students constantly missed out on major corporate hackathons, case competitions, and off-campus drives because campus notice boards were fragmented and disorganized. In 2010, he launched a simple blog called Dare2Compete to aggregate student opportunities. As traffic grew, enterprise companies like Reliance and Aditya Birla Group paid to host and run hiring challenges on his platform, leading to its full rebranding as Unstop.'
  },
  {
    image: '/startups/KGP%20Startup.png',
    label: 'KGP Startup',
    alt: 'The founders of a KGP startup',
    storyTitle: 'KGP Startup',
    description: 'While studying at IIT Kharagpur, the founders identified a major disconnect in tech hiring: tier-2 and tier-3 college students struggled to find quality off-campus developer roles, while early-stage startups wasted weeks sifting through resumes to find capable software engineers. Cuvette built a talent network where students complete practical coding assessments rather than relying on static resumes. Startups get direct access to pre-vetted student developers, enabling fast, skill-based hiring for internships that often transition into full-time offers.'
  },
  {
    image: '/startups/Madras%20student.png',
    label: 'Madras Student',
    alt: 'A student founder from Madras',
    storyTitle: '21-year-old IIT Madras student',
    description: 'While completing his undergraduate studies at IIT Madras, Pranav Gangwal interned and researched at the intersection of machine learning and healthcare. Seeing how delayed diagnoses of chronic conditions like cancer and diabetes impact patient survival, he teamed up with fellow researchers to launch Orbuculum. Supported by campus incubators and Axilor Ventures, they built an AI platform that analyzes genomic data to predict disease risks early.'
  },
  {
    image: '/startups/Mohammed%20Zeeshan.png',
    label: 'Mohammed Zeeshan',
    alt: 'Startup founder Mohammed Zeeshan',
    storyTitle: 'Mohammed Zeeshan',
    description: 'In August 2013, 19-year-old Zeeshan Mohammed and his college batchmates realized they were pursuing engineering degrees they had no passion for. Recognizing that millions of Indian students make uninformed career choices due to societal pressure, Zeeshan borrowed ₹60,000 from his parents to start a youth mentoring organization. Starting as an offline print magazine and event firm named Inking Pages, the founders - Zeeshan, Sameer Ramesh, Fatema Hussain, and Ruhan Naqash - pivoted in April 2015 to build MyCaptain.in, an online mentorship platform.'
  },
  {
    image: '/startups/NIT%20Grads.png',
    label: 'NIT Graduates',
    alt: 'NIT graduates at a startup event',
    storyTitle: 'NIT Grads Recycle 350000 Kg',
    description: 'What began during an undergraduate college trek seeing plastic waste littered across pristine Himachali mountains quickly evolved into an engineering effort. After conducting hands-on internships and material testing, NIT graduates Sonal and Vaibhav created econscious®. Instead of converting plastic waste into energy-intensive pellets, they designed a proprietary process to convert plastic flakes directly into durable eco-boards, park benches, and home decor, generating over ₹1 Crore in revenue.'
  }
];

const eventGalleryItems = [
  { image: '/events/hackathons/sih2024.jpeg', text: 'SIH 2024' },
  { image: '/events/hackathons/sih2025.jpeg', text: 'SIH 2025' },
  { image: '/events/ideathons/iiscideathon.jpeg', text: 'Inter-Institutional Startup Competition' },
  { image: '/events/ideathons/innovateit_ideathon.jpeg', text: 'Innovate It' },
  { image: '/events/technicalevents/te1.jpeg', text: 'Invention Through Innovation' },
  { image: '/events/technicalevents/te2.jpeg', text: 'Innovation Experience' },
  { image: '/events/technicalevents/te3.jpeg', text: 'Innovation Intramurals' },
  { image: '/events/technicalevents/te4.jpeg', text: 'Mind Mashrims' },
  { image: '/events/technicalevents/te5.jpeg', text: 'Stock Wars' },
  { image: '/events/technicalevents/te6.jpeg', text: 'Innovation Hunt' },
  { image: '/events/technicalevents/te7.jpeg', text: 'Recall Masters' },
  { image: '/events/technicalevents/te8.jpeg', text: 'Memory Wizards' },
  { image: '/events/technicalevents/te9.jpeg', text: 'Techmania' }
];

const campusGalleryItems = [
  { image: 'https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Gallery/20211030_140219.jpg', text: 'Innovation Bootcamp' },
  { image: 'https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Gallery/20211117_113131.jpg', text: 'Startup & Prototyping Meet' },
  { image: 'https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Gallery/WhatsApp%20Image%202024-03-13%20at%2020.17.02_a7338a25.jpg', text: 'Innovation Meetup' },
  { image: 'https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Gallery/WhatsApp%20Image%202024-03-13%20at%2020.17.40_440a1463.jpg', text: 'Code Sprint' },
  { image: 'https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Gallery/WhatsApp%20Image%202024-03-13%20at%2020.17.40_c861f92e.jpg', text: 'Innovation Summit' },
  { image: 'https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Gallery/WhatsApp%20Image%202024-03-13%20at%2020.22.25_c3b41748.jpg', text: 'Tech Leadership Summit' },
  { image: 'https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Gallery/WhatsApp%20Image%202024-03-13%20at%2020.22.25_c872376b.jpg', text: 'Founders Talk' },
  { image: 'https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Gallery/WhatsApp%20Image%202024-03-13%20at%2020.22.26_978bafab.jpg', text: 'Product Engineering' },
  { image: 'https://vspgdcjylvxjdgaugjwq.supabase.co/storage/v1/object/public/gallery/Screenshot%202026-08-21%20150032.png', text: 'Neem Tree Toys Visit' },
  { image: 'https://vspgdcjylvxjdgaugjwq.supabase.co/storage/v1/object/public/gallery/klu/Screenshot%202026-08-21%20151218.png', text: 'KLU Incubation Visit' },
  { image: 'https://vspgdcjylvxjdgaugjwq.supabase.co/storage/v1/object/public/gallery/pm%20budget%20web/Screenshot%202026-08-21%20151613.png', text: 'Budget Webinar 2026' },
  { image: 'https://vspgdcjylvxjdgaugjwq.supabase.co/storage/v1/object/public/gallery/ideathon/Screenshot%202026-08-21%20151912.png', text: 'Hack the Thought' },
  { image: 'https://vspgdcjylvxjdgaugjwq.supabase.co/storage/v1/object/public/gallery/Uppalapadu/Screenshot%202026-08-21%20152404.png', text: 'Uppalapadu Outreach' },
  { image: 'https://vspgdcjylvxjdgaugjwq.supabase.co/storage/v1/object/public/gallery/MoE%20cell/Screenshot%202026-08-21%20152610.png', text: 'Innovation Cell' },
  { image: 'https://vspgdcjylvxjdgaugjwq.supabase.co/storage/v1/object/public/gallery/SRM%20University/Screenshot%202026-08-21%20152904.png', text: 'SRM Incubation Visit' },
  { image: 'https://vspgdcjylvxjdgaugjwq.supabase.co/storage/v1/object/public/gallery/rvr%26jc/WhatsApp%20Image%202026-08-23%20at%2012.09.02%20AM.jpeg', text: 'RVR&JC Incubation Visit' }
];

const keyActivities = [
  {
    id: 'workshops',
    title: 'Workshops',
    icon: BookOpen,
    link: '/events',
    color: '#111827',
    glow: 'rgba(17, 24, 39, 0.18)',
    bg: 'rgba(17, 24, 39, 0.04)'
  },
  {
    id: 'mentoring',
    title: 'Mentoring',
    icon: Users,
    link: '/teams',
    color: '#374151',
    glow: 'rgba(55, 65, 81, 0.18)',
    bg: 'rgba(55, 65, 81, 0.04)'
  },
  {
    id: 'idea-competitions',
    title: 'Idea Competitions',
    icon: Lightbulb,
    link: '/ideabank',
    color: '#4B5563',
    glow: 'rgba(75, 85, 99, 0.18)',
    bg: 'rgba(75, 85, 99, 0.04)'
  },
  {
    id: 'hackathons',
    title: 'Hackathons',
    icon: Terminal,
    link: '/events',
    color: '#6B7280',
    glow: 'rgba(107, 114, 128, 0.18)',
    bg: 'rgba(107, 114, 128, 0.04)'
  },
  {
    id: 'team-building',
    title: 'Team Building',
    icon: Users,
    link: '/teams',
    color: '#1F2937',
    glow: 'rgba(31, 41, 55, 0.18)',
    bg: 'rgba(31, 41, 55, 0.04)'
  }
];

function AnimatedTriangle({ src, alt }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "100px 0px" });
  const slices = 5; // Divide the image into 5 horizontal strips

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', maxWidth: '1080px', overflow: 'hidden', borderRadius: '18px', background: '#fff', border: '1.5px solid rgba(46,42,143,0.12)', boxShadow: '0 4px 20px 0 rgba(46,42,143,0.04)', margin: '0 auto', display: 'block' }}>
      {/* Hidden base image to establish natural sizing and aspect ratio */}
      <img src={src} alt={alt} className={styles['animated-base']} style={{ width: '100%', height: 'auto', display: 'block', opacity: 0 }} />

      {/* Slices dropping in sequentially */}
      {Array.from({ length: slices }).map((_, i) => {
        const currentTop = (i / slices) * 100;
        const currentBottom = ((i + 1) / slices) * 100;

        return (
          <motion.img
            key={i}
            src={src}
            alt=""
            initial={{ opacity: 0, y: -40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.4,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              clipPath: `polygon(0% ${currentTop}%, 100% ${currentTop}%, 100% ${currentBottom}%, 0% ${currentBottom}%)`,
              willChange: 'transform, opacity',
              boxShadow: 'none',
              borderRadius: '0px'
            }}
          />
        );
      })}
    </div>
  );
}



function AnimatedSection({ children, delay = 0, className = "", style, id }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "50px 0px" });

  return (
    <motion.div
      ref={ref}
      id={id}
      style={style}
      className={className || undefined}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function useWindowWidth() {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

function RoadmapItem({ act, index, isInView, isMobile, windowWidth }) {
  const IconComp = act.icon;

  // Symmetrical offset factor relative to center item (index 2: Idea Competitions)
  // index 0 -> -2, index 1 -> -1, index 2 -> 0, index 3 -> +1, index 4 -> +2
  const offsetFactor = index - 2;

  // Responsive spread distance based on screen width
  const step = windowWidth >= 1350 ? 140 : windowWidth >= 1100 ? 110 : 85;

  // Horizontal start displacement: outer items start wider apart, converge to center
  const startX = isMobile
    ? (offsetFactor === 0 ? 0 : (index % 2 === 0 ? -30 : 30))
    : offsetFactor * step;

  // Vertical start displacement
  const startY = isMobile
    ? offsetFactor * 26
    : (offsetFactor === 0 ? 28 : 14);

  // Subtle angular tilt when spread out (-7deg to +7deg), settling to 0deg
  const startRotate = isMobile ? 0 : offsetFactor * 3.5;

  return (
    <motion.div
      className={styles['roadmap-item-wrapper']}
      initial={{
        x: startX,
        y: startY,
        rotate: startRotate,
        scale: 0.84,
        opacity: 0
      }}
      animate={
        isInView
          ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          : undefined
      }
      transition={{
        duration: 0.8,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <Link
        to={act.link}
        className={styles['roadmap-item']}
        style={{
          '--act-color': act.color,
          '--act-glow': act.glow,
          '--act-bg': act.bg,
          '--step-idx': index
        }}
        title={`${act.title} - Explore`}
      >
        <div className={styles['roadmap-icon-wrapper']}>
          <IconComp size={44} strokeWidth={2.2} />
        </div>

        <h3 className={styles['roadmap-name']}>
          {act.title}
        </h3>
      </Link>
    </motion.div>
  );
}

function RoadmapTrack() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, {
    once: true,
    margin: "0px 0px -10% 0px"
  });
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= 900;

  return (
    <div ref={containerRef} className={styles['roadmap-container']}>
      <div className={styles['roadmap-track']}>
        <motion.div
          className={styles['roadmap-line']}
          initial={{
            scaleX: isMobile ? 1 : 0,
            scaleY: isMobile ? 0 : 1,
            opacity: 0
          }}
          animate={
            isInView
              ? { scaleX: 1, scaleY: 1, opacity: 0.35 }
              : undefined
          }
          transition={{ duration: 0.8, ease: "easeOut" }}
          aria-hidden="true"
        >
          <div className={styles['roadmap-line-pulse']} />
        </motion.div>

        {keyActivities.map((act, index) => (
          <RoadmapItem
            key={act.id}
            act={act}
            index={index}
            isInView={isInView}
            isMobile={isMobile}
            windowWidth={windowWidth}
          />
        ))}
      </div>
    </div>
  );
}

const WHO_WE_ARE_TABS = [
  {
    id: 'mission',
    label: 'Our Mission',
    badge: 'MoE & AICTE Mandate',
    icon: Target,
    title: 'A Catalyst for Creative Minds & Future Founders',
    description: "The Institutions Innovation Council (IIC) at VVITU is an initiative under the Ministry of Education (MoE), Government of India, established in collaboration with AICTE in 2018. We systematically cultivate a culture of innovation, scientific curiosity, and entrepreneurial drive across higher education institutions.",
    points: [
      { title: 'National Mandate', desc: "Operating under MoE's Innovation Cell guidelines to advance India's innovation index." },
      { title: 'Ideation to Incubation', desc: 'Transforming classroom concepts into validated, scalable technology prototypes.' }
    ]
  },
  {
    id: 'framework',
    label: 'Guided Framework',
    badge: 'Structured Methodology',
    icon: Compass,
    title: 'From Conceptual Sparks to National Competitions',
    description: 'Our ecosystem follows the national 4-tier Guided Activities Framework. Through structured Calendar Activities, MIC-driven national mandates, and self-driven exploratory hackathons, students receive hands-on experiential exposure to design thinking, patent filing, and business modeling.',
    points: [
      { title: '4-Tier Guided Pipeline', desc: 'Calendar, MIC-Driven, Self-Driven, and Celebration activities.' },
      { title: 'Industry & Ecosystem Links', desc: 'Direct access to startup incubators, patent experts, and angel networks.' }
    ]
  },
  {
    id: 'community',
    label: 'Council Culture',
    badge: 'Student-Led Ecosystem',
    icon: Rocket,
    title: 'Passionate Creators, Collaborative Leaders',
    description: 'We believe genuine breakthroughs emerge when multidisciplinary minds unite. From software architects and hardware tinkerers to policy researchers and creative designers, our council empowers student leaders to spearhead real-world change.',
    points: [
      { title: 'Multidisciplinary Teams', desc: 'Bridging engineering, design, management, and research.' },
      { title: 'Proven Track Record', desc: 'Representing VVITU in Smart India Hackathons and national innovation summits.' }
    ]
  }
];

const WHO_WE_ARE_KEY_POINTS = [
  {
    tag: 'ESTABLISHMENT',
    icon: Landmark,
    title: 'MoE & AICTE Mandate',
    desc: 'Established in 2018 under the Ministry of Education (MoE) & AICTE to build institutional innovation capabilities across India.',
    gradient: 'linear-gradient(90deg, #F59E0B, #D97706)'
  },
  {
    tag: 'CORE MOTTO',
    icon: Compass,
    title: 'Culture of Innovation',
    desc: 'Systematically cultivating creative ideation, scientific curiosity, design thinking, and entrepreneurial drive at VVITU.',
    gradient: 'linear-gradient(90deg, #4F46E5, #7C3AED)'
  },
  {
    tag: "MOE'S KEY INITIATIVE",
    icon: ShieldCheck,
    title: "Innovation Cell (MIC)",
    desc: "Guided by MoE's Innovation Cell to evaluate, mentor, and foster high-impact startup and technology pipelines across HEIs.",
    gradient: 'linear-gradient(90deg, #2563EB, #0284C7)'
  },
  {
    tag: 'SIH & HACKATHONS',
    icon: Trophy,
    title: 'Smart India Hackathon',
    desc: 'Spearheading student participation in national problem-solving, SIH editions, prototype contests, and national innovation summits.',
    gradient: 'linear-gradient(90deg, #10B981, #059669)'
  }
];

const HERO_TITLE = 'Sapere aude';
const HOVER_HERO_TITLE = 'Dare to Know';
const SHUFFLE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SCRAMBLE_CHARACTERS = '!<>-_\\/[]{}—=+*^?#________';

function ScrambledText({ text, className, as: TextElement = 'p' }) {
  const characters = Array.from(text);
  const characterElements = useRef([]);
  const activeUntil = useRef([]);
  const intervalId = useRef(null);
  const [scrambledCharacters, setScrambledCharacters] = useState(characters);

  useEffect(() => () => window.clearInterval(intervalId.current), []);

  const handlePointerMove = (event) => {
    if (
      event.pointerType === 'touch' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const now = Date.now();
    characterElements.current.forEach((element, index) => {
      if (!element || characters[index] === '\n' || characters[index].trim() === '') {
        return;
      }

      const bounds = element.getBoundingClientRect();
      const deltaX = event.clientX - (bounds.left + bounds.width / 2);
      const deltaY = event.clientY - (bounds.top + bounds.height / 2);
      if (Math.hypot(deltaX, deltaY) < 90) {
        activeUntil.current[index] = now + 650;
      }
    });

    if (intervalId.current !== null) {
      return;
    }

    intervalId.current = window.setInterval(() => {
      const tickTime = Date.now();
      let hasActiveCharacters = false;
      const nextCharacters = characters.map((character, index) => {
        if (character.trim() === '' || (activeUntil.current[index] || 0) <= tickTime) {
          return character;
        }

        hasActiveCharacters = true;
        return SCRAMBLE_CHARACTERS[
          Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)
        ];
      });

      setScrambledCharacters(nextCharacters);
      if (!hasActiveCharacters) {
        window.clearInterval(intervalId.current);
        intervalId.current = null;
      }
    }, 45);
  };

  return (
    <TextElement className={className} onPointerMove={handlePointerMove}>
      <span className={styles['scrambled-text-content']} aria-hidden="true">
        {scrambledCharacters.map((character, index) => (
          character === '\n' ? (
            <br key={index} />
          ) : (
            <span
              key={index}
              ref={(element) => {
                characterElements.current[index] = element;
              }}
            >
              {character}
            </span>
          )
        ))}
      </span>
      <span className={styles['sr-only']}>{text.replace(/\n/g, ' ')}</span>
    </TextElement>
  );
}

function Home() {
  const [activeWhoTab, setActiveWhoTab] = useState('mission');
  const [isHeroTitleActive, setIsHeroTitleActive] = useState(false);
  const [heroTitleTarget, setHeroTitleTarget] = useState(null);
  const [heroTitle, setHeroTitle] = useState(HERO_TITLE);
  const currentTab = WHO_WE_ARE_TABS.find((t) => t.id === activeWhoTab) || WHO_WE_ARE_TABS[0];
  const CurrentTabIcon = currentTab.icon;

  useEffect(() => {
    if (!heroTitleTarget) {
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHeroTitle(heroTitleTarget);
      return undefined;
    }

    let revealedCharacters = 0;
    const intervalId = window.setInterval(() => {
      revealedCharacters += 1;
      const shuffledTitle = heroTitleTarget
        .split('')
        .map((character, index) => {
          if (character === ' ' || index < revealedCharacters) {
            return character;
          }

          return SHUFFLE_CHARACTERS[
            Math.floor(Math.random() * SHUFFLE_CHARACTERS.length)
          ];
        })
        .join('');

      setHeroTitle(shuffledTitle);

      if (revealedCharacters >= heroTitleTarget.length) {
        window.clearInterval(intervalId);
      }
    }, 35);

    return () => window.clearInterval(intervalId);
  }, [heroTitleTarget]);

  return (
    <div className={styles.wrap}>

      <section className={styles.hero} aria-label="Welcome to VVITU Innovation Council">
        <div className={styles['hero-copy']}>
          <h1
            className={styles['hero-title']}
            aria-label={isHeroTitleActive ? HOVER_HERO_TITLE : `${HERO_TITLE}.`}
            tabIndex={0}
            onMouseEnter={() => {
              setIsHeroTitleActive(true);
              setHeroTitleTarget(HOVER_HERO_TITLE);
            }}
            onMouseLeave={() => {
              setIsHeroTitleActive(false);
              setHeroTitleTarget(HERO_TITLE);
            }}
            onFocus={() => {
              setIsHeroTitleActive(true);
              setHeroTitleTarget(HOVER_HERO_TITLE);
            }}
            onBlur={() => {
              setIsHeroTitleActive(false);
              setHeroTitleTarget(HERO_TITLE);
            }}
          >
            <span aria-hidden="true">{heroTitle}</span>
            {!isHeroTitleActive && (
              <span className={styles['hero-title-dot']} aria-hidden="true">.</span>
            )}
          </h1>
          <ScrambledText
            className={styles['hero-lead']}
            text={'Have the courage to imagine\nwhat does not yet exist.'}
          />
          <ScrambledText
            as="blockquote"
            className={styles['hero-quote']}
            text={'Knowing is not enough; we must apply.\nWilling is not enough; we must do.'}
          />
          <ScrambledText
            className={styles['hero-subtitle']}
            text={"The future is built by people who refuse\nto call today's limitations permanent"}
          />
        </div>

        <div className={styles['hero-image-wrap']}>
          <img
            src="/images/Sunrise%20Ideas%20by%20the%20River.png"
            alt="A student imagining new ideas beside a river at sunset"
            className={styles['hero-image']}
          />
        </div>
      </section>

      <section className={styles['startup-section']} aria-labelledby="startup-stories-title">
        <h2 className={styles['startup-section-title']} id="startup-stories-title">
          Startup Stories
        </h2>
        <AccordionGallery
          items={startupGalleryItems}
          defaultIndex={2}
          expandRatio={0.52}
          trigger="hover"
          accentColor="#ffffff"
          overlayColor="#060010"
          textColor="#ffffff"
          grayscale
          showLabels
          duration={0.6}
          height={460}
          gap={10}
          radius={16}
          orientation="horizontal"
        />
      </section>

      <section className={styles['event-gallery-section']} aria-labelledby="event-gallery-title">
        <Link to="/events" style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
          <h2 className={styles['startup-section-title']} id="event-gallery-title">
            Past Events
          </h2>
          <AutoScrollGallery
            items={eventGalleryItems}
            direction="left"
            duration={48}
            label="Past IIC events"
          />
        </Link>
      </section>

      <section className={styles['event-gallery-section']} aria-labelledby="campus-gallery-title">
        <Link to="/gallery" style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
          <h2 className={styles['startup-section-title']} id="campus-gallery-title">
            Campus Gallery
          </h2>
          <AutoScrollGallery
            items={campusGalleryItems}
            direction="right"
            duration={58}
            label="IIC campus gallery"
          />
        </Link>
      </section>

      <section className={styles['activities-strip']}>
        <AnimatedSection className={styles['activities-header']}>
          <h2 className={styles['activities-title']}>
            KEY ACTIVITIES OF IIC
          </h2>
        </AnimatedSection>

        <RoadmapTrack />
      </section>

      <div className={styles.divider} role="separator" aria-hidden="true"></div>

      <section className={styles['who-section']} id="about">
        {/* Soft Ambient Glows */}
        <div className={styles['who-ambient-glow-1']} aria-hidden="true" />
        <div className={styles['who-ambient-glow-2']} aria-hidden="true" />

        <div className={styles['who-container']}>
          {/* Section Header */}
          <AnimatedSection className={styles['who-header']}>
            <div className={styles['who-eyebrow']}>
              <Sparkles size={14} />
              <span>Institutional Innovation</span>
            </div>
            <h2 className={styles['who-main-title']}>
              Who We Are: Cultivating Tomorrow's Innovators
            </h2>
            <p className={styles['who-lead']}>
              Bridging academic discovery with real-world entrepreneurial execution under the Ministry of Education's national innovation mandate.
            </p>
          </AnimatedSection>

          {/* Interactive 2-Column Console */}
          <div className={styles['who-grid']}>
            {/* Left: Showcase Visual Card with Framework */}
            <AnimatedSection className={styles['who-visual-card']} delay={0.1}>
              <div className={styles['who-visual-badge-top']}>
                <ShieldCheck size={14} color="#2E2A8F" />
                <span>National Innovation Framework</span>
              </div>

              <div className={styles['who-visual-img-wrap']}>
                <img
                  src="/images/IIC-Guided-Activities.png"
                  alt="IIC Guided Activities Pyramid Framework"
                  className={styles['who-visual-img']}
                  loading="lazy"
                />
              </div>

              <div className={styles['who-visual-badge-bottom']}>
                <Award size={14} color="#D97706" />
                <span>4-Tier Guided Activity Model</span>
              </div>
            </AnimatedSection>

            {/* Right: Interactive Tabbed Narrative Console */}
            <AnimatedSection className={styles['who-console']} delay={0.2}>
              {/* Tab Selector */}
              <div className={styles['who-tab-bar']} role="tablist" aria-label="Who We Are dimensions">
                {WHO_WE_ARE_TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeWhoTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`${styles['who-tab-btn']} ${isActive ? styles.active : ''}`}
                      onClick={() => setActiveWhoTab(tab.id)}
                    >
                      <TabIcon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Tab Body */}
              <motion.div
                key={currentTab.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={styles['who-card-body']}
              >
                <div className={styles['who-card-tag']}>
                  <CurrentTabIcon size={15} />
                  <span>{currentTab.badge}</span>
                </div>

                <h3 className={styles['who-card-title']}>
                  {currentTab.title}
                </h3>

                <p className={styles['who-card-desc']}>
                  {currentTab.description}
                </p>

                <div className={styles['who-points-grid']}>
                  {currentTab.points.map((pt, i) => (
                    <div key={i} className={styles['who-point-card']}>
                      <h4 className={styles['who-point-title']}>
                        <Sparkles size={13} color="#D97706" />
                        {pt.title}
                      </h4>
                      <p className={styles['who-point-desc']}>
                        {pt.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatedSection>
          </div>

          {/* Bottom 4-Pillar Key Points Bento Row */}
          <div className={styles['who-stats-row']}>
            {WHO_WE_ARE_KEY_POINTS.map((item, i) => {
              const IconComp = item.icon;
              return (
                <AnimatedSection
                  key={i}
                  className={styles['who-stat-card']}
                  delay={0.1 + i * 0.08}
                  style={{ '--stat-gradient': item.gradient }}
                >
                  <div className={styles['who-stat-header']}>
                    <div className={styles['who-stat-icon-wrap']}>
                      <IconComp size={18} strokeWidth={2.2} />
                    </div>
                    <span className={styles['who-stat-tag']}>{item.tag}</span>
                  </div>
                  <h4 className={styles['who-stat-title']}>{item.title}</h4>
                  <p className={styles['who-stat-sub']}>{item.desc}</p>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Centered wide images */}
      <div className={styles['about-wide-image-center']}>
        <div className={styles['about-wide-image']}>
          <img src="/images/policy-image.png" alt="Policy Approach & Action Plan" loading="lazy" style={{ imageRendering: 'high-quality', filter: 'contrast(1.05) saturate(1.05)' }} />
        </div>
      </div>
      <div className={styles['about-wide-image-center']}>
        <div className={styles['about-wide-image']}>
          <AnimatedTriangle src="/images/triangle.jpg" alt="National Innovation Contest" />
        </div>
      </div>

      {/* Classic & Visual "Have an Idea?" Action Section */}
      <AnimatedSection className={styles['have-idea-section']}>
        <div className={styles['have-idea-card']}>
          <div className={styles['idea-hub-layout']}>
            <div className={styles['idea-hub-action']}>
              <h2 className={styles['have-idea-title']}>
                <span>Have an</span>
                <em>idea?</em>
              </h2>
              <p className={styles['idea-hub-lead']}>
                Share the first version. It doesn’t need to be polished. The next step can begin with a conversation.
              </p>
              <Link to="/ideahub" className={styles['idea-btn-submit']}>
                <span>Submit Your Idea</span>
                <ArrowRight size={18} className={styles['btn-arrow-anim']} />
              </Link>
            </div>

            <div className={styles['idea-hub-details']}>
              <div className={styles['idea-hub-quotes']}>
                <blockquote className={styles['idea-hub-quote']}>
                  <span className={styles['idea-hub-quote-mark']} aria-hidden="true">“</span>
                  <span>An idea changes nothing until someone dares to begin.</span>
                </blockquote>
                <blockquote className={styles['idea-hub-quote']}>
                  <span className={styles['idea-hub-quote-mark']} aria-hidden="true">“</span>
                  <span>An idea is a small act of rebellion against the way things have always been.</span>
                </blockquote>
              </div>

              <div className={styles['idea-hub-steps']} aria-label="Three steps from idea to action">
                <div className={styles['idea-hub-step']}>
                  <span className={styles['idea-hub-step-number']}>01</span>
                  <h3>Envision</h3>
                  <p>Imagine what could be.</p>
                </div>
                <ArrowRight className={styles['idea-hub-step-arrow']} size={22} aria-hidden="true" />
                <div className={styles['idea-hub-step']}>
                  <span className={styles['idea-hub-step-number']}>02</span>
                  <h3>Develop</h3>
                  <p>Make the possibility tangible.</p>
                </div>
                <ArrowRight className={styles['idea-hub-step-arrow']} size={22} aria-hidden="true" />
                <div className={styles['idea-hub-step']}>
                  <span className={styles['idea-hub-step-number']}>03</span>
                  <h3>Launch</h3>
                  <p>Give it a chance to matter.</p>
                </div>
              </div>

              <p className={styles['idea-hub-note']}>
                From a thought to something real.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <div className={styles['home-team-banner']}>
        <Link to="/teams" aria-label="Meet the IIC team">
          <img
            src="/teams/teams.png"
            alt="The IIC team"
            loading="lazy"
          />
        </Link>
      </div>

    </div>
  );
}

export default Home;