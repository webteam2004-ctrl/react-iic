import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Hash,
  FileText,
  Activity,
  HelpCircle,
  Upload,
  CheckCircle2,
  X,
  Send,
  Quote
} from 'lucide-react';
import styles from './ideabank.module.css';

const SUPPORT_OPTIONS = [
  'Mentorship & Technical Guidance',
  'Funding & Seed Grant Support',
  'Lab & Hardware Prototyping Access',
  'Patent & IPR Filing Assistance',
  'Incubation & Startup Support',
  'Networking & Industry Connect'
];

const STAGE_OPTIONS = [
  'Idea / Conceptual Stage',
  'Proof of Concept (PoC) Developed',
  'Working Prototype Ready',
  'Testing / Early Deployment Stage'
];

const HERO_QUOTES = [
  {
    text: 'An idea changes nothing until someone dares to begin.',
    author: 'Student Innovator',
    role: 'Incubation Track'
  },
  {
    text: 'An idea is a small act of rebellion against the way things have always been.',
    author: 'Campus Maker',
    role: 'Prototype Lab'
  },
  {
    text: 'A thought becomes an idea. An idea becomes an innovation. An innovation creates lasting impact.',
    author: 'IIC Innovation Council',
    role: 'Institutional Vision'
  },
  {
    text: 'The value of an idea lies in the using of it.',
    author: 'Thomas A. Edison',
    role: 'Invention & Industry'
  }
];

// Dynamic rotating targets for "Turn Your Ideas into Impact"
const HERO_TRANSITIONS = [
  'Ideas into Impact',
  'Thoughts into Innovation',
  'Concepts into Reality',
  'Prototypes into Startups',
  'Research into Patents'
];

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'SUBMIT',
    desc: 'Share your idea with the IIC community.'
  },
  {
    number: '02',
    title: 'REVIEW',
    desc: 'Your idea is reviewed to understand its potential and requirements.'
  },
  {
    number: '03',
    title: 'MENTOR',
    desc: 'Get connected with relevant guidance and expertise.'
  },
  {
    number: '04',
    title: 'DEVELOP',
    desc: 'Work on validation, experimentation, prototype development and improvement.'
  },
  {
    number: '05',
    title: 'IMPACT',
    desc: 'Move your solution towards competitions, implementation, incubation or real-world impact.'
  }
];

// On-load animation variants for hero text and items
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

// Form container and section animations for smooth, subtle scroll and load entrance
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04
    }
  }
};

const formSectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] }
  }
};

// On-scroll reveal animation variants
const scrollSectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

const stepListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06
    }
  }
};

const stepItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

