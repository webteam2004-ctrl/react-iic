import React, { useState, useEffect, useMemo } from 'react';
import {
	Calendar as CalendarIcon,
	Table,
	Clock,
	MapPin,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	ArrowUpRight
} from 'lucide-react';
import styles from './Calender.module.css';
import initialEvents from '../../eventsdata/events.json';
import { api } from '../../services/api';

function Calender() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [events, setEvents] = useState(initialEvents);
	const [selectedDay, setSelectedDay] = useState(() => {
		const now = new Date();
		const thisMonthEvents = initialEvents.filter(e => e.month === now.getMonth() && e.year === now.getFullYear());
		if (thisMonthEvents.length > 0) return thisMonthEvents[0].date;
		return now.getDate();
	});
	const [showYearSelector, setShowYearSelector] = useState(false);
	const [activeView, setActiveView] = useState('calendar'); // 'calendar' | 'table'

	useEffect(() => {
		let isMounted = true;
		async function loadSchedule() {
			try {
				const res = await api.calendar.getSchedule();
				if (res && res.success && Array.isArray(res.calendar) && res.calendar.length > 0) {
					const formattedDbEvents = res.calendar.map((item) => {
						const startDate = new Date(item.start_time);
						const endDate = item.end_time ? new Date(item.end_time) : null;

						let timeStr = '';
						const formatTime = (d) =>
							d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

						if (!isNaN(startDate.getTime())) {
							if (endDate && !isNaN(endDate.getTime())) {
								timeStr = `${formatTime(startDate)} - ${formatTime(endDate)}`;
							} else {
								timeStr = formatTime(startDate);
							}
						}

						return {
							id: item.id,
							title: item.title,
							date: startDate.getDate(),
							month: startDate.getMonth(),
							year: startDate.getFullYear(),
							category:
								item.category ||
								(item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Event'),
							location: item.location || 'VVITU Campus',
							time: timeStr || 'Scheduled',
							description: item.description || '',
							isDbEvent: true
						};
					});

					// Merge with static seed events to preserve historical records, deduplicating by title
					const dbTitles = new Set(formattedDbEvents.map((e) => e.title.toLowerCase().trim()));
					const nonDuplicateStatic = initialEvents.filter(
						(e) => !dbTitles.has(e.title.toLowerCase().trim())
					);

					if (isMounted) {
						const merged = [...formattedDbEvents, ...nonDuplicateStatic];
						setEvents(merged);

						// If currently viewed month has events, ensure an event day is selected
						const now = new Date();
						const currentMonthEvents = merged.filter(
							(e) => e.month === now.getMonth() && e.year === now.getFullYear()
						);
						if (currentMonthEvents.length > 0) {
							setSelectedDay((prev) => {
								const hasCurrentSelection = currentMonthEvents.some((e) => e.date === prev);
								return hasCurrentSelection ? prev : currentMonthEvents[0].date;
							});
						}
					}
				}
			} catch (err) {
				console.warn('[Calendar] Could not fetch live schedule, falling back to static data:', err);
			}
		}

		loadSchedule();
		return () => {
			isMounted = false;
		};
	}, []);

	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const today = useMemo(() => new Date(), []);

	const previousMonth = () => {
		setCurrentDate(new Date(year, month - 1, 1));
		setSelectedDay(null);
	};

	const nextMonth = () => {
		setCurrentDate(new Date(year, month + 1, 1));
		setSelectedDay(null);
	};

	const goToToday = () => {
		const now = new Date();
		setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
		setSelectedDay(now.getDate());
	};

	const yearOptions = Array.from(
		new Set([year, ...events.map((event) => event.year)])
	).sort((a, b) => a - b);

	const selectYear = (selectedYear) => {
		setCurrentDate(new Date(selectedYear, month, 1));
		setShowYearSelector(false);
	};

	const getEventForDate = (day) => {
		return events.find(
			(event) =>
				event.date === day &&
				event.month === month &&
				event.year === year
		);
	};

	const calendarDays = [];
	for (let i = 0; i < firstDay; i++) {
		calendarDays.push(null);
	}
	for (let day = 1; day <= daysInMonth; day++) {
		calendarDays.push(day);
	}

	const isEventToday = (event) => {
		return (
			event.date === today.getDate() &&
			event.month === today.getMonth() &&
			event.year === today.getFullYear()
		);
	};

	// Sorted activities this month with today's live event pinned to the top
	const currentMonthEvents = useMemo(() => {
		const monthEvts = events.filter(
			(event) => event.month === month && event.year === year
		);

		// Chronological order
		const sorted = [...monthEvts].sort((a, b) => a.date - b.date);

		// If viewing the current month & year and there is an event today, pin it to the top!
		const isCurrentViewingMonthAndYear =
			today.getMonth() === month && today.getFullYear() === year;

		if (isCurrentViewingMonthAndYear) {
			const todayDate = today.getDate();
			const todayEvents = [];
			const otherEvents = [];

			sorted.forEach((event) => {
				if (event.date === todayDate) {
					todayEvents.push(event);
				} else {
					otherEvents.push(event);
				}
			});

			// Pinned on top if today; when it ends, stays in normal sorted order
			if (todayEvents.length > 0) {
				return [...todayEvents, ...otherEvents];
			}
		}

		return sorted;
	}, [month, year, today, events]);

	// Schedule table: most recent events on top, earlier at the end
	const sortedAllEvents = useMemo(() => {
		return [...events].sort((a, b) => {
			const dateA = new Date(a.year, a.month, a.date);
			const dateB = new Date(b.year, b.month, b.date);
			return dateB - dateA;
		});
	}, [events]);

	// Jump from Table directly into the Calendar view
	const jumpToEvent = (event) => {
		setCurrentDate(new Date(event.year, event.month, 1));
		setSelectedDay(event.date);
		setActiveView('calendar');
		window.scrollTo({ top: 350, behavior: 'smooth' });
	};

	// Helper: category tag styling class
	const getCategoryClass = (category = '') => {
		const cat = category.toLowerCase();
		if (cat.includes('ideathon') || cat.includes('hack')) return styles.catIdeathon;
		if (cat.includes('incubation')) return styles.catIncubation;
		if (cat.includes('webinar') || cat.includes('policy')) return styles.catWebinar;
		if (cat.includes('outreach')) return styles.catOutreach;
		if (cat.includes('industrial') || cat.includes('industry')) return styles.catIndustrial;
		if (cat.includes('celebration')) return styles.catCelebration;
		return styles.catDefault;
	};

	const getOrdinal = (n) => {
		const s = ['th', 'st', 'nd', 'rd'];
		const v = n % 100;
		return s[(v - 20) % 10] || s[v] || s[0];
	};

	return (
		<main className={styles.mainContainer}>

			{/* HERO SECTION */}
			<section className={styles.heroCalendar}>
				<div className={styles.heroContent}>
					<div className={styles.badgeWrapper}>
						<span className={styles.sparkleDot}></span>
						<p className={styles.eyebrow}>IIC • VVITU</p>
					</div>

					<h1 className={styles.heroHeading}>
						Event <span>Calendar</span>
					</h1>

					<p className={styles.heroText}>
						Track all IIC events, workshops, bootcamps, competitions, and community gatherings. Plan your participation in upcoming innovation initiatives.
					</p>

					{/* VIEW SWITCHER TABS (CALENDAR & SCHEDULE TABLE) */}
					<div className={styles.viewTabs} role="tablist">
						<button
							className={`${styles.viewTab} ${activeView === 'calendar' ? styles.viewTabActive : ''}`}
							onClick={() => setActiveView('calendar')}
							role="tab"
							aria-selected={activeView === 'calendar'}
						>
							<CalendarIcon size={16} />
							<span>Calendar Grid</span>
							{/* <span className={activeView === 'calendar' ? styles.tabBadge : styles.tabBadgeMuted}>
								{currentMonthEvents.length}
							</span> */}
						</button>

						<button
							className={`${styles.viewTab} ${activeView === 'table' ? styles.viewTabActive : ''}`}
							onClick={() => setActiveView('table')}
							role="tab"
							aria-selected={activeView === 'table'}
						>
							<Table size={16} />
							<span>Schedule Table</span>
							{/* <span className={activeView === 'table' ? styles.tabBadge : styles.tabBadgeMuted}>
								{events.length}
							</span> */}
						</button>
					</div>
				</div>
			</section>


			{/* 1. CALENDAR GRID VIEW */}
			{activeView === 'calendar' && (
				<section className={styles.calendarSection}>
					<div className={styles.calendarContainer}>

						{/* CALENDAR CARD (LEFT) */}
						<div className={styles.calendarCard}>

							<div className={styles.calendarHeader}>
								<div className={styles.monthTitleWrapper}>
									<h2 className={styles.monthTitle}>
										{monthNames[month]} <span>{year}</span>
									</h2>
									<p className={styles.monthSubtitle}>
										Explore upcoming IIC activities
									</p>
								</div>

								<div className={styles.calendarControls}>
									<button
										className={styles.todayButton}
										onClick={goToToday}
										title="Jump to current date"
									>
										Today
									</button>

									<button
										className={styles.navArrowBtn}
										onClick={previousMonth}
										aria-label="Previous month"
									>
										<ChevronLeft size={18} />
									</button>

									<div className={styles.yearSelector}>
										<button
											className={styles.yearSelectorButton}
											onClick={() => setShowYearSelector(!showYearSelector)}
											aria-haspopup="listbox"
											aria-expanded={showYearSelector}
										>
											<span>{year}</span>
											<ChevronDown
												size={14}
												className={showYearSelector ? styles.rotateChevron : ''}
											/>
										</button>

										{showYearSelector && (
											<>
												<div
													className={styles.yearSelectorOverlay}
													onClick={() => setShowYearSelector(false)}
												/>
												<div
													className={styles.yearOptions}
													role="listbox"
												>
													{yearOptions.map((optionYear) => (
														<button
															key={optionYear}
															className={`${styles.yearOption} ${optionYear === year ? styles.yearOptionActive : ''
																}`}
															onClick={() => selectYear(optionYear)}
														>
															{optionYear}
														</button>
													))}
												</div>
											</>
										)}
									</div>

									<button
										className={styles.navArrowBtn}
										onClick={nextMonth}
										aria-label="Next month"
									>
										<ChevronRight size={18} />
									</button>
								</div>
							</div>

							{/* WEEKDAYS HEADER */}
							<div className={styles.weekdays}>
								{dayNames.map((day) => (
									<div key={day}>{day}</div>
								))}
							</div>

							{/* CALENDAR DAYS */}
							<div className={styles.calendarGrid}>
								{calendarDays.map((day, index) => {
									if (day === null) {
										return (
											<div
												key={`empty-${index}`}
												className={styles.emptyDay}
											/>
										);
									}

									const event = getEventForDate(day);
									const isToday =
										day === today.getDate() &&
										month === today.getMonth() &&
										year === today.getFullYear();
									const isSelected = selectedDay === day;

									return (
										<div
											key={day}
											className={`${styles.calendarDay} ${isToday ? styles.today : ''
												} ${event ? styles.hasEvent : ''} ${isSelected ? styles.selectedDay : ''
												}`}
											onClick={() => setSelectedDay(day)}
											role="button"
											tabIndex={0}
											aria-label={`${monthNames[month]} ${day}, ${year}${event ? ` - ${event.title}` : ''}`}
										>
											<div className={styles.dayNumber}>
												{day}
											</div>

											<div className={styles.indicatorContainer}>
												{isToday && (
													<div
														className={styles.todayIndicatorDot}
														title="Today"
													/>
												)}
												{event && (
													<div className={styles.eventMarker}>
														<span
															className={styles.eventDotPulse}
															title={event.title}
														/>
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>

							{/* CALENDAR LEGEND */}
							<div className={styles.legend}>
								<div className={styles.legendItem}>
									<span className={styles.legendDotToday}></span>
									<span>Today</span>
								</div>
								<div className={styles.legendItem}>
									<span className={styles.legendDotEvent}></span>
									<span>Event Scheduled</span>
								</div>
								<div className={styles.legendItem}>
									<span className={styles.legendDotSelected}></span>
									<span>Selected Day</span>
								</div>
							</div>

						</div>


						{/* RIGHT EVENTS PANEL: THIS MONTH ACTIVITIES */}
						<aside className={styles.eventsPanel}>
							<div className={styles.eventsPanelHeader}>
								<h2 className={styles.panelTitle}>Activities This Month</h2>
								<p className={styles.panelSubtitle}>
									Activities scheduled in {monthNames[month]} {year}
								</p>
							</div>

							<div className={styles.panelBody}>
								{currentMonthEvents.length > 0 ? (
									<div className={styles.eventsList}>
										{currentMonthEvents.map((event) => {
											const isToday = isEventToday(event);
											const isSelected = selectedDay === event.date;

											return (
												<div
													className={`${styles.eventItemCard} ${isToday ? styles.pinnedTodayCard : ''}`}
													key={`${event.year}-${event.month}-${event.date}-${event.title}`}
													onClick={() => setSelectedDay(event.date)}
													role="button"
													tabIndex={0}
													style={
														isSelected
															? {
																borderColor: 'rgba(255, 255, 255, 0.45)',
																background: 'rgba(255, 255, 255, 0.12)'
															}
															: {}
													}
												>
													<div className={styles.eventDateBadge}>
														<span className={styles.badgeMonth}>
															{monthNames[event.month].slice(0, 3)}
														</span>
														<strong className={styles.badgeDay}>
															{event.date}
														</strong>
														<span className={styles.badgeYear}>
															{event.year}
														</span>
													</div>

													<div className={styles.eventItemDetails}>
														<div className={styles.itemTopRow}>
															{isToday && (
																<span className={styles.pinnedTodayBadge}>
																	<span className={styles.pinnedBlinkDot}></span>
																	TODAY'S EVENT
																</span>
															)}
															<span
																className={`${styles.categoryPillSmall} ${getCategoryClass(
																	event.category
																)}`}
															>
																{event.category}
															</span>
														</div>
														<h4 className={styles.eventItemTitle}>{event.title}</h4>
														{event.time && (
															<div className={styles.eventItemLocation}>
																<Clock size={11} />
																<span>{event.time}</span>
															</div>
														)}
														{event.location && (
															<div className={styles.eventItemLocation}>
																<MapPin size={11} />
																<span>{event.location}</span>
															</div>
														)}
													</div>

													<ChevronRight size={16} className={styles.itemChevron} />
												</div>
											);
										})}
									</div>
								) : (
									<div className={styles.emptyEvents}>
										<CalendarIcon size={34} className={styles.emptyIcon} />
										<h4 className={styles.emptyHeading}>No events this month</h4>
										<p className={styles.emptyText}>
											Currently no activities scheduled for {monthNames[month]} {year}.
										</p>
										<button
											className={styles.viewUpcomingBtn}
											onClick={() => setActiveView('table')}
										>
											View Schedule Table
										</button>
									</div>
								)}
							</div>
						</aside>

					</div>
				</section>
			)}


			{/* 2. SCHEDULE TABLE VIEW */}
			{activeView === 'table' && (
				<section className={styles.calendarSection}>
					<div className={styles.eventsTableWrapper}>
						<table className={styles.eventsTable}>
							<thead>
								<tr>
									<th>#</th>
									<th>Date</th>
									<th>Day</th>
									<th>Time</th>
									<th className={styles.thHighlight}>Activity / Event Details</th>
									<th>Venue / Location</th>
									<th>Category</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{sortedAllEvents.map((event, idx) => {
									const dateObj = new Date(event.year, event.month, event.date);
									const dayOfWeek = dayNames[dateObj.getDay()];
									return (
										<tr
											key={`table-${event.year}-${event.month}-${event.date}-${idx}`}
											className={styles.eventsTableRow}
											onClick={() => jumpToEvent(event)}
										>
											<td>{idx + 1}</td>
											<td className={styles.tableDateCell}>
												{monthNames[event.month].slice(0, 3)} {event.date}
												<sup>{getOrdinal(event.date)}</sup>, {event.year}
											</td>
											<td className={styles.tableDayCell}>{dayOfWeek}</td>
											<td className={styles.tableTimeCell}>{event.time || 'Scheduled'}</td>
											<td className={styles.tableActivityCell}>
												<div className={styles.tableActivityTitle}>{event.title}</div>
												<p className={styles.tableActivityDesc}>{event.description}</p>
											</td>
											<td className={styles.tableLocationCell}>{event.location || 'VVITU Campus'}</td>
											<td>
												<span className={`${styles.tableCategoryBadge} ${getCategoryClass(event.category)}`}>
													{event.category}
												</span>
											</td>
											<td>
												<button
													className={styles.tableJumpBtn}
													onClick={(e) => {
														e.stopPropagation();
														jumpToEvent(event);
													}}
													title="View on Interactive Calendar"
												>
													<span>Calendar</span>
													<ArrowUpRight size={12} />
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
						<div className={styles.tableFootnote}>
							* Official Institution's Innovation Council (IIC) activity schedule. All dates subject to academic notifications.
						</div>
					</div>
				</section>
			)}

		</main>
	);
}

export default Calender;
