import React from "react";
import { api, resolveMediaUrl } from "../../services/api";
import styles from "./Teams.module.css";

const TEAM_QUOTE =
	"“Your curiosity can start an idea. Our teamwork can turn it into a breakthrough.”";
const TEAM_QUOTE_BREAK = TEAM_QUOTE.indexOf("Our teamwork");

const panelDescriptions = {
	"IIC Co-ordinators":
		"Our faculty coordinators provide academic guidance and institutional support, bridging innovation initiatives and curriculum integration.",
	"IIC Presidents":
		"Student leaders who spearhead IIC activities and represent the innovation council.",
	"Social Media Department":
		"The Social Media Department is the digital voice of IIC, highlighting innovation, entrepreneurship, and student achievements.",
	"Public Relations":
		"Our PR team builds relationships with stakeholders, media, industry partners, and alumni.",
	"Web Development":
		"The Web Development team builds and maintains the digital platforms that support IIC initiatives.",
	Events:
		"The Events team plans and delivers engaging innovation, entrepreneurship, and student development programs.",
	"Review & Validation":
		"The Review & Validation team helps maintain quality and consistency across IIC activities.",
};

function LinkedInIcon() {
	return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;
}

function GitHubIcon() {
	return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7A11.5 11.5 0 0 0 8.36 23.1c.58.1.79-.25.79-.56v-2.02c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.3-5.27-1.29-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.71 5.39-5.29 5.68.42.36.79 1.07.79 2.16v3.04c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" /></svg>;
}

function MemberCard({ member, index, panel }) {
	const linkedinUrl = member.linkedin_url || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(member.full_name || member.name)}`;
	const githubUrl = member.github_url || `https://github.com/search?q=${encodeURIComponent(member.full_name || member.name)}&type=users`;
	const name = member.full_name || member.name;
	const image = resolveMediaUrl(member.public_image_url || member.image_url || member.profile_image);

	return (
		<article className={`${styles.memberCard} ${panel === "IIC Co-ordinators" ? styles.coordinatorCard : ""}`} style={{ "--card-delay": `${Math.min(index, 7) * 70}ms` }}>
			<figure className={styles.memberFigure}>
				<span className={styles.memberInitials} aria-hidden="true">{name?.slice(0, 2).toUpperCase() || "TM"}</span>
				{image && <img src={image} alt={name} className={styles.memberImage} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />}
			</figure>
			<div className={styles.memberBody}>
				<div className={styles.memberHeader}>
					<h3 className={styles.memberName}>{name}</h3>
					<p className={styles.memberDepartment}>{member.role || "Team Member"}</p>
				</div>
				<div className={styles.memberMeta}>
					<a className={styles.socialLink} href={linkedinUrl} target="_blank" rel="noreferrer" aria-label={`Find ${name} on LinkedIn`}><LinkedInIcon /></a>
					{panel === "Web Development" && <a className={styles.socialLink} href={githubUrl} target="_blank" rel="noreferrer" aria-label={`Find ${name} on GitHub`}><GitHubIcon /></a>}
				</div>
			</div>
		</article>
	);
}

function TeamSection({ section, index }) {
	const sectionRef = React.useRef(null);
	const railRef = React.useRef(null);
	React.useEffect(() => {
		const element = sectionRef.current;
		if (!element) return undefined;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				element.classList.add(styles.visible);
				observer.disconnect();
			}
		}, { threshold: 0.12 });
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		<section ref={sectionRef} className={`${styles.teamSection} ${index % 2 ? styles.reverse : ""}`} aria-labelledby={`team-${index}`}>
			<div className={styles.sectionHeading}>
				<div className={styles.sectionNumber}>{String(index + 1).padStart(2, "0")}</div>
				<div className={styles.sectionText}>
					<p className={styles.eyebrow}>VVITU IIC • Team Directory</p>
					<h2 id={`team-${index}`}>{section.panel}</h2>
					<p>{panelDescriptions[section.panel] || "IIC team members and contributors."}</p>
				</div>
			</div>
			<div className={`${styles.railShell} ${section.members.length > 3 ? styles.withArrows : ""}`}>
				<div className={`${styles.memberRail} ${section.members.length <= 3 ? styles.centered : ""}`} ref={railRef}>
					{section.members.map((member, memberIndex) => <MemberCard key={member.id || `${member.name}-${memberIndex}`} member={member} index={memberIndex} panel={section.panel} />)}
				</div>
			</div>
			<p className={styles.scrollHint}>Scroll to meet the team</p>
		</section>
	);
}

export default function Teams() {
	const [members, setMembers] = React.useState([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState("");
	const [typedQuote, setTypedQuote] = React.useState("");
	const [typingFinished, setTypingFinished] = React.useState(false);
	const directoryRef = React.useRef(null);
	const hasAutoScrolled = React.useRef(false);

	React.useEffect(() => {
		let mounted = true;
		api.teams.getAll()
			.then((response) => { if (mounted) setMembers(response.teamMembers || response.teams || []); })
			.catch((requestError) => { if (mounted) setError(requestError.message || "Unable to load the team directory."); })
			.finally(() => { if (mounted) setLoading(false); });
		return () => { mounted = false; };
	}, []);

	React.useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setTypedQuote(TEAM_QUOTE);
			setTypingFinished(true);
			return undefined;
		}
		if (typingFinished) return undefined;
		const timer = window.setTimeout(() => {
			const next = TEAM_QUOTE.slice(0, typedQuote.length + 1);
			setTypedQuote(next);
			if (next.length === TEAM_QUOTE.length) setTypingFinished(true);
		}, 32);
		return () => window.clearTimeout(timer);
	}, [typedQuote, typingFinished]);

	const sections = [...new Set(members.map((member) => member.panel || member.role).filter(Boolean))].map((panel) => ({
		panel,
		members: members.filter((member) => (member.panel || member.role) === panel),
	}));

	return (
		<div className={styles.wrap}>
			<main className={styles.main}>
				<div className={styles.intro}>
					<p>Our Teams</p>
					<h2 aria-label={TEAM_QUOTE}>{typedQuote}{!typingFinished && <span className={styles.quoteCursor} aria-hidden="true" />}</h2>
				</div>
				<div className={styles.teamDirectory}>
					{loading && <p className={styles.loadingMessage}>Loading team directory...</p>}
					{error && <p className={styles.loadingMessage}>{error}</p>}
					{!loading && !error && sections.length === 0 && <p className={styles.loadingMessage}>No team members have been published yet.</p>}
					{sections.map((section, index) => <TeamSection key={section.panel} section={section} index={index} />)}
				</div>
			</main>
		</div>
	);
}