function Ideabank() {
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    projectTitle: '',
    problemStatement: '',
    currentProgress: '',
    expectedHelp: [],
    customHelp: '',
    pptFile: null
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [headlineIndex, setHeadlineIndex] = useState(0);

  // Transition quote in the hero automatically every 4.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % HERO_QUOTES.length);
    }, 4800);
    return () => clearInterval(timer);
  }, []);

  // Transition hero headline text smoothly every 3.6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex(prev => (prev + 1) % HERO_TRANSITIONS.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCheckboxChange = (option) => {
    setFormData(prev => {
      const exists = prev.expectedHelp.includes(option);
      const updated = exists
        ? prev.expectedHelp.filter(item => item !== option)
        : [...prev.expectedHelp, option];
      return { ...prev, expectedHelp: updated };
    });
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const validExtensions = ['ppt', 'pptx', 'pdf'];
    const fileExt = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setErrors(prev => ({ ...prev, pptFile: 'Please upload a .ppt, .pptx, or .pdf file.' }));
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, pptFile: 'File size must be under 25MB.' }));
      return;
    }

    setFormData(prev => ({ ...prev, pptFile: file }));
    setErrors(prev => ({ ...prev, pptFile: '' }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.rollNo.trim()) newErrors.rollNo = 'Roll number is required.';
    if (!formData.projectTitle.trim()) newErrors.projectTitle = 'Project title is required.';
    if (!formData.problemStatement.trim()) newErrors.problemStatement = 'Problem statement is required.';
    if (!formData.currentProgress) newErrors.currentProgress = 'Select the current stage of the project.';
    if (formData.expectedHelp.length === 0 && !formData.customHelp.trim()) {
      newErrors.expectedHelp = 'Please specify at least one kind of help expected from IIC.';
    }
    if (!formData.pptFile) newErrors.pptFile = 'Please attach your project presentation.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit payload logic
    console.log('Idea Submission Data:', formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <CheckCircle2 size={64} className={styles.successIcon} />
          <h2>Idea Submitted Successfully!</h2>
          <p>
            Thank you, <strong>{formData.name}</strong>. Your project proposal for <strong>"{formData.projectTitle}"</strong> has been received by the Institution's Innovation Council (IIC).
          </p>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: '',
                rollNo: '',
                projectTitle: '',
                problemStatement: '',
                currentProgress: '',
                expectedHelp: [],
                customHelp: '',
                pptFile: null
              });
            }}
          >
            Submit Another Proposal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* =========================================================
          HERO SECTION (ON-SCREEN LOAD ANIMATION & QUOTE TRANSITION)
          ========================================================= */}
      <section className={styles.heroCard}>
        <div className={styles.editorialGrid}>
          {/* Left Column: Heading, Subtitle, CTA with on-screen load entrance */}
          <motion.div
            className={styles.heroLeftCol}
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className={styles.heroEyebrow} variants={heroItemVariants}>
              <span>IDEA</span>
              <span className={styles.heroEyebrowDot}>•</span>
              <span>INNOVATION</span>
              <span className={styles.heroEyebrowDot}>•</span>
              <span>IMPACT</span>
            </motion.div>

            <motion.h1 className={styles.editorialTitle} variants={heroItemVariants}>
              <span className={styles.heroTitleTop}>Turn Your</span>
              <span className={styles.heroTitleAccentWrapper}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={headlineIndex}
                    className={styles.heroTitleAccent}
                    initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -14, filter: 'blur(3px)' }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {HERO_TRANSITIONS[headlineIndex]}
                  </motion.span>
                </AnimatePresence>
                <svg className={styles.heroBrushLine} viewBox="0 0 280 14" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M4 8C70 3 200 2 276 7" stroke="rgba(243, 146, 0, 0.55)" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                {/* Hand-drawn lightbulb doodle with rays & arrow in IIC colors */}
                <span className={styles.heroBulbDoodle} aria-hidden="true">
                  <svg width="58" height="58" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Doodle Arrow */}
                    <path d="M12 48 C 18 36, 32 32, 44 36" stroke="#F39200" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="3 3"/>
                    <path d="M14 42 L 10 49 L 18 51" stroke="#F39200" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* Bulb Body */}
                    <path d="M52 24 C44 24 38 30 38 38 C38 43 41 47 44 50 L44 54 C44 55 45 56 46 56 L58 56 C59 56 60 55 60 54 L60 50 C63 47 66 43 66 38 C66 30 60 24 52 24 Z" stroke="#EA580C" strokeWidth="2.6" fill="#FFF7ED" strokeLinejoin="round"/>
                    {/* Filament */}
                    <path d="M48 40 L50 33 L54 33 L56 40" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
                    {/* Bulb Base Screw & Contact */}
                    <path d="M46 59 L58 59" stroke="#2E2A8F" strokeWidth="2.4" strokeLinecap="round"/>
                    <path d="M48 62 L56 62" stroke="#2E2A8F" strokeWidth="2.4" strokeLinecap="round"/>
                    <path d="M50 65 L54 65" stroke="#2E2A8F" strokeWidth="2.4" strokeLinecap="round"/>
                    {/* Glowing Rays */}
                    <path d="M52 14 L52 18" stroke="#F39200" strokeWidth="2.6" strokeLinecap="round"/>
                    <path d="M64 18 L61 21" stroke="#F39200" strokeWidth="2.6" strokeLinecap="round"/>
                    <path d="M72 30 L68 31" stroke="#F39200" strokeWidth="2.6" strokeLinecap="round"/>
                    <path d="M72 44 L68 43" stroke="#F39200" strokeWidth="2.6" strokeLinecap="round"/>
                    <path d="M40 18 L43 21" stroke="#F39200" strokeWidth="2.6" strokeLinecap="round"/>
                    <path d="M30 24 C 33 22, 36 21, 38 22" stroke="#F39200" strokeWidth="2.6" strokeLinecap="round"/>
                    <path d="M28 28 C 30 27, 33 26, 35 27" stroke="#F39200" strokeWidth="2.6" strokeLinecap="round"/>
                  </svg>
                </span>
              </span>
            </motion.h1>

            <motion.p className={styles.editorialSubtitle} variants={heroItemVariants}>
              Share your thoughts, explore possibilities and take the first step towards innovation. Every big change starts with a single idea.
            </motion.p>

            <motion.div className={styles.editorialActions} variants={heroItemVariants}>
              <button
                type="button"
                className={styles.editorialPrimaryBtn}
                onClick={() => {
                  document.getElementById('pitch-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Submit Your Idea</span>
                <span className={styles.btnArrow}>→</span>
              </button>
              <button
                type="button"
                className={styles.editorialSecondaryBtn}
                onClick={() => {
                  document.getElementById('workflow-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>View Process</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Center Vertical Divider */}
          <div className={styles.heroCenterDivider} aria-hidden="true" />

          {/* Right Column: Hero Quote Card with Smooth Text Transition & Mini Steps */}
          <motion.div
            className={styles.heroRightCol}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.quoteCard}>
              <div className={styles.quoteTopRow}>
                <div className={styles.quoteIconBadge}>
                  <Quote size={18} className={styles.quoteIconSvg} />
                </div>
                <span className={styles.quoteTagline}>INNOVATION MANIFESTO</span>
              </div>

              <div className={styles.quoteTransitionWrapper}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quoteIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className={styles.quoteInner}
                  >
                    <p className={styles.quoteText}>
                      “{HERO_QUOTES[quoteIndex].text}”
                    </p>
                    <div className={styles.quoteDivider} aria-hidden="true" />
                    <div className={styles.quoteFooter}>
                      <span className={styles.quoteAuthor}>{HERO_QUOTES[quoteIndex].author}</span>
                      <span className={styles.quoteRole}>{HERO_QUOTES[quoteIndex].role}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Quote slide indicator dots */}
              <div className={styles.quoteDotsNav} aria-label="Quote slide controls">
                {HERO_QUOTES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuoteIndex(idx)}
                    className={`${styles.quoteNavDot} ${idx === quoteIndex ? styles.quoteNavDotActive : ''}`}
                    aria-label={`Show quote ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          MAIN PITCH PROPOSAL FORM
          ========================================================= */}
      <motion.div
        className={styles.formIntroBar}
        id="pitch-form"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={scrollSectionVariants}
      >
        <span className={styles.formIntroBadge}>
          <FileText size={16} /> Pitch Proposal Form
        </span>
        <h2>Submit Your Project for Council Review</h2>
        <p>Complete the details below to submit your idea or prototype for incubation and mentoring.</p>
      </motion.div>

      {/* Main Form Container with On-Scroll & On-Load Entrance */}
      <motion.form
        onSubmit={handleSubmit}
        className={styles.formCard}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        variants={formContainerVariants}
      >
        {/* Section 1: Student Information */}
        <motion.div
          className={styles.formSection}
          variants={formSectionVariants}
        >
          <h2 className={styles.sectionTitle}>
            <User size={20} className={styles.sectionIcon} /> 1. Team Lead & Student Details
          </h2>
          <div className={styles.twoColumnGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name <span className={styles.req}>*</span></label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Jane Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? styles.inputError : ''}
                />
              </div>
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="rollNo">Roll Number / Student ID <span className={styles.req}>*</span></label>
              <div className={styles.inputWrapper}>
                <Hash size={18} className={styles.inputIcon} />
                <input
                  id="rollNo"
                  name="rollNo"
                  type="text"
                  placeholder="e.g., 22BQ1A0501"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  className={errors.rollNo ? styles.inputError : ''}
                />
              </div>
              {errors.rollNo && <span className={styles.errorText}>{errors.rollNo}</span>}
            </div>
          </div>
        </motion.div>

        {/* Section 2: Project Definition */}
        <motion.div
          className={styles.formSection}
          variants={formSectionVariants}
        >
          <h2 className={styles.sectionTitle}>
            <FileText size={20} className={styles.sectionIcon} /> 2. Project Title & Problem Statement
          </h2>

          <div className={styles.formGroup}>
            <label htmlFor="projectTitle">Project Title <span className={styles.req}>*</span></label>
            <input
              id="projectTitle"
              name="projectTitle"
              type="text"
              placeholder="e.g., IoT-Powered Precision Agriculture & Irrigation System"
              value={formData.projectTitle}
              onChange={handleInputChange}
              className={errors.projectTitle ? styles.inputError : ''}
            />
            {errors.projectTitle && <span className={styles.errorText}>{errors.projectTitle}</span>}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelWithCounter}>
              <label htmlFor="problemStatement">Problem Statement & Proposed Solution <span className={styles.req}>*</span></label>
              <span className={styles.charCounter}>{formData.problemStatement.length} / 1000</span>
            </div>
            <textarea
              id="problemStatement"
              name="problemStatement"
              rows={4}
              maxLength={1000}
              placeholder="Describe the real-world problem you are addressing, target users, and your innovative approach..."
              value={formData.problemStatement}
              onChange={handleInputChange}
              className={errors.problemStatement ? styles.inputError : ''}
            />
            {errors.problemStatement && <span className={styles.errorText}>{errors.problemStatement}</span>}
          </div>
        </motion.div>

        {/* Section 3: Current Progress */}
        <motion.div
          className={styles.formSection}
          variants={formSectionVariants}
        >
          <h2 className={styles.sectionTitle}>
            <Activity size={20} className={styles.sectionIcon} /> 3. Current Progress of the Project
          </h2>
          <div className={styles.radioGrid}>
            {STAGE_OPTIONS.map((stage) => (
              <label
                key={stage}
                className={`${styles.stageCard} ${formData.currentProgress === stage ? styles.stageCardActive : ''}`}
              >
                <input
                  type="radio"
                  name="currentProgress"
                  value={stage}
                  checked={formData.currentProgress === stage}
                  onChange={handleInputChange}
                />
                <span>{stage}</span>
              </label>
            ))}
          </div>
          {errors.currentProgress && <span className={styles.errorText}>{errors.currentProgress}</span>}
        </motion.div>

        {/* Section 4: Expected Help from IIC */}
        <motion.div
          className={styles.formSection}
          variants={formSectionVariants}
        >
          <h2 className={styles.sectionTitle}>
            <HelpCircle size={20} className={styles.sectionIcon} /> 4. What Kind of Help Are You Expecting from IIC?
          </h2>
          <p className={styles.sectionHelper}>Select all that apply to your requirements:</p>
          <div className={styles.checkboxGrid}>
            {SUPPORT_OPTIONS.map((option) => (
              <label key={option} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.expectedHelp.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <div className={styles.formGroup} style={{ marginTop: '16px' }}>
            <label htmlFor="customHelp">Other Specific Requests (Optional)</label>
            <input
              id="customHelp"
              name="customHelp"
              type="text"
              placeholder="e.g., Specific sensor kit, GPU compute access, industry mentors..."
              value={formData.customHelp}
              onChange={handleInputChange}
            />
          </div>
          {errors.expectedHelp && <span className={styles.errorText}>{errors.expectedHelp}</span>}
        </motion.div>

        {/* Section 5: Project Presentation (PPT / PDF) */}
        <motion.div
          className={styles.formSection}
          variants={formSectionVariants}
        >
          <h2 className={styles.sectionTitle}>
            <Upload size={20} className={styles.sectionIcon} /> 5. Project Pitch Deck / Presentation
          </h2>
          <p className={styles.sectionHelper}>
            Attach your slide deck summarizing problem, architecture, budget, and timeline (.ppt, .pptx, or .pdf, Max 25MB).
          </p>

          <div
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''} ${formData.pptFile ? styles.dropZoneHasFile : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {formData.pptFile ? (
              <div className={styles.fileDetails}>
                <FileText size={36} className={styles.fileIcon} />
                <div className={styles.fileMeta}>
                  <strong>{formData.pptFile.name}</strong>
                  <span>{(formData.pptFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <button
                  type="button"
                  className={styles.removeFileBtn}
                  onClick={() => setFormData(prev => ({ ...prev, pptFile: null }))}
                  aria-label="Remove File"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={36} className={styles.uploadIcon} />
                <p className={styles.uploadPrompt}>
                  <strong>Click to browse</strong> or drag and drop your deck here
                </p>
                <span className={styles.uploadHint}>Supported formats: PPT, PPTX, PDF</span>
                <input
                  type="file"
                  id="pptUpload"
                  accept=".ppt,.pptx,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className={styles.hiddenFileInput}
                />
              </>
            )}
          </div>
          {errors.pptFile && <span className={styles.errorText}>{errors.pptFile}</span>}
        </motion.div>

        {/* Submit Actions with Project-Brand Button */}
        <motion.div
          className={styles.submitRow}
          variants={formSectionVariants}
        >
          <motion.button
            type="submit"
            className={styles.submitBtn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send size={18} />
            <span>Submit Innovation Proposal</span>
          </motion.button>
        </motion.div>
      </motion.form>

      {/* =========================================================
          HOW YOUR IDEA MOVES FORWARD (ROADMAP TIMELINE)
          ========================================================= */}
      <motion.section
        className={styles.processSection}
        id="workflow-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={scrollSectionVariants}
      >
        <div className={styles.processHeader}>
          <div className={styles.processBadge}>
            ROADMAP & LIFECYCLE
          </div>
          <h2 className={styles.processTitle}>
            How Your Idea <span className={styles.processTitleAccent}>Moves Forward</span>
          </h2>
          <p className={styles.processSubtitle}>
            From initial concept to full-scale incubation: follow the structured path every idea takes through the Council.
          </p>
        </div>

        <motion.div
          className={styles.processGrid}
          variants={stepListVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {PROCESS_STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              className={`${styles.processStep} ${styles['processStep' + (idx + 1)]}`}
              variants={stepItemVariants}
            >
              <div className={styles.stepTrack}>
                <span className={styles.stepNumber}>{step.number}</span>
                {idx < PROCESS_STEPS.length - 1 && <span className={styles.stepLine} aria-hidden="true" />}
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepName}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
}

export default Ideabank;
