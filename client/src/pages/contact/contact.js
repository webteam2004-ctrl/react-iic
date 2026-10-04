// ============================================================================
// ACTIVE IMPLEMENTATION (Integrated from Desktop with On-Load & On-Scroll Motion)
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import {
	FaLinkedinIn,
	FaInstagram,
	FaMapMarkerAlt,
	FaEnvelope,
	FaPhone,
	FaClock,
	FaArrowRight
} from 'react-icons/fa';
import styles from './Contact.module.css';

// Animation variants for smooth on-load and on-scroll reveals
const heroContainerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.1
		}
	}
};


const scrollSectionVariants = {
	hidden: { opacity: 0, y: 28 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
	}
};

const cardsStaggerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.05
		}
	}
};

const cardItemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
	}
};

function Contact() {
	const [typedTitle, setTypedTitle] = React.useState("");
	const [typingFinished, setTypingFinished] = React.useState(false);
	const typedHeadline =
		"“Your curiosity can start an idea. Let's connect and turn it into a breakthrough.”";
	const breakIndex = typedHeadline.indexOf(" Let's connect");

	React.useEffect(() => {
		if (typingFinished) return undefined;
		if (typedTitle.length >= typedHeadline.length) {
			setTypingFinished(true);
			return undefined;
		}

		const timer = window.setTimeout(() => {
			setTypedTitle(typedHeadline.slice(0, typedTitle.length + 1));
		}, 28);

		return () => window.clearTimeout(timer);
	}, [typedHeadline, typedTitle, typingFinished]);

	return (
		<div className={styles.wrap}>

			<main>

				{/* ================= HERO (MATCHING REFERENCE IMAGE) ================= */}
				<motion.section
					className={styles['hero-contact']}
					initial='hidden'
					animate='visible'
					variants={heroContainerVariants}
				>
					<p className={styles['hero-eyebrow']}>CONTACT US</p>
					<h2 className={styles['hero-headline']}>
						<span>
							{typedTitle.length <= breakIndex
								? typedTitle
								: typedTitle.slice(0, breakIndex)}
						</span>
						{typedTitle.length > breakIndex && (
							<>
								<br />
								<span>{typedTitle.slice(breakIndex).trimStart()}</span>
							</>
						)}
						{!typingFinished && (
							<span className={styles['headingCursor']} aria-hidden='true' />
						)}
					</h2>
				</motion.section>


				{/* ================= CONTACT CARDS (ON-SCROLL STAGGER) ================= */}
				<motion.section
					className={styles['contact-cards']}
					initial='hidden'
					whileInView='visible'
					viewport={{ once: true, margin: '-40px' }}
					variants={cardsStaggerVariants}
				>

					<motion.div
						className={styles['contact-card']}
						variants={cardItemVariants}
						whileHover={{ y: -4, transition: { duration: 0.2 } }}
					>
						<div className={styles['contact-icon']}>
							<FaMapMarkerAlt />
						</div>
						<div>
							<h3>Visit Us</h3>
							<p>VVITU University, Namburu</p>
						</div>
					</motion.div>

					<motion.div
						className={styles['contact-card']}
						variants={cardItemVariants}
						whileHover={{ y: -4, transition: { duration: 0.2 } }}
					>
						<div className={styles['contact-icon']}>
							<FaEnvelope />
						</div>

						<div>
							<h3>Email Us</h3>

							<a href='mailto:iicVVITU@VVITU.net'>
								iicVVITU@VVITU.net
							</a>

							<br />

							<a href='mailto:vvitu@vvit.net'>
								vvitu@vvit.net
							</a>
						</div>
					</motion.div>

					<motion.div
						className={styles['contact-card']}
						variants={cardItemVariants}
						whileHover={{ y: -4, transition: { duration: 0.2 } }}
					>
						<div className={styles['contact-icon']}>
							<FaPhone />
						</div>
						<div>
							<h3>Call Us</h3>
							<a href='tel:+919392042226'>
								+91 93920 42226
							</a>
						</div>
					</motion.div>

					<motion.div
						className={styles['contact-card']}
						variants={cardItemVariants}
						whileHover={{ y: -4, transition: { duration: 0.2 } }}
					>
						<div className={styles['contact-icon']}>
							<FaClock />
						</div>
						<div>
							<h3>Office Hours</h3>
							<p>Mon – Sat · 8:00 AM – 4:00 PM</p>
						</div>
					</motion.div>

				</motion.section>


				{/* ================= FORM + COORDINATOR (ON-SCROLL ANIMATION) ================= */}
				<motion.section
					className={styles['main-contact-section']}
					initial='hidden'
					whileInView='visible'
					viewport={{ once: true, margin: '-50px' }}
					variants={scrollSectionVariants}
				>

					{/* CONTACT FORM */}
					<div className={styles['form-card']}>

						<div className={styles['section-heading']}>
							<span>GET IN TOUCH</span>
							<h2>Send Us a Message</h2>
							<p>
								Have a question or an innovative idea?
								Fill out the form and our team will get back to you.
							</p>
						</div>

						<form
							className={styles['contact-form']}
							onSubmit={(e) => e.preventDefault()}
						>

							<div className={styles['form-row']}>

								<div className={styles['form-group']}>
									<label htmlFor='name'>Full Name</label>
									<input
										id='name'
										type='text'
										placeholder='Enter your name'
									/>
								</div>

								<div className={styles['form-group']}>
									<label htmlFor='email'>Email Address</label>
									<input
										id='email'
										type='email'
										placeholder='Enter your email'
									/>
								</div>

							</div>


							<div className={styles['form-row']}>

								<div className={styles['form-group']}>
									<label htmlFor='department'>
										Department / Year
									</label>

									<input
										id='department'
										type='text'
										placeholder='e.g. CSE / 3rd Year'
									/>
								</div>

								<div className={styles['form-group']}>
									<label htmlFor='subject'>Subject</label>

									<select id='subject' defaultValue=''>
										<option value='' disabled>
											Select a subject
										</option>
										<option value='general'>
											General Inquiry
										</option>
										<option value='innovation'>
											Innovation
										</option>
										<option value='startup'>
											Startup
										</option>
										<option value='event'>
											Event
										</option>
										<option value='collaboration'>
											Collaboration
										</option>
										<option value='other'>
											Other
										</option>
									</select>
								</div>

							</div>


							<div className={styles['form-group']}>
								<label htmlFor='message'>Message</label>

								<textarea
									id='message'
									rows='5'
									placeholder='Tell us how we can help...'
								></textarea>
							</div>


							<motion.button
								type='submit'
								className={styles['submit-btn']}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								Send Message
								<FaArrowRight />
							</motion.button>

						</form>

					</div>

				</motion.section>


				{/* ================= MAP (ON-SCROLL ANIMATION) ================= */}
				<motion.section
					className={styles['map-section']}
					initial='hidden'
					whileInView='visible'
					viewport={{ once: true, margin: '-50px' }}
					variants={scrollSectionVariants}
				>

					<div className={styles['map-title']}>
						<span>FIND US</span>
						<h2>Visit Our Campus</h2>
						<p>
							Located at VVITU University in Namburu,
							our innovation community is open to students,
							faculty and collaborators.
						</p>
					</div>

					<div className={styles['map-content']}>

						<motion.div
							className={styles['map-container']}
							initial={{ opacity: 0, scale: 0.98 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
						>
							<iframe
								src='https://maps.google.com/maps?q=Vasireddy%20Venkatadri%20Institute%20of%20Technology%2C%20Nambur&t=&z=15&ie=UTF8&iwloc=&output=embed'
								width='100%'
								height='100%'
								style={{ border: 0 }}
								allowFullScreen
								loading='lazy'
								referrerPolicy='no-referrer-when-downgrade'
								title='VVITU University Map'
							></iframe>
						</motion.div>

						<motion.div
							className={styles['address-card']}
							initial={{ opacity: 0, x: 20 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.1 }}
						>

							<span>OUR LOCATION</span>

							<h3>Institution's Innovation Council</h3>

							<p>
								Vasireddy Venkatadri Institute of Technology
								(VVITU)
							</p>

							<p>
								Namburu, Guntur District,
								Andhra Pradesh, India
							</p>

							<div className={styles['address-divider']}></div>

							<h4>Follow IIC</h4>

							<div className={styles['social-links']}>

								<a
									href='https://www.linkedin.com/in/iic-VVITU-624755321/'
									className={styles['social-link']}
									aria-label='LinkedIn'
									target='_blank'
									rel='noopener noreferrer'
								>
									<FaLinkedinIn />
								</a>

								<a
									href='https://www.instagram.com/iic_VVITU/'
									className={styles['social-link']}
									aria-label='Instagram'
									target='_blank'
									rel='noopener noreferrer'
								>
									<FaInstagram />
								</a>

							</div>

						</motion.div>

					</div>

				</motion.section>

			</main>

		</div>
	);
}

export default Contact;
