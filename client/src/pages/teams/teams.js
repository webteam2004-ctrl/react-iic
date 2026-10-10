import React from "react";
import styles from "./Teams.module.css";

const TEAM_QUOTE =
	"“Your curiosity can start an idea. Our teamwork can turn it into a breakthrough.”";

const teamData = {
	team: [
		{
			section: "IIC Co-ordinators",
			description:
				"Our faculty coordinators provide academic guidance and institutional support, bridging the gap between innovation initiatives and curriculum integration. They ensure IIC's alignment with educational objectives while fostering an entrepreneurial ecosystem.",
			reverse: false,
			members: [
				{ name: "Dr. M.Y. Bhanu Murthy", role: "Faculty Coordinator", initials: "YMR", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/co-oridinators/Screenshot%202026-08-20%20220331.png", imgStyle: { objectPosition: "center 10%", transform: "scale(1.25)" } },
				{ name: "Dr. Krishna Prasad", role: "Faculty Coordinator", initials: "SS", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/co-oridinators/WhatsApp%20Image%202026-08-17%20at%2011.37.28%20PM.jpeg" },
				{ name: "Ch. Kalyan", role: "Faculty Coordinator", initials: "AA", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/co-oridinators/WhatsApp%20Image%202026-08-17%20at%2011.37.28%20PM%20(1).jpeg" },
			]
		},
		{
			section: "IIC Presidents",
			description:
				"Student leaders who spearhead IIC activities and represent the innovation council. They coordinate between various teams, drive strategic initiatives, and ensure effective execution of all programs while maintaining a vibrant entrepreneurial culture on campus.",
			reverse: true,
			members: [
				{ name: "Pavan Kalyan S", role: "President", initials: "PK", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Presidents/Screenshot%202026-08-20%20222053.png  " },
				{ name: "Jessy Gladwin", role: "Vice President", initials: "JG", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Presidents/JESSY%20GLADWIN-%20vice.png" },
				{ name: "Dinesh Reddy T", role: "Secretary", initials: "TDR", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Presidents/Tangirala%20Dinesh%20Reddy%20-%20sec.jpg" }
			]
		},
		{
			section: "Social Media Department",
			description:
				"The Social Media Department is the digital voice of IIC, responsible for creating engaging content that highlights innovation, entrepreneurship, and student achievements. They manage all social media platforms, ensuring consistent branding and effective communication with the IIC community.", reverse: true,
			members: [
				{ name: "Jaii Purii", role: "SM Head", initials: "JP", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/IMG-20260306-WA0188%20-%20Jaii%20Purii.jpg" },
				{ name: "Sujan Atchala", role: "SM Member", initials: "SA", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/DSC00585%20-%20Sujan%20Atchala.jpg" },
				{ name: "Chandra Lekha Chillakuri", role: "SM Member", initials: "CC", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/DSC_0318%20-%20Chandra%20lekha%20Chillakuri.jpg" },
				{ name: "Thanuja Venuthurumilli", role: "SM Member", initials: "TV", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/file_000000002fd88211806020004ed11fa4%20-%20Thanuja%20Venuthurumilli.png" },
				{ name: "Rebel Mahi", role: "SM Member", initials: "RM", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/file_00000000d4e48208a13ca3651a7e3cda%20-%20REBEL%20MAHI.png" },
				{ name: "Jithendra Soorisetti", role: "SM Member", initials: "JS", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/1000149909%20-%20Jithendra%20Soorisetti.jpg" },
				{ name: "Kodamala Anupama", role: "SM Member", initials: "KA", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/IMG-20260710-WA0122%20-%20Kodamala%20Anupama.jpg" },
				{ name: "Murali", role: "SM Member", initials: "M", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/IMG_20260512_201444%20-%20thelateral%209.jpg", imgStyle: { objectFit: "contain", objectPosition: "center" } },
				{ name: "Alasandalapalli Naga Jayanth", role: "SM Member", initials: "AJ", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/IMG_20260813_104903%20-%20Alasandalapalli%20Naga%20jayanth.jpg" },
				{ name: "Harshi Seelam", role: "SM Member", initials: "HS", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/IMG_20260815_172502%20-%20Harshi%20Seelam.png" },
				{ name: "Tavva Venkata Manasa Jyothi", role: "SM Member", initials: "TJ", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/IMG_20260815_173327%20-%20Tavva%20Venkata%20Manasa%20Jyothi.jpg" },
				{ name: "Vyshnavi Kalla", role: "SM Member", initials: "VK", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/IMG_20260815_181713%20-%20Vyshnavi%20Kalla.png" },
				{ name: "Sumaya Parvin Shaik", role: "SM Member", initials: "SS", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/SMD/S2%20-%20Sumaya%20parvin%20Shaik.jpeg" }
			]
		},
		{
			section: "Public Relations",
			description:
				"Our PR team builds and maintains relationships with external stakeholders, media, industry partners, and alumni. They manage IIC's public image, coordinate outreach programs, and create strategic partnerships that enhance our institution's innovation ecosystem.",
			reverse: false,
			members: [
				{ name: "Yogyasree Palapala", role: "PR Member", initials: "YP", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/564E9769-47DE-4E74-8960-2DFB51B29C9E%20-%20Yogyasree%20Palapala.png" },
				{ name: "Nithish Kumar Ambati", role: "PR Head", initials: "NA", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/file_00000000114c82088daf120fb8ee3ea8%20-%20Nithish%20Kumar%20Ambati.png" },
				{ name: "Haasin", role: "PR Member", initials: "H", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/file_0000000060788211b9f9e066df65c37e%20-%20Haasin.png" },
				{ name: "Rohit Lam", role: "PR Member", initials: "RL", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/file_00000000653082089da49b97f5412b94%20-%20Rohit%20Lam.png" },
				{ name: "Suguna Prakash Gajjalakonda", role: "PR Member", initials: "SG", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/id_img%20-%20Suguna%20prakash%20Gajjalakonda.png" },
				{ name: "Udvika Yeleti", role: "PR Member", initials: "UY", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/iic%20card%20-%20Udvika%20Yeleti.jpg" },
				{ name: "Devi sree", role: "PR Member", initials: "DS", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/Image-457258282%20-%20Devi%20sree.jpg" },
				{ name: "Bindu Meghana", role: "PR Member", initials: "BM", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/IMG-20251221-WA0040%20-%20bindu%20meghana.jpg" },
				{ name: "Mustaffa", role: "PR Member", initials: "M", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/IMG-20260815-WA0014%20-%20Mustaffa.jpg" },
				{ name: "Vaishnavi Maguluri", role: "PR Member", initials: "VM", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/IMG-20260815-WA0046%20-%20Vaishnavi%20Maguluri.jpg" },
				{ name: "Sumanjali Machavarapu", role: "PR Member", initials: "SM", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/IMG_20250114_113913299_AE%20-%20Sumanjali%20Machavarapu.jpg" },
				{ name: "Mojesh", role: "PR Member", initials: "M", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/IMG_20260815_215103%20-%20Mojesh.jpg" },
				{ name: "Peeka Tarun Dev", role: "PR Member", initials: "PT", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/Polish_20260815_172757733%20-%20Peeka%20Tarun%20Dev.png" },
				{ name: "Lohithaksha Sugguna", role: "PR Member", initials: "LS", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/PR/Polish_20260815_183240338%20-%20LOHITHAKSHA%20SUGGUNA.png" },

			]
		},
		{
			section: "Web Development",
			description:
				"The web development team builds and maintains IIC's digital infrastructure. They create user-friendly websites, design interfaces, implement features, ensure responsive design, and provide technical solutions that enhance online user experience and accessibility.",
			reverse: false,
			members: [
				{ name: "Leela Chaitanya", role: "Web Head", initials: "LC", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Web/WA_1786806535851%20-%20Leela%20Chaitanya.jpg", github: "https://github.com/chaitu64", linkedin: "https://www.linkedin.com/in/chunduri-leela-chaitanya-081537217/" },
				{ name: "Harsha Vardhan J", role: "Web Member", initials: "HJ", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Web/file_00000000166c8211aa55d23f66eef0da%20-%20Harsha%20vardhan%20J.png" },
				{ name: "Harini Sai", role: "Web Member", initials: "LC", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Web/Screenshot%202026-08-18%20004950.png", imgStyle: { transform: "scale(1.4)", objectPosition: "center 20%" }, github: "https://github.com/HARINISAI-18", linkedin: "https://www.linkedin.com/in/harini-sai18/" },
				{ name: "Rishitha", role: "Web Member", initials: "K", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Web/IMG_20260815_154627%20-%20KRishitha.jpg", github: "https://github.com/Rishitha0007", linkedin: "https://www.linkedin.com/in/rishitha-kattamuri-/" },
				{ name: "Siva Naik Mudavathu", role: "Web Member", initials: "SR", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Web/IMG-20260815-WA0024%20-%20Santosh%20Reddy.jpg", github: "https://github.com/SIVANAIK05", linkedin: "https://www.linkedin.com/in/siva-naik-mudavathu/" },
				{ name: "Durga Vyshnavi Lingamneni", role: "Web Member", initials: "DL", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Web/IMG_20260425_141215683_HDR_PORTRAIT%20-%20Durga%20vyshnavi%20Lingamneni.jpg", linkedin: "https://linkedin.com/in/durga-vyshnavi-lingamneni-a463a034a" },
				{ name: "Neha Latha", role: "Web Member", initials: "NL", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Web/photo%20-%20Neha%20Latha.png", linkedin: "https://www.linkedin.com/in/meka-neha-latha-89744634a" },
				{ name: "Yasaswini Gorrepati", role: "Web Member", initials: "YG", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Web/Screenshot%202026-08-15%20164723%20-%20yasaswini%20Gorrepati.png", linkedin: "https://www.linkedin.com/in/yasaswini-gorrepati-643572399" },
				{ name: "Revant Akurathi", role: "Web Member", initials: "RA", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Web/MY%20PHOTO%20-%20REVANT%20AKURATHI.png", github: "https://github.com/revantak162-png", linkedin: "https://www.linkedin.com/in/revant-akurathi-641a33393/?isSelfProfile=true" },
				{ name: "Santosh Reddi", role: "Web Member", initials: "SR", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Web/mine.jpg", github: "https://github.com/santoshreddi-631", linkedin: "https://www.linkedin.com/in/santoshreddi-22614cm003/" },

			]
		},
		{
			section: "Events",
			description:
				"The events team conceptualizes and executes all IIC programs including hackathons, workshops, competitions, and seminars. They handle logistics, vendor coordination, participant management, and ensure every event creates memorable learning experiences that inspire innovation.",
			reverse: true,
			members: [
				{ name: "Chaitanya", role: "Events Head", initials: "CVB", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/Screenshot%202026-08-18%20005149.png", imgStyle: { objectPosition: "center" } },
				{ name: "Dharani Jagarlamudi", role: "Events Member", initials: "DJ", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/20260816_113331%20-%20Dharani%20Jagarlamudi.jpg", imgStyle: { objectPosition: "center" } },
				{ name: "Likitha Boppudi", role: "Events Member", initials: "LB", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/Screenshot%202026-08-17%20225555.png", imgStyle: { objectPosition: "center" } },
				{ name: "Prasanna Kumari", role: "Events Member", initials: "PK", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/compressed_1786792866129%20-%20Prasanna%20Kumari.jpg", imgStyle: { objectPosition: "center" } },
				{ name: "Leelasaikrishna", role: "Events Member", initials: "L", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/file_00000000587082119c2b50b1d7b0fd21%20-%20Leelasaikrishna.png", imgStyle: { objectPosition: "center" } },
				{ name: "Sindhu", role: "Events Member", initials: "S", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/file_000000005a78821192be44bb35ba792d%20-%20Sindhu_0902.png", imgStyle: { objectPosition: "center" } },
				{ name: "Shabana Shaik", role: "Events Member", initials: "SS", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/iic%20-%20Shabana%20Shaik.png", imgStyle: { objectPosition: "center" } },
				{ name: "Bhaeru Nutakki", role: "Events Member", initials: "BN", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/IMG-20260113-WA2599%20-%20Bhaeru%20Nutakki.jpg", imgStyle: { objectPosition: "center" } },
				{ name: "Srujana Nanduri", role: "Events Member", initials: "SN", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/IMG-20260815-WA0016%20-%20Srujana%20Nanduri.jpg", imgStyle: { objectPosition: "center" } },
				{ name: "Akhilesh Kamineni", role: "Events Member", initials: "AK", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/IMG-20260816-WA0002%20-%20Akhilesh%20Kamineni.jpg", imgStyle: { objectPosition: "top" } },
				{ name: "Saran M", role: "Events Member", initials: "SM", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/IMG_20260730_133105%20-%20Saran%20.m.jpg", imgStyle: { objectPosition: "center" } },
				{ name: "Aaradhya Guntupalli", role: "Events Member", initials: "AG", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/IMG_20260815_163750%20-%20Aaradhya%20Guntupalli.jpg", imgStyle: { objectPosition: "center" } },
				{ name: "Kandula Meghana", role: "Events Member", initials: "KM", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/Kandula%20Meghana.png", imgStyle: { objectPosition: "center" } },
				{ name: "Keerthana Varra", role: "Events Member", initials: "KV", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/Kphoto_10MB-1%20-%20Keerthana%20Varra.jpg", imgStyle: { objectPosition: "center" } },
				{ name: "Gayathri Veeranki", role: "Events Member", initials: "GV", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/photo_10mb-3%20-%20Gayathri%20Veeranki.jpg", imgStyle: { objectPosition: "center" } },
				{ name: "Spandana", role: "Events Member", initials: "S", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/Screenshot_2025-10-07-21-52-37-925_com.miui.gallery%20-%20Spandana%20Spandana.jpg", imgStyle: { objectPosition: "center" } },
				{ name: "Aparna Devisetty", role: "Events Member", initials: "AD", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/Events/IMG_20260816_083557%20-%20Aparna%20Devisetty.jpg", imgStyle: { objectPosition: "center 15%", transform: "scale(1.25)" } }
			]
		},
		{
			section: "Review & Validation",
			description:
				"The Review & Validation team is responsible for ensuring quality, reviewing content, and validating processes to maintain high standards across all IIC activities.",
			reverse: true,
			members: [
				{ name: "Lekhana Chowdary Talluri", role: "Review & Validation", initials: "LT", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/R&V/d45f8fd8-8900-4661-aada-59be1c0d9798%20-%20Lekhana%20chowdary%20Talluri.jpeg", imgStyle: { objectPosition: "center" } },
				{ name: "Lakshmi Appikatla", role: "Review & Validation", initials: "LA", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/R&V/file_0000000091888211af1f52284578601f%20-%20Lakshmi%20Appikatla.png", imgStyle: { objectPosition: "center" } },
				{ name: "Abhi Battula", role: "Review & Validation Head", initials: "AB", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/R&V/file_00000000a0d482119a4b5b6ae9534e22%20-%20Abhi%20Battula.png", imgStyle: { objectPosition: "center" } },
				{ name: "Srujana Nanduri", role: "Review & Validation", initials: "SN", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/R&V/file_00000000c0e882119e1ea1866146ddce%20-%20Srujana%20Nanduri.png", imgStyle: { objectPosition: "center" } },
				{ name: "Avinash Kaja", role: "Review & Validation", initials: "AK", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/R&V/IMG_20260815_172624%20-%20Avinash%20Kaja.png", imgStyle: { objectPosition: "center" } },
				{ name: "Mohana Vaddi", role: "Review & Validation", initials: "MV", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/R&V/IMG_20260816_082036%20-%20mohana26%20vaddi.jpg", imgStyle: { objectPosition: "center" } },
				{ name: "Sai Spurthi Kalam", role: "Review & Validation", initials: "SK", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/R&V/r&v%20id%20-%20Sai%20Spurthi%20Kalam.jpg", imgStyle: { objectPosition: "center" } },
				{ name: "R&V Member", role: "Review & Validation", initials: "RM", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/R&V/Screenshot%202026-08-17%20191458.png", imgStyle: { objectPosition: "center" } },
				{ name: "R&V Member", role: "Review & Validation", initials: "RM", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/R&V/Screenshot%202026-08-17%20191612.png", imgStyle: { objectPosition: "center" } },
				{ name: "R&V Member", role: "Review & Validation", initials: "RM", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/R&V/Screenshot%202026-08-17%20225501.png", imgStyle: { objectPosition: "center" } },
				{ name: "Sudheerkumar Karra", role: "Review & Validation", initials: "SK", image: "https://pgoezyvozcnkfiwrknmx.supabase.co/storage/v1/object/public/R&V/Screenshot_2025-11-22-13-41-09-50_99c04817c0de5652397fc8b56c3b3817%20-%20Sudheerkumar%20Karra.jpg", imgStyle: { objectPosition: "center" } }
			]
		}

	]
};

const teamData2025 = {
	team: [
		{
			section: "Draft Department",
			description:
				"The Draft Department supports IIC communication by preparing clear, structured content for initiatives, events, and official updates.",
			reverse: false,
			members: [
				{ name: "Keerthi", initials: "K", image: "/teams/draft/keerthi.png" },
				{ name: "Lakshmi", initials: "L", image: "/teams/draft/lakshmi.png" },
				{ name: "Narayana", initials: "N", image: "/teams/draft/narayana.png" },
				{ name: "Srujuna", initials: "S", image: "/teams/draft/srujuna.png" },
			],
		},
		{
			section: "Event Department",
			description:
				"The Event Department plans and coordinates IIC programs, managing activities and execution to create engaging experiences for participants.",
			reverse: true,
			members: [
				{ name: "Jyothi", initials: "J", image: "/teams/event/jyothi.png" },
				{ name: "Kalyan", initials: "K", image: "/teams/event/kalyan.png" },
				{ name: "Prasanna", initials: "P", image: "/teams/event/prasanna.png" },
				{ name: "Shabana", initials: "S", image: "/teams/event/shabana.png" },
				{ name: "V Chaitu", initials: "VC", image: "/teams/event/vchaitu.png" },
				{ name: "Veera", initials: "V", image: "/teams/event/veera.png" },
			],
		},
		{
			section: "Public Relations Department",
			description:
				"The Public Relations Department supports IIC outreach, communication, and engagement while helping build strong connections with the wider community.",
			reverse: false,
			members: [
				{ name: "Bindu", initials: "B", image: "/teams/pr/bindu.png" },
				{ name: "Jessy", initials: "J", image: "/teams/pr/jessy.png" },
				{ name: "Nikhila", initials: "N", image: "/teams/pr/nikhila.png" },
				{ name: "Nithin", initials: "N", image: "/teams/pr/nithin.png" },
				{ name: "Rohit", initials: "R", image: "/teams/pr/rohit.png" },
				{ name: "Subhani", initials: "S", image: "/teams/pr/subhani.png" },
				{ name: "Udvika", initials: "U", image: "/teams/pr/udvika.png" },
			],
		},
		{
			section: "Social Media Department",
			description:
				"The Social Media Department shares IIC activities and achievements through engaging digital content while maintaining clear and consistent communication.",
			reverse: true,
			members: [
				{ name: "Dinesh", initials: "D", image: "/teams/socialmedia/dinesh.png" },
				{ name: "Jagadish", initials: "J", image: "/teams/socialmedia/jagadish.png" },
				{ name: "Jayanth", initials: "J", image: "/teams/socialmedia/jayanth.png" },
				{ name: "Manasa", initials: "M", image: "/teams/socialmedia/manasa.png" },
				{ name: "Murali", initials: "M", image: "/teams/socialmedia/murali.png" },
				{ name: "Thanuja", initials: "T", image: "/teams/socialmedia/thanuja.png" },
			],
		},
		{
			section: "Web Development",
			description:
				"The Web Development team builds and maintains IIC's digital presence, creating accessible and responsive experiences for the community.",
			reverse: false,
			members: [
				{ name: "Chaitu", initials: "C", image: "/teams/web/chaitu.png" },
				{ name: "Harsha", initials: "H", image: "/teams/web/harsha.png" },
				{ name: "Navya", initials: "N", image: "/teams/web/navya.png" },
				{ name: "Sarika", initials: "S", image: "/teams/web/sarika.png" },
			],
		},
	],
};

function LinkedInIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M5.32 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.1 20.45H3.54V8.99H7.1v11.46Zm13.35 0h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.99h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28Z" />
		</svg>
	);
}

function GitHubIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 .7A11.5 11.5 0 0 0 8.36 23.1c.58.1.79-.25.79-.56v-2.02c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.3-5.27-1.29-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.71 5.39-5.29 5.68.42.36.79 1.07.79 2.16v3.04c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
		</svg>
	);
}

function MemberCard({ member, index, department, year }) {
	const linkedinUrl =
		member.linkedin ||
		`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(member.name)}`;
	const githubUrl =
		member.github ||
		`https://github.com/search?q=${encodeURIComponent(member.name)}&type=users`;
	const isWebDevelopmentMember = department === "Web Development";
	const isCoordinator = department === "IIC Co-ordinators";
	const isArchiveMember = year === "2025";

	return (
		<article
			className={`${styles.memberCard} ${isArchiveMember ? styles.archiveCard : ""} ${
				isCoordinator ? styles.coordinatorCard : ""
			}`}
			style={{ "--card-delay": `${Math.min(index, 7) * 70}ms` }}
		>
			<figure className={styles.memberFigure}>
				<span className={styles.memberInitials} aria-hidden="true">
					{member.initials}
				</span>
				<img
					src={member.image?.trim()}
					alt={member.name}
					className={styles.memberImage}
					style={member.imgStyle}
					loading="lazy"
					onLoad={(event) => {
						const image = event.currentTarget;
						const ratio = image.naturalWidth / image.naturalHeight;
						image.dataset.orientation =
							ratio > 1.25 ? "landscape" : ratio < 0.8 ? "portrait" : "standard";
					}}
					onError={(event) => {
						event.currentTarget.hidden = true;
					}}
				/>
			</figure>
			<div className={styles.memberBody}>
				<div className={styles.memberHeader}>
					<h3 className={styles.memberName}>{member.name}</h3>
					{!isArchiveMember && (
						<p className={styles.memberDepartment}>{member.role}</p>
					)}
				</div>
				{!isArchiveMember && (
					<div className={styles.memberMeta}>
						{!isCoordinator && (
							<>
								<div>
									<span>Year</span>
									<strong>{member.year || "—"}</strong>
								</div>
								<div>
									<span>Branch</span>
									<strong>{member.branch || "—"}</strong>
								</div>
							</>
						)}
						<a
							className={styles.socialLink}
							href={linkedinUrl}
							target="_blank"
							rel="noreferrer"
							aria-label={`Find ${member.name} on LinkedIn`}
						>
							<LinkedInIcon />
						</a>
						{isWebDevelopmentMember && (
							<a
								className={styles.socialLink}
								href={githubUrl}
								target="_blank"
								rel="noreferrer"
								aria-label={`Find ${member.name} on GitHub`}
							>
								<GitHubIcon />
							</a>
						)}
					</div>
				)}
			</div>
		</article>
	);
}

function TeamSection({ section, index, year }) {
	const sectionRef = React.useRef(null);
	const railRef = React.useRef(null);

	React.useEffect(() => {
		const element = sectionRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					element.classList.add(styles.visible);
					observer.disconnect();
				}
			},
			{ threshold: 0.12 },
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const scroll = (direction) => {
		railRef.current?.scrollBy({ left: direction * 290, behavior: "smooth" });
	};

	return (
		<section
			ref={sectionRef}
			className={`${styles.teamSection} ${section.reverse ? styles.reverse : ""}`}
			aria-labelledby={`team-${index}`}
		>
			<div className={styles.sectionHeading}>
				<div className={styles.sectionNumber}>{String(index + 1).padStart(2, "0")}</div>
				<div className={styles.sectionText}>
					<p className={styles.eyebrow}>VVITU IIC • Team Directory</p>
					<h2 id={`team-${index}`}>{section.section}</h2>
					<p>{section.description}</p>
				</div>
			</div>

			<div className={`${styles.railShell} ${section.members.length > 3 ? styles.withArrows : ""}`}>
				<button
					className={`${styles.railButton} ${styles.previous}`}
					onClick={() => scroll(-1)}
					aria-label={`View previous ${section.section} members`}
				>
					<span aria-hidden="true">‹</span>
				</button>
				<div
					className={`${styles.memberRail} ${section.members.length <= 3 ? styles.centered : ""}`}
					ref={railRef}
				>
					{section.members.map((member, memberIndex) => (
						<MemberCard
							key={`${member.name}-${memberIndex}`}
							member={member}
							index={memberIndex}
							department={section.section}
							year={year}
						/>
					))}
				</div>
				<button
					className={`${styles.railButton} ${styles.next}`}
					onClick={() => scroll(1)}
					aria-label={`View more ${section.section} members`}
				>
					<span aria-hidden="true">›</span>
				</button>
			</div>
			<p className={styles.scrollHint}>Scroll or use the arrows to meet the team</p>
		</section>
	);
}

function YearFilter({ selectedYear, onChange }) {
	const [isOpen, setIsOpen] = React.useState(false);

	const chooseYear = (year) => {
		onChange(year);
		setIsOpen(false);
	};

	return (
		<div className={styles.yearFilter}>
			<button
				type="button"
				className={styles.yearFilterButton}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((open) => !open)}
			>
				<span>Year</span>
				<strong>{selectedYear}</strong>
				<i aria-hidden="true">
					<svg viewBox="0 0 20 20">
						<path d="M5 7.5 10 12.5 15 7.5" />
					</svg>
				</i>
			</button>
			{isOpen && (
				<div className={styles.yearMenu} role="listbox" aria-label="Select team year">
					{["2026", "2025"].map((year) => (
						<button
							type="button"
							key={year}
							role="option"
							aria-selected={selectedYear === year}
							className={selectedYear === year ? styles.selectedYear : ""}
							onClick={() => chooseYear(year)}
						>
							{year}
							{selectedYear === year && <span aria-hidden="true">✓</span>}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default function Teams() {
	const [selectedYear, setSelectedYear] = React.useState("2026");
	const [typedQuote, setTypedQuote] = React.useState("");
	const [typingFinished, setTypingFinished] = React.useState(false);

	React.useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setTypedQuote(TEAM_QUOTE);
			setTypingFinished(true);
			return undefined;
		}

		if (typingFinished) return undefined;
		if (typedQuote.length >= TEAM_QUOTE.length) {
			setTypingFinished(true);
			return undefined;
		}

		const timer = window.setTimeout(() => {
			setTypedQuote(TEAM_QUOTE.slice(0, typedQuote.length + 1));
		}, 32);

		return () => window.clearTimeout(timer);
	}, [typedQuote, typingFinished]);

	return (
		<div className={styles.wrap}>
			<main className={styles.main}>
				<div className={styles.intro}>
					<p>Our Teams</p>
					<h2 aria-label={TEAM_QUOTE}>
						{typedQuote}
						{!typingFinished && (
							<span className={styles.quoteCursor} aria-hidden="true" />
						)}
					</h2>
				</div>

				<div className={styles.teamDirectory}>
					<YearFilter selectedYear={selectedYear} onChange={setSelectedYear} />
					{selectedYear === "2026" ? (
						teamData.team.map((section, index) => (
							<TeamSection
								key={section.section}
								section={section}
								index={index}
								year="2026"
							/>
						))
					) : (
						teamData2025.team.map((section, index) => (
							<TeamSection
								key={section.section}
								section={section}
								index={index}
								year="2025"
							/>
						))
					)}
				</div>
			</main>
		</div>
	);
}
